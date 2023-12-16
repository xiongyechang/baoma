import "./registerServiceWorker";
import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import store from "./store";
import router from "./router";

import "element-plus/dist/index.css";
import "@/assets/iconfont/iconfont.css";

const app = createApp(App);

app.use(store);

app.use(router);

app.mount("#app");
