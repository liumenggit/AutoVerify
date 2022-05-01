import { createApp } from 'vue'
// import Antd from 'ant-design-vue';
import Antd from 'ant-design-vue'
import App from './App'
import 'ant-design-vue/dist/antd.css'
import './popup.css'

const app = createApp(App)
app.config.productionTip = true

app.use(Antd).mount('#app')
app.config.globalProperties.$message = message
