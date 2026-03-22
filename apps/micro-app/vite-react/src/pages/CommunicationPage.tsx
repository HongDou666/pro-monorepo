/**
 * React 子应用通信页。
 *
 * 这里集中放置 antd 组件和通信逻辑，并通过 lazy route 按需下载。
 */
import { useEffect, useState } from "react";
import { Button, Card, Divider, Empty, Space, message } from "antd";
import {
  createMicroAppMessage,
  formatMicroAppMessage,
  isMicroAppRuntime,
  MICRO_APP_MESSAGE_TYPE
} from "../../../../../shared/micro-app/communication";

function CommunicationPage() {
  const [receivedData, setReceivedData] = useState<string>("");

  const sendDataToMain = () => {
    if (!isMicroAppRuntime(window)) {
      message.warning("当前不是 micro-app 运行环境，无法回传主应用数据");

      return;
    }

    const data = createMicroAppMessage("vite-react", MICRO_APP_MESSAGE_TYPE.SUB_REPLY, {
      text: "来自子应用 vite-react 的问候"
    });

    window.microApp.dispatch(data as unknown as Record<PropertyKey, unknown>);
    message.success("数据已发送到主应用");
  };

  useEffect(() => {
    if (!isMicroAppRuntime(window)) {
      return;
    }

    const microAppWindow = window.microApp;

    const handleMainAppData = (data: Record<PropertyKey, unknown>) => {
      console.log("[子应用] 收到主应用数据:", data);
      setReceivedData(formatMicroAppMessage(data));
      message.info("收到主应用数据");
    };

    microAppWindow.addDataListener(handleMainAppData, true);

    return () => {
      microAppWindow.removeDataListener(handleMainAppData);
    };
  }, []);

  return (
    <section className="communication-page">
      <Card title="数据通信" className="communication-page__card">
        <Space direction="vertical" style={{ width: "100%" }}>
          <Button type="primary" onClick={sendDataToMain}>
            发送数据到主应用
          </Button>

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
