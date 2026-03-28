/**
 * React 子应用首页。
 *
 * 该页刻意保持轻量，用来承载“首屏尽快可见”的目标，
 * 同时向使用者解释 qiankun 托管场景下为什么要控制子应用首包大小。
 */
function HomePage() {
  return (
    <section className="home-page">
      <div className="home-page__panel pro-panel">
        <p className="home-page__eyebrow pro-eyebrow text-warning">Lightweight entry</p>
        <h2 className="home-page__title pro-title">首页只保留轻量内容</h2>
        <p className="home-page__desc pro-desc">
          当前 React 子应用同时支持独立运行与 qiankun 托管运行，因此入口页尽量保持轻量，减少主应用装载等待时间。
        </p>
        <p className="home-page__desc pro-desc home-page__desc--extra">
          现在还新增了“请求示例”页面，用于演示 React 子应用如何复用共享 axios 公共包。
        </p>
      </div>
    </section>
  );
}

export default HomePage;
