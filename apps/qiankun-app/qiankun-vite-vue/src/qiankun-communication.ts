/**
 * Vue qiankun 子应用通信适配层。
 *
 * 实现与 React 子应用保持一致，目的是让两个子应用共享同一套协议和页面行为，
 * 只在 UI 框架层保留 Vue / React 的差异。
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

// 当前子应用实例拿到的 qiankun 运行时动作。
let runtimeActions: QiankunRuntimeActions = {};
// 本地缓存最近一份通信 state，发消息时用于增量合并。
let currentState: QiankunCommunicationState = createInitialQiankunCommunicationState();

// 挂载或更新时把主应用注入的通信动作接入本地适配层。
export function setQiankunCommunicationActions(props: QiankunProps = {}) {
  runtimeActions = {
    onGlobalStateChange: props.onGlobalStateChange,
    setGlobalState: props.setGlobalState,
    offGlobalStateChange: props.offGlobalStateChange
  };
}

// 卸载时重置上下文，避免旧页面闭包继续引用过期状态。
export function clearQiankunCommunicationActions() {
  runtimeActions = {};
  currentState = createInitialQiankunCommunicationState();
}

// 给页面层提供统一的运行环境判断。
export function isQiankunCommunicationRuntime() {
  return (
    typeof runtimeActions.onGlobalStateChange === "function" && typeof runtimeActions.setGlobalState === "function"
  );
}

// 向主应用回传当前子应用消息，更新的是 subAppToMain 桶。
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

// 订阅发给当前子应用的主应用消息，并在本地做判重和状态缓存更新。
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

    // 只把属于当前子应用的增量消息透传给页面。
    if (nextMessage && shouldNotify) {
      callback(nextMessage);
    }
  }, true);

  return () => {
    // 当前实例销毁时注销全局监听，避免重复回调。
    runtimeActions.offGlobalStateChange?.();
  };
}
