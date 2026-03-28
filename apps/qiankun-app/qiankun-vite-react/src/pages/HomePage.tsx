/**
 * React 子应用首页。
 *
 * 该页刻意保持轻量，用来承载“首屏尽快可见”的目标，
 * 同时向使用者解释 qiankun 托管场景下为什么要控制子应用首包大小。
 *
 * 这里不放 antd 组件和通信逻辑，
 * 目的是把“展示型说明”与“交互型能力”拆开，让首页始终保持最小依赖。
 */
function HomePage() {
  return (
    <section className="home-page">
      <div className="home-page__panel pro-panel">
        <p className="home-page__eyebrow pro-eyebrow text-warning">Lightweight entry</p>
        <h2 className="home-page__title pro-title">首页只保留轻量内容</h2>
        <p className="home-page__desc pro-desc">
          {/*
            这段文案直接解释当前架构选择：
            子应用既能独立运行，又能被 qiankun 托管，因此首页必须优先保证挂载速度和稳定性。
          */}
          当前 React 子应用同时支持独立运行与 qiankun 托管运行，因此入口页尽量保持轻量，减少主应用装载等待时间。
        </p>
        <p className="home-page__desc pro-desc home-page__desc--extra">
          {/*
            首页只做能力导览，真正的通信逻辑和请求逻辑分别放到独立路由中，
            这样访问成本更低，页面职责也更清晰。
          */}
          现在还新增了“通信面板”和“请求示例”页面，用于演示 React 子应用如何与主应用通信，以及复用共享 axios 公共包。
        </p>
      </div>
    </section>
  );
}

export default HomePage;
