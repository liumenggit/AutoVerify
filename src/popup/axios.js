import axios from 'axios'
import { message } from 'ant-design-vue'

function sendMessageToContentScript (message, callback) {
  browser.tabs.query({
    active: true,
    currentWindow: true
  }).then(function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, message, function (response) {
      if (callback) callback(response)
    })
  })
}

let isRefreshing = false
let requests = []
// const baseURL = 'http://py.wam7.cc'
// axios.defaults.baseURL = baseURL
if (localStorage.getItem('access_token')) {
  axios.defaults.headers.Authorization = 'Bearer ' + localStorage.getItem('access_token')
}
axios.interceptors.request.use(
  config => {
    // alert('拦截到请求' + JSON.stringify(config.headers))
    return config
  }, error => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  response => {
    // alert('响应拦截' + JSON.stringify(response))
    return response
  }, error => {
    if (error && error.response && error.response.status === 400) {
      for (const key in error.response.data) {
        error.response.data[key].forEach((elem, index) => {
          message.warn(key + ':' + elem)
        })
      }
    }
    // alert('拦截到错误' + error.response.status)
    if (error && error.response && error.response.status === 401) {
      const config = error.config
      // alert('const ' + JSON.stringify(error))
      // 检查本地是否存在令牌
      if (localStorage.getItem('refresh_token')) {
        // 开始刷新令牌
        if (!isRefreshing) {
          isRefreshing = true
          return axios.post('http://py.wan7.cc/user/token/refresh/', {
            refresh: localStorage.getItem('refresh_token')
          }).then(function (response) {
            if (response.status === 200) {
              // alert('更新成功' + JSON.stringify(response))
              // 保存令牌
              localStorage.setItem('access_token', response.data.access)
              // 使用令牌从新构建config
              config.baseURL = ''
              config.headers.Authorization = 'Bearer ' + localStorage.getItem('access_token')
              requests.forEach((item) => {
                item()
              })
              requests = []
              // alert('从构建请求' + JSON.stringify(config))
              return axios(config)
            }
          }).finally(function () {
            // alert('finally' + isRefreshing)
            isRefreshing = false
          })
        } else {
          return new Promise((resolve) => {
            requests.push(() => {
              config.baseURL = ''
              config.headers.Authorization = 'Bearer ' + localStorage.getItem('access_token')
              resolve(axios(config))
            })
          })
        }
      } else {
        console.log('需要登录')
        sendMessageToContentScript({
          cmd: 'test',
          value: '需要登录才能使用,自动输入验证码.'
        })
        message.warn('请登录')
      }
    }
    // return Promise.reject(error)
    return error.response
  }
)
export default axios
