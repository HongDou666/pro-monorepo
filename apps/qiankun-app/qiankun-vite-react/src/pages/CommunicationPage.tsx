import { useEffect, useState } from "react";
import { Button, Card, Divider, Empty, Space, message } from "antd";
import { formatQiankunMessage } from "../../../../../shared/qiankun/communication";
import {
  getQiankunContainerData,
  isQiankunCommunicationRuntime,
  sendQiankunReplyToMain,
  subscribeToQiankunMainMessage
} from "../qiankun-communication";

function CommunicationPage() {
  const [syncedContextData] = useState(() => getQiankunContainerData()?.value ?? "");
  // 这里始终只展示最近一次主应用下发给当前子应用的数据。
  const [receivedData, setReceivedData] = useState("");

  /**
   * 主动回传数据到主应用。
   *
   * 与 micro-app 版本一样，独立运行时不应该直接访问通信能力，
   * 因此按钮点击前先做运行环境守卫。
   */
  const sendDataToMain = () => {
    if (!isQiankunCommunicationRuntime()) {
      message.warning("当前不是 qiankun 运行环境，无法回传主应用数据");

      return;
    }

    const didUpdate = sendQiankunReplyToMain("qiankun-vite-react", "来自子应用 qiankun-vite-react 的问候");

    if (!didUpdate) {
      message.warning("数据发送失败，请稍后重试");

      return;
    }
  };

  useEffect(() => {
    if (!isQiankunCommunicationRuntime()) {
      return;
    }

    let hasHandledInitialMessage = false;

    // fireImmediately 对应的缓存回放与后续增量消息都由适配层统一处理。
    return subscribeToQiankunMainMessage("qiankun-vite-react", data => {
      console.log("[qiankun-vite-react] 收到主应用数据:", data);
      setReceivedData(formatQiankunMessage(data));

      if (!hasHandledInitialMessage) {
        hasHandledInitialMessage = true;

        return;
      }

      message.info("收到主应用数据");
    });
  }, []);

  return (
    <section className="communication-page">
      <Card title="数据通信" className="communication-page__card">
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button type="primary" onClick={sendDataToMain}>
            发送数据到主应用
          </Button>

          <Divider style={{ margin: "12px 0" }}>容器同步 data</Divider>

          {syncedContextData ? (
            <div className="communication-page__data">{syncedContextData}</div>
          ) : (
            <Empty description="暂无同步数据" imageStyle={{ height: 40 }} />
          )}

          <Divider style={{ margin: "12px 0" }}>接收到的数据</Divider>

          {receivedData ? (
            <div className="communication-page__data">
              <pre>{receivedData}</pre>
            </div>
          ) : (
            <Empty description="暂无数据" imageStyle={{ height: 40 }} />
          )}
        </Space>
      </Card>
    </section>
  );
}

export default CommunicationPage;
