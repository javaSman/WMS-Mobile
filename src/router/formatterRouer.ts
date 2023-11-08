/**
 * 动态生成菜单
 * @param data
 * @returns {Promise<Router>}
 */
import { asyncRoutes } from '@/router/routers'
export const generatorDynamicRouter = (data: any) => {
  return new Promise(resolve => {
    // const routers = getFrontRouter(asyncRoutes, data)
    const routers = asyncRoutes
    resolve(routers)
  }).catch(err => {
    // reject('加载菜单失败')
    return Promise.reject(err)
  })
}
