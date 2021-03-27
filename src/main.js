import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import store from './store'
import router from './router'

import VueMarkdownIt from 'vue3-markdown-it'

import { highlight } from './directives'

import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'
import "animate.css"
import "@/assets/iconfont/iconfont.css"
import 'highlight.js/styles/monokai.css'

const app = createApp(App)

app.directive('highlight', highlight)

app.use(store)

app.use(router)

app.use(ElementPlus)

app.use(VueMarkdownIt);

app.mount('#app')
