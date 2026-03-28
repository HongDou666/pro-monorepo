/**
 * React qiankun 子应用通信适配层。
 *
 * 页面组件不直接操作 props.onGlobalStateChange / props.setGlobalState，
 * 而是统一通过这里读写，这样页面层只关心“发送消息”和“订阅消息”。
 */
import type { QiankunProps } from "vite-plugin-qiankun/dist/helper";
import {
  buildSubAppToMainState,
  createInitialQiankunCommunicationState,
  createQiankunMessage,
  getLatestMainToSubAppMessage,
  hasQiankunMessageChanged,
  normalizeQiankunCommunicationState,
  QIANKUN_MESSAGE_TYPE,
  type QiankunCommunicationState,
  type QiankunMessage,
  type QiankunSubAppName
} from "../../../../shared/qiankun/communication";

type QiankunRuntimeActions = {
  onGlobalStateChange?: (
    callback: (state: Record<string, unknown>, prevState: Record<string, unknown>) => void,
    fireImmediately?: boolean
  ) => void;
  setGlobalState?: (state: Record<string, unknown>) => boolean;
  offGlobalStateChange?: () => boolean;
};

// 当前子应用实例拿到的 qiankun global state 动作集合。
let runtimeActions: QiankunRuntimeActions = {};
// 本地缓存最近一次 state，发送回主应用时需要基于它做合并更新。
let currentState: QiankunCommunicationState = createInitialQiankunCommunicationState();

// 在 mount/update 生命周期里注入运行时动作，供页面层复用。
export function setQiankunCommunicationActions(props: QiankunProps = {}) {
  runtimeActions = {
    onGlobalStateChange: props.onGlobalStateChange,
    setGlobalState: props.setGlobalState,
    offGlobalStateChange: props.offGlobalStateChange
  };
}

// 在 unmount 时清空动作和本地缓存，避免旧实例残留影响下一次挂载。
export function clearQiankunCommunicationActions() {
  runtimeActions = {};
  currentState = createInitialQiankunCommunicationState();
}

// 独立运行时没有 qiankun props，这里作为统一守卫给页面按钮和订阅流程使用。
export function isQiankunCommunicationRuntime() {
  return (
    typeof runtimeActions.onGlobalStateChange === "function" && typeof runtimeActions.setGlobalState === "function"
  );
}

/**
 * 发送“子应用 -> 主应用”的回传消息。
 *
 * 因为 qiankun 只允许更新初始化时存在的第一层 key，
 * 所以这里必须通过 buildSubAppToMainState 更新既有桶，而不是直接传任意对象。
 */
export function sendQiankunReplyToMain(appName: QiankunSubAppName, text: string) {
  if (!isQiankunCommunicationRuntime()) {
    return false;
  }

  const nextMessage = createQiankunMessage(appName, QIANKUN_MESSAGE_TYPE.SUB_REPLY, {
    text
  });
  const nextState = buildSubAppToMainState(currentState, appName, nextMessage);
  const didUpdate = runtimeActions.setGlobalState?.(nextState as unknown as Record<string, unknown>) ?? false;

  if (didUpdate) {
    currentState = nextState;
  }

  return didUpdate;
}

/**
 * 订阅主应用发给当前子应用的消息。
 *
 * 内部通过 traceId 判重，避免 fireImmediately 首次回放和后续同一条快照重复触发页面提示。
 */
export function subscribeToQiankunMainMessage(appName: QiankunSubAppName, callback: (message: QiankunMessage) => void) {
  if (!isQiankunCommunicationRuntime()) {
    return () => undefined;
  }

  let isFirstRun = true;

  runtimeActions.onGlobalStateChange?.((state, prevState) => {
    const nextState = normalizeQiankunCommunicationState(state);
    const previousState = normalizeQiankunCommunicationState(prevState);
    const nextMessage = getLatestMainToSubAppMessage(nextState, appName);
    const prevMessage = getLatestMainToSubAppMessage(previousState, appName);
    const shouldNotify = isFirstRun ? Boolean(nextMessage) : hasQiankunMessageChanged(nextMessage, prevMessage);

    currentState = nextState;
    isFirstRun = false;

    // 页面真正只消费属于自己的新消息。
    if (nextMessage && shouldNotify) {
      callback(nextMessage);
    }
  }, true);

  return () => {
    // qiankun 每个子应用只有一个激活监听器，清理时直接整体注销即可。
    runtimeActions.offGlobalStateChange?.();
  };
}
