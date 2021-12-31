import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import store from './store'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'
import "animate.css"
import "@/assets/iconfont/iconfont.css"

const app = createApp(App)

app.use(store)

app.use(router)

app.use(ElementPlus)

app.mount('#app')
