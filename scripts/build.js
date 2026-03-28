import { getRollupConfigs, clearDist } from "./buildBase.js";
import { rollup } from "rollup";
import terser from "@rollup/plugin-terser";

/**
 * 构建所有 packages。
 *
 * 该脚本面向产物构建而不是开发监听，因此会：
 * 1. 先清空 dist。
 * 2. 使用 terser 压缩输出。
 * 3. 任一包失败立即退出，避免发布半成功状态。
 */
async function build() {
  const startTime = Date.now();
  const configs = await getRollupConfigs();

  for (const name in configs) {
    const config = configs[name];
    console.log(`📦 正在打包: ${name}`);

    try {
      // 每次构建前清理 dist，避免旧格式文件残留造成误导。
      clearDist(name);

      // 打包当前包，并行写出所有格式。
      const bundle = await rollup({
        input: config.input,
        plugins: [...config.plugins, terser()],
        external: config.external
      });

      await Promise.all(config.output.map(output => bundle.write(output)));

      console.log(`✅ ${name} 打包完成`);
    } catch (error) {
      console.error(`❌ ${name} 打包失败:`, error.message);
      process.exit(1);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n🎉 所有包构建完成，耗时 ${duration}s`);
}

// 作为脚本入口直接执行，不对外导出以免被业务误用。
build();
