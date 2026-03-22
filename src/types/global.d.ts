/* declare global 扩展Ts全局变量类型 */
interface ImportMetaEnv {
  readonly VITE_MICRO_APP_VUE_URL?: string;
  readonly VITE_MICRO_APP_REACT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      // MicroApp 组件属性类型定义
      "micro-app": {
        name: string;
        url: string;
        iframe?: boolean;
        disableSandbox?: boolean;
        destroy?: boolean;
        disableMemoryRouter?: boolean;
        disablePatchRequest?: boolean;
        keepAlive?: boolean;
        onCreated?: () => void;
        onBeforemount?: () => void;
        onMounted?: () => void;
        onUnmount?: () => void;
        onError?: () => void;
        onDataChange?: () => void;
      };
    }
  }
}

export {};
