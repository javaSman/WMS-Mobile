// 通用API文件
import request from '@/utils/request'
import qs from 'qs'
import { IViewResponse } from '@/typing'
import { AxiosResponse, ResponseType } from 'axios'
function commonAPI(router: string) {
  const url = router || '/'
  // const url = router ? '/' + router + '/' : '/'
  const API = {
    /** 通用接口------起 */
    /** get 方法- params */
    get(name: string, params?: object, other?: string): Promise<IViewResponse> {
      let end = ''
      if (other) {
        end = '/' + other
      }
      return request({
        url: url + name + end,
        method: 'get',
        params,
        paramsSerializer: function (params) {
          return qs.stringify(params, { arrayFormat: 'repeat' })
        }
      })
    },
    getDetailById(name: string, id: number, otheMethod: string): Promise<IViewResponse> {
      return request({
        url: url + name + '/' + otheMethod,
        method: 'get',
        params: { id }
      })
    },

    /** get 方法- 导出-响应的数据类型 */
    getExport(name: string, params: object, other: string, otherResType = undefined): Promise<AxiosResponse> {
      let end = ''
      if (other) {
        end = '/' + other
      }
      let resType: any = otherResType || 'blob'
      // let extraFlag = resType === 'blob'
      return request({
        url: url + name + end,
        method: 'get',
        params,
        responseType: resType
        // extraFlag
      })
    },

    /** post 方法- 导出-响应的数据类型 */
    postExport(name: string, params: object, other: string, otherResType = undefined): Promise<AxiosResponse> {
      let end = ''
      if (other) {
        end = '/' + other
      }
      let resType: ResponseType = otherResType || 'blob'
      // let extraFlag = resType === 'blob'
      return request({
        url: url + name + end,
        method: 'post',
        data: params,
        responseType: resType
        // extraFlag
      })
    },

    /**
     * post 方法- data
     * 默认新增，other可配置
     */
    post(name: string, params: object, other?: string): Promise<IViewResponse> {
      let end = ''
      if (other) {
        end = '/' + other
      }
      return request({
        url: url + name + end,
        method: 'post',
        data: params
      })
    },

    /** put 方法- data */
    put(name: string, params: object, other: string): Promise<IViewResponse> {
      let end = ''
      if (other) {
        end = '/' + other
      }
      return request({
        url: url + name + end,
        method: 'put',
        data: params
      })
    },

    /** delete 方法- params */
    delete(name: string, params: object, other: string): Promise<IViewResponse> {
      let end = ''
      if (other) {
        end = '/' + other
      }
      return request({
        url: url + name + end,
        method: 'delete',
        params
      })
    }
    /** 导出 */
    /** 通用接口------终 */
  }
  return API
}

export const url_wms = process.env.VUE_APP_BASE_API_WMS + 'api/' // WMS业务
// export const url_miswms = '/sapwms-api' // 非WMS业务
export const url_miswms = process.env.VUE_APP_BASE_API + 'eip-mapp-sapwms-server/' // 非WMS业务

export const MISWMSAPI = commonAPI(url_miswms) // 非WMS业务
export const WMSAPI = commonAPI(url_wms) // WMS业务
