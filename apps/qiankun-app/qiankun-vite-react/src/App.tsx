/**
 * React 子应用壳。
 *
 * 首屏只保留轻量导航和路由占位，重量级页面通过 lazy route 异步加载。
 */
import { Suspense, lazy } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { cancelReactMicroRequests } from "./api/http";
import "./App.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const HttpPage = lazy(() => import("./pages/HttpPage"));
const CommunicationPage = lazy(() => import("./pages/CommunicationPage"));

function App() {
  // 只关心 pathname，避免 query/hash 变化时误取消与页面本身无关的请求。
  const location = useLocation();
  // 保存上一次页面路径，用来判断这次 effect 是否真的是路由页面切换。
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    // 路由真正发生变化后取消旧页面请求，避免异步响应回写到新的页面状态。
    if (previousPathRef.current !== location.pathname) {
      cancelReactMicroRequests(`Qiankun React route switching to ${location.pathname}`);
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <div className="sub-app-shell pro-react-shell">
      <header className="sub-app-shell__header pro-shell-container">
        <div>
          {/* 壳层文案固定存在，避免页面异步切换时整个头部跟着抖动。 */}
          <p className="sub-app-shell__eyebrow pro-eyebrow text-warning">vite-react qiankun sub app</p>
          <h1 className="sub-app-shell__title pro-title">React 子应用</h1>
        </div>

        {/* 导航只负责切换子应用内部页面，不介入主应用路由。 */}
        <nav className="sub-app-shell__nav">
          <NavLink to="/" end className="sub-app-shell__link">
            首页
          </NavLink>
          <NavLink to="/communication" className="sub-app-shell__link">
            通信面板
          </NavLink>
          <NavLink to="/http" className="sub-app-shell__link">
            请求示例
          </NavLink>
        </nav>
      </header>

      <main className="sub-app-shell__main">
        {/*
          Suspense 只包裹页面区域，让导航壳保持稳定，
          页面级 chunk 则根据路由按需加载。
          这样“通信面板”“请求示例”里依赖的 antd 与业务逻辑都不会进入首屏包体。
        */}
        <Suspense fallback={<div className="sub-app-shell__fallback pro-react-fallback">页面加载中...</div>}>
          <Routes>
            {/* 首页承载轻量说明，通信页与请求页延迟到真正访问时再下载。 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/communication" element={<CommunicationPage />} />
            <Route path="/http" element={<HttpPage />} />
            {/* 任意未知路径都回退到首页，避免在 MemoryRouter 中出现空白壳。 */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
