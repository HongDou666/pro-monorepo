import path from "node:path";
import URL from "node:url";
import fs from "node:fs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import vue from "@vitejs/plugin-vue";
import postcss from "rollup-plugin-postcss";

// 基础构建工具：负责把 packages 下的公共包统一转换为 Rollup 配置。
const __filename = URL.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** 需要构建的 package 列表 */
const packages = ["utils", "components", "axios", "mock"];

/** 默认外部依赖 */
const defaultExternal = ["vue", "ant-design-vue", "@ant-design/icons-vue", "dayjs"];

/** 默认全局变量映射 */
const defaultGlobals = {
  vue: "Vue",
  "ant-design-vue": "antd",
  "@ant-design/icons-vue": "iconsVue",
  dayjs: "dayjs"
};

/**
 * 判断模块 id 是否命中某个 external 包。
 *
 * 这里不能只判断 `id === packageName`，因为当前 components 包已经改成了
 * `ant-design-vue/es/...` 这类深路径导入。如果只按精确包名匹配：
 * - `ant-design-vue` 会被 external
 * - `ant-design-vue/es/button` 却会继续被 Rollup 打进产物
 *
 * 这也是前面 package 构建里出现一长串 ant-design-vue 警告的根因。
 * 因此这里统一把“包名本身”和“包名下的任意子路径”都视为同一个 external 依赖。
 */
function matchesExternalPackage(id, packageName) {
  return id === packageName || id.startsWith(`${packageName}/`);
}

/**
 * 判断当前模块是否应该作为 external 保留在产物外部。
 *
 * 目标是保证 packages 的 ESM/CJS 产物只输出“对外部依赖的引用”，
 * 而不是把 Vue、Ant Design Vue、dayjs、axios 等第三方库再次打包进去。
 *
 * 这样做的直接收益：
 * 1. 避免 workspace 包各自内联一份相同依赖，导致重复体积。
 * 2. 减少组件库构建时来自第三方库内部实现的噪声警告。
 * 3. 让消费方决定这些基础依赖的最终版本与缓存策略。
 */
function isExternalDependency(id, externalPackages) {
  return externalPackages.some(packageName => matchesExternalPackage(id, packageName));
}

/**
 * 为 IIFE 构建格式解析外部依赖对应的全局变量名。
 *
 * ESM/CJS 产物只需要保留 import/require；
 * 但 IIFE 产物没有模块系统，需要告诉 Rollup：
 * “如果某个依赖被 external 掉，浏览器环境里应该从哪个全局变量读取它”。
 *
 * 这里同样支持深路径导入：
 * - `ant-design-vue`
 * - `ant-design-vue/es/button`
 * - `ant-design-vue/es/message`
 *
 * 它们最终都映射到同一个全局对象 `antd`，避免因为深路径导入而错误生成多个 globals 配置。
 */
function resolveGlobalName(id) {
  if (matchesExternalPackage(id, "vue")) {
    return defaultGlobals.vue;
  }

  if (matchesExternalPackage(id, "ant-design-vue")) {
    return defaultGlobals["ant-design-vue"];
  }

  if (matchesExternalPackage(id, "@ant-design/icons-vue")) {
    return defaultGlobals["@ant-design/icons-vue"];
  }

  if (matchesExternalPackage(id, "dayjs")) {
    return defaultGlobals.dayjs;
  }

  if (matchesExternalPackage(id, "axios")) {
    return "axios";
  }

  return id;
}

/**
 * 返回需要参与构建的 package 根目录列表。
 *
 * 这里显式维护 packages 数组，而不是扫描整个目录，
 * 目的是让构建范围保持可控，避免临时目录或实验包被误打包。
 */
function getPackageRoots() {
  return packages.map(pkg => path.resolve(__dirname, "../packages", pkg));
}

/**
 * 读取单个 package 的 package.json。
 * @param {string} root package 根目录
 */
async function readPackageJson(root) {
  const jsonPath = path.resolve(root, "package.json");
  const content = await fs.promises.readFile(jsonPath, "utf-8");
  return JSON.parse(content);
}

/**
 * 生成单个 package 的 Rollup 构建配置。
 *
 * 这里把 TS、Vue SFC、CommonJS、样式处理统一折叠成一套约定，
 * 让 packages 下不同类型的包共享同一条构建链路。
 * @param {string} root package 根目录
 */
async function getRollupConfig(root) {
  const pkg = await readPackageJson(root);
  const { name, formats } = pkg.buildOptions || {};
  const dist = path.resolve(root, "./dist");
  const entry = path.resolve(root, "./src/index.ts");
  const tsconfig = path.resolve(root, "tsconfig.json");

  // 将 dependencies 与 peerDependencies 都视为 external，避免重复打进产物。
  // 注意这里得到的是“包名清单”，真正匹配逻辑交给 isExternalDependency，
  // 因为深路径导入也要一并 external 掉。
  const externalPackages = [
    ...new Set([...defaultExternal, ...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})])
  ];

  // 使用函数形式而不是静态数组，是为了让 Rollup 在解析到 `foo/bar` 这类子路径时
  // 也能正确命中 external 规则，而不是只识别顶层包名。
  const external = id => isExternalDependency(id, externalPackages);

  const rollupOptions = {
    input: entry,
    external,
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig,
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
            declarationDir: dist
          }
        }
      }),
      vue({
        template: {
          compilerOptions: {
            nodeTransforms: [
              node => {
                // 移除测试属性，避免把测试专用标记带入组件库正式产物。
                if (node.type === 1 && Array.isArray(node.props)) {
                  node.props = node.props.filter(prop => !(prop.type === 6 && prop.name === "data-testid"));
                }
              }
            ]
          }
        }
      }),
      postcss()
    ],
    output: formats.map(format => ({
      format,
      file: path.resolve(dist, `index.${format}.js`),
      // packages 当前对外只暴露单入口文件，遇到动态 import 时直接内联，
      // 避免生成额外 chunk 破坏 package.json 里的 exports/main/module 约定。
      inlineDynamicImports: true,
      sourcemap: true,
      // IIFE 下如果 external 了第三方库，需要通过全局变量名继续消费它；
      // ESM/CJS 虽然也会读取这个字段，但不会影响模块导入结果。
      globals: resolveGlobalName,
      ...(format === "iife" && { name })
    })),
    watch: {
      include: path.resolve(root, "src/**"),
      exclude: path.resolve(root, "node_modules/**"),
      clearScreen: false
    }
  };

  return rollupOptions;
}

/**
 * 聚合全部 package 的 Rollup 配置，并以包名为 key 返回。
 */
export async function getRollupConfigs() {
  const roots = getPackageRoots();
  const configs = await Promise.all(roots.map(getRollupConfig));
  return Object.fromEntries(packages.map((pkg, i) => [pkg, configs[i]]));
}

/**
 * 清空指定 package 的 dist 目录。
 *
 * 使用 force 选项是为了在目录不存在时保持幂等，不额外增加判断分支。
 * @param {string} name package 名称
 */
export function clearDist(name) {
  const dist = path.resolve(__dirname, "../packages", name, "dist");
  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true });
  }
}
