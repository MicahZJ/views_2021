import axios from 'axios'
import Vue from 'vue'
import merge from 'lodash/merge'
import { clearLoginInfo } from '@/utils'

class HttpAxios {
  constructor () {
  }

  axiosGet (url, params) {
    const http = axios.create({
      timeout: 1000 * 30,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })

    /**
     * 响应拦截
     */
    http.interceptors.response.use(response => {
      if (response.data && response.data.code === 401) { // 401, token失效
        clearLoginInfo()
        this.$router.push({ name: 'login' })
      }
      return response
    }, error => {
      return Promise.reject(error)
    })

    // 设置token
    axios.defaults.headers.common['token'] = Vue.cookie.get('token')
    // 配置接口地址
    url = (process.env.NODE_ENV !== 'production' && process.env.OPEN_PROXY ? '/proxyApi/' : window.SITE_CONFIG.baseUrl) + url
    let defaults = {
      't': new Date().getTime()
    }
    params = merge(defaults, {params: params})
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
    const http = axios.create({
      timeout: 1000 * 30,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })

    /**
     * 响应拦截
     */
    http.interceptors.response.use(response => {
      if (response.data && response.data.code === 401) { // 401, token失效
        clearLoginInfo()
        this.$router.push({ name: 'login' })
      }
      return response
    }, error => {
      return Promise.reject(error)
    })

    // 设置token
    axios.defaults.headers.common['token'] = Vue.cookie.get('token')
    // axios.defaults.headers.common["Authorization"] = "token " + localStorage.getItem("token");

    // 配置接口地址
    url = (process.env.NODE_ENV !== 'production' && process.env.OPEN_PROXY ? '/proxyApi/' : window.SITE_CONFIG.baseUrl) + url
    let defaults = {
      't': new Date().getTime()
    }
    params = merge(defaults, params)
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
