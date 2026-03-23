function HomePage() {
  return (
    <section className="home-page">
      <div className="home-page__panel pro-panel">
        <p className="home-page__eyebrow pro-eyebrow text-warning">Lightweight entry</p>
        <h2 className="home-page__title pro-title">首页只保留轻量内容</h2>
        <p className="home-page__desc pro-desc">
          通信页已通过 React.lazy 和路由懒加载拆成异步 chunk，进入“通信面板”时才会加载 antd 和微前端通信逻辑。
        </p>
        <p className="home-page__desc pro-desc home-page__desc--extra">
          现在还新增了“请求示例”页面，用于演示 React 子应用如何复用共享 axios 公共包。
        </p>
      </div>
    </section>
  );
}

export default HomePage;
