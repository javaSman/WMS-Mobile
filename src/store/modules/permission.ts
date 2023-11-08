import { constantRouterMap } from '@/router/routers'
import Layout from '@/layout/index.vue'
// import ParentView from '@/components/ParentView'
import { RouteRecordRaw } from 'vue-router'
import { defineStore } from 'pinia'
import { PermissionState } from '@/typing'

export const usePermissionStore = defineStore({
  id: 'permission',
  state: (): PermissionState => ({
    routers: constantRouterMap,
    addRouters: [],
    sidebarRouters: []
  }),
  actions: {
    GenerateRoutes(asyncRouter: RouteRecordRaw[]) {
      return new Promise(resolve => {
        this.addRouters = asyncRouter
        this.routers = constantRouterMap.concat(asyncRouter)
        resolve(this.routers)
      })
    },
    SetSidebarRouters(sidebarRouter: RouteRecordRaw[]) {
      // console.log(sidebarRouter)
      this.sidebarRouters = constantRouterMap.concat(sidebarRouter)
    }
  }
})
// console.log(constantRouterMap)
export const filterAsyncRouter = (routers: RouteRecordRaw[], type = false) => {
  // 遍历后台传来的路由字符串，转换为组件对象
  return routers.filter((router:any) => {
    if (type && router.children) {
      router.children = filterChildren(router.children)
    }
    if (router.component) {
      if (router.component === 'Layout') {
        // Layout组件特殊处理
        // console.log(router)
        router.component = Layout
      } else {
        // console.log(loadView(router.component))
        const component = router.component
        router.component = loadView(component)
      }
    }
    if (router.children != null && router.children && router.children.length) {
      router.children = filterAsyncRouter(router.children, router)
    } else {
      delete router['children']
      delete router['redirect']
    }
    return true
  })
}

function filterChildren(childrenMap: RouteRecordRaw[], lastRouter:any = false) {
  // const tmp = { ...router } as any;
  let children: any[] = []
  childrenMap.forEach((el: any) => {
    // if (el.children && el.children.length) {
    //   if (el.component === 'ParentView') {
    //     el.children.forEach((c: any) => {
    //       c.path = el.path + '/' + c.path
    //       if (c.children && c.children.length) {
    //         children = children.concat(filterChildren(c.children, c))
    //         return
    //       }
    //       children.push(c)
    //     })
    //     return
    //   }
    // }
    if (lastRouter) {
      el.path = lastRouter.path + '/' + el.path
    }
    children = children.concat(el)
  })
  return children
}

export const loadView = (view: any) => {
  return () =>
    new Promise((resolve) => {
      require([`@/views/${view}`], resolve)
    })
  // return resolve => require([`@/views/${view}`], resolve) 这个会报错 resolve is undefined
}

export default usePermissionStore
