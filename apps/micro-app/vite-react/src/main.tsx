// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MOCK_APP_SCOPE, setupMockInDev } from "@pro-monorepo/mock";
import "virtual:uno.css";
import "./index.css";
import App from "./App";

/**
 * React 子应用启动入口。
 *
 * 和 Vue 子应用一样，这里既要支持独立运行，也要支持被主应用嵌入。
 * 因此入口只处理 React 根节点、路由和全局样式装配。
 */
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

// React 子应用通过共享包统一初始化开发态 Mock.js。
void setupMockInDev(MOCK_APP_SCOPE.MICRO_APP_REACT);

// BrowserRouter 由子应用自己维护，主应用只负责容器隔离而不直接接管其内部路由。
createRoot(rootElement).render(
  // <StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
  // </StrictMode>
);
