import type { MicroAppEventCenterLike } from "../../../../shared/micro-app/communication";

declare global {
  interface Window {
    __MICRO_APP_ENVIRONMENT__?: boolean;
    microApp?: MicroAppEventCenterLike;
  }
}

export {};
