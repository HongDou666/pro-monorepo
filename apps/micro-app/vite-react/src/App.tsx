/**
 * React 子应用壳。
 *
 * 首屏只保留轻量导航和路由占位，通信页中的 antd 与业务逻辑通过 lazy route 异步加载。
 */
import { Suspense, lazy } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";

const HomePage = lazy(() => import("./pages/HomePage"));
const CommunicationPage = lazy(() => import("./pages/CommunicationPage"));

function App() {
  return (
    <div className="sub-app-shell pro-react-shell">
      <header className="sub-app-shell__header pro-shell-container">
        <div>
          <p className="sub-app-shell__eyebrow pro-eyebrow text-warning">vite-react micro app</p>
          <h1 className="sub-app-shell__title pro-title">React 子应用</h1>
        </div>

        <nav className="sub-app-shell__nav">
          <NavLink to="/" end className="sub-app-shell__link">
            首页
          </NavLink>
          <NavLink to="/communication" className="sub-app-shell__link">
            通信面板
          </NavLink>
        </nav>
      </header>

      <main className="sub-app-shell__main">
        <Suspense fallback={<div className="sub-app-shell__fallback pro-react-fallback">页面加载中...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/communication" element={<CommunicationPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
