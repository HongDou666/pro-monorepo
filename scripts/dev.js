import { getRollupConfigs } from "./buildBase.js";
import { watch } from "rollup";

/**
 * 启动监听模式构建
 */
async function dev() {
  const configs = await getRollupConfigs();

  console.log("🚀 启动监听模式...\n");

  for (const name in configs) {
    const config = configs[name];

    const watcher = watch(
      config.output.map(output => ({
        input: config.input,
        plugins: config.plugins,
        external: config.external,
        output,
        watch: config.watch
      }))
    );

    watcher.on("event", event => {
      switch (event.code) {
        case "START":
          console.log(`👁️ 开始监听: ${name}`);
          break;
        case "BUNDLE_START":
          console.log(`📦 正在打包: ${name}`);
          break;
        case "BUNDLE_END":
          console.log(`✅ ${name} 打包完成`);
          break;
        case "ERROR":
          console.error(`❌ ${name} 打包失败:`, event.error?.message || event.error);
          break;
      }
    });

    watcher.on("close", () => {
      console.log(`🛑 停止监听: ${name}`);
    });
  }
}

dev();
