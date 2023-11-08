import request from '@/utils/request'
import { getToken } from '@/utils/auth'
let url = process.env.VUE_APP_BASE_API
let urlWMS = process.env.VUE_APP_BASE_API_WMS
// let url = 'eip-mapp-umc-server/'

// 登陆过后根据用户工号获取企业云系统的keyId
export function getKeyIdQYY(account: string) {
  return request({
    url: url + 'eip-mapp-cmc-server/tokenService/getToken',
    method: 'post',
    data: {
      accessKey: '3750cecbb32311ed93c0005056b83bdb',
      secret: '3e4863d9b32311ed93c0005056b83bdb',
      signature: account
    }
  })
}
// WMS 登录接口
export function WMSLogin(data: FormData) {
  return request({
    url: urlWMS + 'connect/token',
    method: 'post',
    data
  })
}

// // 获取菜单列表树，TODO: 动态路由和权限的时候要改
// export function getInfo() {
//   return request({
//     url: url + 'workbench/sysFunAppDetailTreeByAppID',
//     method: 'post',
//     data: { appID: '7010' }
//   })
// }
// TODO: 等待提供接口
export function logout() {
  return request({
    url: 'user/logout',
    method: 'post',
    params: { keyId: getToken() }
  })
}

export function login(userName: string, password: string) {
  return request({
    url: url + 'eip-mapp-umc-server/user/psnCodeLogin',
    method: 'post',
    data: {
      userName,
      password,
      tenantId: 2288
    }
  })
}
export function getuserInfo(account:string) {
  return request({
    url: urlWMS + 'api/business/webapi/GetUsersInfo',
    method: 'get',
    params: {
      userName: account
    }
  })
}
