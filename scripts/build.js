import { getRollupConfigs, clearDist } from "./buildBase.js";
import { rollup } from "rollup";
import terser from "@rollup/plugin-terser";

/**
 * 构建所有 packages
 */
async function build() {
  const startTime = Date.now();
  const configs = await getRollupConfigs();

  for (const name in configs) {
    const config = configs[name];
    console.log(`📦 正在打包: ${name}`);

    try {
      clearDist(name);

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

build();
