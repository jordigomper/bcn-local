import { createApp } from 'vue'
import { createPinia } from 'pinia'
import L from 'leaflet'
import App from './App.vue'
import 'leaflet/dist/leaflet.css'
import './main.css'

if (typeof window !== 'undefined') window.L = L

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
