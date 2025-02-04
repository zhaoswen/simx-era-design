import {createApp} from "vue";
import App from "./App.vue";
import 'element-plus/dist/index.css'
import './style/element/index.scss'
import './main.css'
import './assets/fonts/index.css'
import '@icon-park/vue-next/styles/index.css'
import {createPinia} from 'pinia'


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')