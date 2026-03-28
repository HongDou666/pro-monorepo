declare global {
  interface Window {
    __POWERED_BY_QIANKUN__?: boolean;
    proxy?: Window;
    moudleQiankunAppLifeCycles?: Record<string, unknown>;
  }
}

export {};
