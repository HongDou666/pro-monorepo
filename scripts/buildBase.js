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
const packages = ["utils", "components", "axios"];

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
  const external = [
    ...new Set([...defaultExternal, ...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})])
  ];

  // IIFE 格式下需要提供全局变量名，便于浏览器直接消费。
  const globals = {
    ...defaultGlobals,
    axios: "axios"
  };

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
      sourcemap: true,
      globals,
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
