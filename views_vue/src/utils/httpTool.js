import axios from 'axios'

class HttpAxios {
  constructor () {
  }

  axiosGet (url, params) {
    // 设置token
    // axios.defaults.headers.common["Authorization"] = "token " + localStorage.getItem("token");

    // 配置接口地址
    url = (process.env.NODE_ENV !== 'production' && process.env.OPEN_PROXY ? '/proxyApi/' : window.SITE_CONFIG.baseUrl) + url
    params.t = new Date().getTime()
    // 返回一个promise的get请求
    return axios
      .get(url, params)
      .then(res => {
        return Promise.resolve(res.data)
      })
      .catch(ERR => {
        // alert(ERR);
        console.log('接口报错', ERR)
      })
  }

  axiosPost (url, params) {
    // 设置token
    // axios.defaults.headers.common["Authorization"] = "token " + localStorage.getItem("token");

    // 配置接口地址
    url = (process.env.NODE_ENV !== 'production' && process.env.OPEN_PROXY ? '/proxyApi/' : window.SITE_CONFIG.baseUrl) + url
    params.t = new Date().getTime()

    // 返回一个promise的post请求
    return axios
      .post(url, params)
      .then(res => {
        return Promise.resolve(res.data)
      })
      .catch(ERR => {
        // alert(ERR);
        console.log('接口报错', ERR)
      })
  }
}

export default new HttpAxios()
