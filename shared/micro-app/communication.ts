/**
 * 微前端通信共享协议。
 *
 * 设计目标：
 * 1. 主应用与子应用共用一套消息结构，避免各自维护一份隐式协议。
 * 2. 把消息类型、来源、格式化与运行环境判断收口，降低重复代码。
 * 3. 为后续扩展 traceId、ack、事件枚举等能力预留统一入口。
 */

export const MICRO_APP_NAMES = ["vite-vue", "vite-react"] as const;

// 已接入统一通信协议的子应用名称集合。
export type MicroAppName = (typeof MICRO_APP_NAMES)[number];
export type MicroAppSource = "main" | MicroAppName;

// 统一维护消息类型，避免主应用和子应用各自硬编码字符串。
export const MICRO_APP_MESSAGE_TYPE = {
  MAIN_GREETING: "main.greeting",
  SUB_REPLY: "sub.reply"
} as const;

export type MicroAppMessageType = (typeof MICRO_APP_MESSAGE_TYPE)[keyof typeof MICRO_APP_MESSAGE_TYPE];

// 标准消息结构。
// traceId 用于后续排查调用链，也方便扩展 ack / request-response 模型。
export interface MicroAppMessage<TPayload = Record<string, unknown>> {
  source: MicroAppSource;
  type: MicroAppMessageType;
  timestamp: number;
  traceId: string;
  payload: TPayload;
  [key: string]: unknown;
}

// 对 micro-app 运行时数据中心能力做最小抽象，避免业务层直接依赖第三方库的完整类型。
export interface MicroAppEventCenterLike {
  addDataListener: (callback: (data: Record<PropertyKey, unknown>) => void, autoTrigger?: boolean) => void;
  removeDataListener: (callback: (data: Record<PropertyKey, unknown>) => void) => void;
  dispatch: (data: Record<PropertyKey, unknown>) => void;
  getData: (fromBaseApp?: boolean) => Record<PropertyKey, unknown> | null;
  clearData: (fromBaseApp?: boolean) => void;
}

interface MicroAppWindowLike extends Window {
  __MICRO_APP_ENVIRONMENT__?: boolean;
  microApp?: MicroAppEventCenterLike;
}

// 创建标准消息对象，统一补齐时间戳和 traceId，避免调用方重复拼装公共字段。
export function createMicroAppMessage<TPayload>(
  source: MicroAppSource,
  type: MicroAppMessageType,
  payload: TPayload
): MicroAppMessage<TPayload> {
  return {
    source,
    type,
    timestamp: Date.now(),
    traceId: createTraceId(source, type),
    payload
  };
}

// 统一格式化输出，便于主应用和子应用在调试面板里保持一致展示。
export function formatMicroAppMessage(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

// 判断当前代码是否运行在 micro-app 容器中。
// 业务层应优先通过这个守卫再访问 window.microApp，避免独立运行时报错。
export function isMicroAppRuntime(
  target: MicroAppWindowLike
): target is Window & { __MICRO_APP_ENVIRONMENT__: true; microApp: MicroAppEventCenterLike } {
  return Boolean(target.__MICRO_APP_ENVIRONMENT__ && target.microApp);
}

// traceId 保持轻量且可读，便于开发环境下直接从日志定位消息来源。
function createTraceId(source: MicroAppSource, type: MicroAppMessageType): string {
  return `${source}:${type}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}
