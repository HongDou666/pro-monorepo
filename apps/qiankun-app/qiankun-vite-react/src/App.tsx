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

function App() {
  const location = useLocation();
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
          <p className="sub-app-shell__eyebrow pro-eyebrow text-warning">vite-react qiankun sub app</p>
          <h1 className="sub-app-shell__title pro-title">React 子应用</h1>
        </div>

        <nav className="sub-app-shell__nav">
          <NavLink to="/" end className="sub-app-shell__link">
            首页
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
        */}
        <Suspense fallback={<div className="sub-app-shell__fallback pro-react-fallback">页面加载中...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/http" element={<HttpPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
