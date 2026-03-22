declare global {
  interface MicroAppEventCenter {
    addDataListener: (callback: (data: Record<PropertyKey, unknown>) => void, autoTrigger?: boolean) => void;
    removeDataListener: (callback: (data: Record<PropertyKey, unknown>) => void) => void;
    dispatch: (data: Record<PropertyKey, unknown>) => void;
    getData: (fromBaseApp?: boolean) => Record<PropertyKey, unknown> | null;
    clearData: (fromBaseApp?: boolean) => void;
  }

  interface Window {
    __MICRO_APP_ENVIRONMENT__?: boolean;
    microApp?: MicroAppEventCenter;
  }
}

export {};
