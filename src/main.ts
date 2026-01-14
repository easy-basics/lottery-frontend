import type { UserModule } from './types'
import { createApp } from "vue";
// import { createPinia } from 'pinia'
import routes from '@/router'
import App from './App.vue'

import '@/styles/index.scss'
import 'uno.css'
import 'element-plus/theme-chalk/src/message.scss'
import 'element-plus/theme-chalk/src/message-box.scss'
import 'element-plus/theme-chalk/src/overlay.scss'

import { registerSW } from 'virtual:pwa-register'
if ('serviceWorker' in navigator) {
  registerSW()
}

const app = createApp(App)
// const pinia = createPinia()

// app.use(pinia)
app.use(routes)
app.mount('#app')
