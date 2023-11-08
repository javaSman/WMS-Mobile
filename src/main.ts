import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from '@/router/routers'
// import Cookies from 'js-cookie'

import './assets/icons' // icon
// import 'normalize.css/normalize.css'

import { permission } from './components/Permission' // 权限指令

import '@/router' // permission control
import Vant from 'vant'
import 'vant/lib/index.css'
import '@/styles/index.scss' // 在 vant 样式后引入

// import Focus from './hooks/dict'
const app = createApp(App as any)

if (app) {
  const _window = window as any
  _window.permission = permission
  app.directive('permission', permission) // v-permission
  app
    .use(router as any)
    .use(createPinia() as any)
    .use(Vant)
    .mount('#app')
}

