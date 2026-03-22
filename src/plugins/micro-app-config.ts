import type { MicroAppName } from "../../shared/micro-app/communication";

type MicroAppUrlMap = Record<MicroAppName, string>;

const defaultMicroAppUrls: MicroAppUrlMap = {
  "vite-vue": "http://localhost:5174/",
  "vite-react": "http://localhost:5175/"
};

export const MICRO_APP_URLS: MicroAppUrlMap = {
  "vite-vue": import.meta.env.VITE_MICRO_APP_VUE_URL || defaultMicroAppUrls["vite-vue"],
  "vite-react": import.meta.env.VITE_MICRO_APP_REACT_URL || defaultMicroAppUrls["vite-react"]
};

export function isMicroAppDebugEnabled(): boolean {
  return import.meta.env.DEV;
}
