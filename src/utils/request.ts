import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import router from '@/router/routers'
// import { ElNotification } from 'element-plus'
import useStore from '@/store/index'
import { getToken, getKeyId } from '@/utils/auth'
import Config from '@/settings'
import Cookies from 'js-cookie'
import { _showFailToast } from './message'

// 创建axios实例
const service = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? process.env.VUE_APP_BASE_API : '/', // api 的 base_url
  timeout: Config.timeout // 请求超时时间
})
// request拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    if (!config.headers) {
      throw new Error(`Expected 'config' and 'config.headers' not to be undefined`)
    }
    // wms 业务代理
    let wms = config.url?.startsWith(process.env.VUE_APP_BASE_API_WMS + 'api/')
    // 非wms业务代理，走企业云
    // let miswms = config.url?.startsWith('/sapwms-api')
    let miswms = config.url?.startsWith(process.env.VUE_APP_BASE_API + 'eip-mapp-sapwms-server')
    // console.log(config.url)
    // console.log('wms: ', wms)
    // console.log('非: ', miswms)

    if (wms && getToken()) {
      // debugger
      config.headers['Authorization'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
      config.headers.Authorization = 'Bearer ' + getToken()
    }
    if (miswms && getKeyId()) {
      // debugger
      config.headers.keyId = getKeyId()
    }
    config.headers['Content-Type'] = 'application/json'
    return config
  },
  (error) => {
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 指定responseType === 'blob'为true时，响应返回response
    if (response.request.responseType === 'blob') {
      return response
    } else {
      // code 存在表示走企业云接口
      let code = response.data.code
      if (code) {
        let { user } = useStore()
        if (!response.data.success && code !== '0000') {
          if (code === '0500') {
            const errorMsg = response.data.data || '操作失败'
            if (errorMsg !== undefined) {
              _showFailToast(errorMsg)
            }
            return Promise.reject(errorMsg)
          } else if (code === '0405') {
            // debugger
            // 未登录
            _showFailToast('未登录')
            user.LogOut().finally(() => {
              Cookies.set('point', 401)
              location.reload()
            })
          } else if (code === '0410' || code === '0401') {
            // 针对菜单接口、业务报错接口，专门返回 null
            const errorMsg = response.data.msg
            if (errorMsg !== '') _showFailToast(errorMsg)
            return Promise.reject(null)
          } else {
            _showFailToast(response.data.msg)
            // return Promise.reject(response.data)
          }
        } else {
          return response.data
        }
      }
      // 不存在走wms接口
      // 登录
      let status = response.status
      if (status === 200) {
        return response.data
      } else {
        console.log(response)
      }
    }
  },
  (error) => {
    console.log(error.response.data)
    let { user } = useStore()
    // 兼容blob下载出错json提示
    if (error.response.data instanceof Blob && error.response.data.type.toLowerCase().indexOf('json') !== -1) {
      const reader: any = new FileReader()
      reader.readAsText(error.response.data, 'utf-8')
      reader.onload = () => {
        const errorMsg = JSON.parse(reader.result).message
        _showFailToast(errorMsg)
      }
    } else {
      let code = 0
      console.log(error.response.data.status)
      try {
        code = error.response.data.status
      } catch (e) {
        if (error.toString().indexOf('Error: timeout') !== -1) {
          _showFailToast('网络请求超时')
          return Promise.reject(error)
        }
      }
      if (code) {
        if (code === 401) {
          user.LogOut().finally(() => {
            // 用户登录界面提示
            Cookies.set('point', 401)
            location.reload()
          })
        } else if (code === 403) {
          router.push({ path: '/401' })
        } else {
          const errorMsg = error.response.data.message
          if (errorMsg !== undefined) {
            _showFailToast(errorMsg)
          }
        }
      } else {
        _showFailToast('接口请求失败')
      }
    }
    return Promise.reject(error)
  }
)
export default service
