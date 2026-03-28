import { useState } from "react";
import { Button, Card, Space } from "antd";
import {
  fetchReactMicroHttpDemo,
  getReactMicroHttpCacheKeys,
  getReactMicroPendingRequestCount,
  type ReactMicroHttpDemoResponse
} from "../api/demo";
import { cancelReactMicroRequests } from "../api/http";

function HttpPage() {
  const [loading, setLoading] = useState(false);
  // 最近操作日志放在本地 state 中，便于观察缓存、取消和请求完成顺序。
  const [logs, setLogs] = useState<string[]>(["React 子应用可通过 src/api/http.ts 统一发起请求"]);
  const [responseData, setResponseData] = useState<ReactMicroHttpDemoResponse | null>(null);

  // 统一日志入口，避免各操作分散维护 setState 细节。
  const appendLog = (content: string) => {
    setLogs(current => [content, ...current].slice(0, 6));
  };

  /**
   * 读取演示接口。
   *
   * 这里通过切换缓存开关，让共享请求包的运行时覆盖能力在页面上可见。
   */
  const loadDemo = async (useCache: boolean) => {
    setLoading(true);

    try {
      const response = await fetchReactMicroHttpDemo({
        runtimeOptions: {
          cache: useCache ? { ttl: 12_000 } : false
        }
      });

      setResponseData(response.data);
      appendLog(
        `${useCache ? "缓存模式" : "直连模式"}请求完成，缓存条目 ${getReactMicroHttpCacheKeys().length}，待处理请求 ${getReactMicroPendingRequestCount()}`
      );
    } catch (error) {
      appendLog(`请求失败: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // 手动取消按钮用于演示实例级 cancelAllRequests 能力。
  const cancelRequests = () => {
    cancelReactMicroRequests("React micro http demo canceled manually");
    appendLog(`已取消未完成请求，当前待处理 ${getReactMicroPendingRequestCount()}`);
  };

  return (
    <section className="http-page">
      <div className="http-page__panel home-page__panel">
        <p className="http-page__eyebrow home-page__eyebrow">shared request client</p>
        <h2 className="http-page__title home-page__title">公共请求包示例</h2>
        <p className="http-page__desc home-page__desc">
          当前页面通过 <code>@pro-monorepo/axios</code> 创建的 React 子应用专属实例读取本地 mock 数据。
        </p>
      </div>

      <Card title="请求操作" className="http-page__card">
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Space wrap>
            <Button type="primary" loading={loading} onClick={() => loadDemo(true)}>
              读取缓存数据
            </Button>
            <Button loading={loading} onClick={() => loadDemo(false)}>
              绕过缓存请求
            </Button>
            <Button danger onClick={cancelRequests}>
              取消未完成请求
            </Button>
          </Space>

          <div className="http-page__result">
            {responseData ? (
              <pre>{JSON.stringify(responseData, null, 2)}</pre>
            ) : (
              <span>点击按钮读取 public/mock/http-demo.json。</span>
            )}
          </div>
        </Space>
      </Card>

      <Card title="最近操作" className="http-page__card">
        <ul className="http-page__logs">
          {logs.map(item => (
            <li key={item} className="http-page__logItem">
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

export default HttpPage;
