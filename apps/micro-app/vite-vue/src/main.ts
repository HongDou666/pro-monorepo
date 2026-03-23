import { createApp } from "vue";
import "ant-design-vue/dist/reset.css";
import "virtual:uno.css";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { cancelVueMicroRequests } from "./api/http";

const app = createApp(App);

router.beforeEach((to, from, next) => {
  if (to.fullPath !== from.fullPath) {
    cancelVueMicroRequests(`Vue micro route switching to ${to.fullPath}`);
  }

  next();
});

app.use(router);
app.mount("#app");
