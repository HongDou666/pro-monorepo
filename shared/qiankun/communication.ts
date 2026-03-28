/**
 * qiankun 主子应用通信共享协议。
 *
 * 这里统一约束三件事：
 * 1. 哪些子应用参与主子通信。
 * 2. 消息结构和消息类型长什么样。
 * 3. qiankun global state 在主应用与子应用之间如何组织。
 *
 * 这样主应用页面、React 子应用和 Vue 子应用都只依赖这一份协议，
 * 后续如果要增加字段或扩展消息类型，只需要在这里集中演进。
 */
export const QIANKUN_SUB_APP_NAMES = ["qiankun-vite-vue", "qiankun-vite-react"] as const;

export type QiankunSubAppName = (typeof QIANKUN_SUB_APP_NAMES)[number];
export type QiankunMessageSource = "main" | QiankunSubAppName;

// 与 micro-app 版本保持同一套事件语义，便于主子应用面板表现一致。
export const QIANKUN_MESSAGE_TYPE = {
  MAIN_GREETING: "main.greeting",
  SUB_REPLY: "sub.reply"
} as const;

export type QiankunMessageType = (typeof QIANKUN_MESSAGE_TYPE)[keyof typeof QIANKUN_MESSAGE_TYPE];

export interface QiankunMessage<TPayload = Record<string, unknown>> {
  source: QiankunMessageSource;
  type: QiankunMessageType;
  timestamp: number;
  traceId: string;
  payload: TPayload;
  [key: string]: unknown;
}

/**
 * qiankun global state 的第一层结构。
 *
 * 注意 qiankun 只允许修改初始化时声明过的第一层 key，
 * 所以这里必须预先把 activeApp、mainToSubApp、subAppToMain 三个桶声明完整。
 */
export interface QiankunCommunicationState {
  activeApp: QiankunSubAppName | null;
  mainToSubApp: Record<QiankunSubAppName, QiankunMessage | null>;
  subAppToMain: Record<QiankunSubAppName, QiankunMessage | null>;
}

// 统一补齐消息公共字段，业务层只需要提供来源、类型和 payload。
export function createQiankunMessage<TPayload>(
  source: QiankunMessageSource,
  type: QiankunMessageType,
  payload: TPayload
): QiankunMessage<TPayload> {
  return {
    source,
    type,
    timestamp: Date.now(),
    traceId: createTraceId(source, type),
    payload
  };
}

// 调试面板统一使用格式化后的 JSON 字符串，便于直接在 UI 中阅读。
export function formatQiankunMessage(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

// 初始化时必须把每个子应用的消息槽位都创建出来，后续 setGlobalState 才能合法更新。
export function createInitialQiankunCommunicationState(): QiankunCommunicationState {
  return {
    activeApp: null,
    mainToSubApp: {
      "qiankun-vite-vue": null,
      "qiankun-vite-react": null
    },
    subAppToMain: {
      "qiankun-vite-vue": null,
      "qiankun-vite-react": null
    }
  };
}

/**
 * 把外部传入的未知 global state 整理成完整结构。
 *
 * 场景包括：
 * 1. 主应用首次挂载时拿到的初始值。
 * 2. 子应用运行时回调里拿到的 state / prevState。
 * 3. 某些字段缺失或被错误覆盖时的兜底修复。
 */
export function normalizeQiankunCommunicationState(state?: Record<string, unknown> | null): QiankunCommunicationState {
  const initialState = createInitialQiankunCommunicationState();
  const nextState = state ?? {};
  const mainToSubApp = nextState.mainToSubApp as Partial<Record<QiankunSubAppName, QiankunMessage | null>> | undefined;
  const subAppToMain = nextState.subAppToMain as Partial<Record<QiankunSubAppName, QiankunMessage | null>> | undefined;

  return {
    activeApp: isQiankunSubAppName(nextState.activeApp) ? nextState.activeApp : initialState.activeApp,
    mainToSubApp: {
      ...initialState.mainToSubApp,
      ...mainToSubApp
    },
    subAppToMain: {
      ...initialState.subAppToMain,
      ...subAppToMain
    }
  };
}

// 构建“主应用 -> 子应用”方向的下一个 state，同时保留其他桶的现有内容。
export function buildMainToSubAppState(
  state: QiankunCommunicationState,
  targetApp: QiankunSubAppName,
  nextMessage: QiankunMessage
): QiankunCommunicationState {
  const normalizedState = normalizeQiankunCommunicationState(state as unknown as Record<string, unknown>);

  return {
    ...normalizedState,
    activeApp: targetApp,
    mainToSubApp: {
      ...normalizedState.mainToSubApp,
      [targetApp]: nextMessage
    }
  };
}

// 构建“子应用 -> 主应用”方向的下一个 state，同时保留其他桶的现有内容。
export function buildSubAppToMainState(
  state: QiankunCommunicationState,
  sourceApp: QiankunSubAppName,
  nextMessage: QiankunMessage
): QiankunCommunicationState {
  const normalizedState = normalizeQiankunCommunicationState(state as unknown as Record<string, unknown>);

  return {
    ...normalizedState,
    activeApp: sourceApp,
    subAppToMain: {
      ...normalizedState.subAppToMain,
      [sourceApp]: nextMessage
    }
  };
}

// 取主应用最近一次发给指定子应用的消息。
export function getLatestMainToSubAppMessage(state: QiankunCommunicationState, targetApp: QiankunSubAppName) {
  return state.mainToSubApp[targetApp];
}

// 取指定子应用最近一次回传给主应用的消息。
export function getLatestSubAppToMainMessage(state: QiankunCommunicationState, sourceApp: QiankunSubAppName) {
  return state.subAppToMain[sourceApp];
}

// qiankun state 是对象快照，这里通过 traceId 判断是否真的是一条新消息。
export function hasQiankunMessageChanged(nextMessage: QiankunMessage | null, prevMessage: QiankunMessage | null) {
  return Boolean(nextMessage && nextMessage.traceId !== prevMessage?.traceId);
}

// 运行时防守：只接受协议里约定的子应用名字。
function isQiankunSubAppName(value: unknown): value is QiankunSubAppName {
  return typeof value === "string" && (QIANKUN_SUB_APP_NAMES as readonly string[]).includes(value);
}

// traceId 既用于 UI 判重，也便于联调时从日志快速串起一次消息流转。
function createTraceId(source: QiankunMessageSource, type: QiankunMessageType): string {
  return `${source}:${type}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}
