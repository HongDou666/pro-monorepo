import path from "node:path";
import URL from "node:url";
import fs from "node:fs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import vue from "@vitejs/plugin-vue";
import postcss from "rollup-plugin-postcss";

const __filename = URL.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** 需要构建的 package 列表 */
const packages = ["utils", "components"];

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
 * 获取所有 package 的根目录
 */
function getPackageRoots() {
  return packages.map(pkg => path.resolve(__dirname, "../packages", pkg));
}

/**
 * 读取 package.json
 * @param {string} root package 根目录
 */
async function readPackageJson(root) {
  const jsonPath = path.resolve(root, "package.json");
  const content = await fs.promises.readFile(jsonPath, "utf-8");
  return JSON.parse(content);
}

/**
 * 生成 Rollup 构建配置
 * @param {string} root package 根目录
 */
async function getRollupConfig(root) {
  const pkg = await readPackageJson(root);
  const { name, formats } = pkg.buildOptions || {};
  const dist = path.resolve(root, "./dist");
  const entry = path.resolve(root, "./src/index.ts");
  const tsconfig = path.resolve(root, "tsconfig.json");

  // 合并外部依赖
  const external = [...defaultExternal];

  // 合并全局变量映射
  const globals = { ...defaultGlobals };

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
 * 获取所有 package 的 Rollup 构建配置
 */
export async function getRollupConfigs() {
  const roots = getPackageRoots();
  const configs = await Promise.all(roots.map(getRollupConfig));
  return Object.fromEntries(packages.map((pkg, i) => [pkg, configs[i]]));
}

/**
 * 清空 dist 目录
 * @param {string} name package 名称
 */
export function clearDist(name) {
  const dist = path.resolve(__dirname, "../packages", name, "dist");
  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true });
  }
}
