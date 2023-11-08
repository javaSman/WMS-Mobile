import router from './routers'
import useStore from '@/store'
import { logOut } from '@/store/modules/user'
import Config from '@/settings'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // getToken from cookie
// import { buildMenus } from '@/api/system/menu'
import { filterAsyncRouter } from '@/store/modules/permission'
import { generatorDynamicRouter } from '@/router/formatterRouer'
// import { asyncRouter } from './routers'
// import { getComponentName } from '@/router/formatterRouer'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/download'] // no redirect whitelist
router.beforeEach((to, from, next) => {
  const { user } = useStore()
  if (to.meta.title) {
    document.title = to.meta.title + ' - ' + Config.title
  }
  NProgress.start()
  if (getToken()) {
    // 已登录且要跳转的页面是登录页
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      if (user.roles.length === 0) {
        // 判断当前用户是否已拉取完user_info信息
        let flag = user.GetInfo()
        if (flag) {
          // 动态路由，拉取菜单
          loadMenus(next, to)
        } else {
          user.LogOut().then(() => {
            logOut()
          })
        }
        // user
        //   .GetInfo()
        //   .then(() => {
        //     // 拉取user_info
        //     // 动态路由，拉取菜单
        //     loadMenus(next, to)
        //   })
        //   .catch(() => {
        //     user.LogOut().then(() => {
        //       // location.reload() // 为了重新实例化vue-router对象 避免bug
        //       logOut()
        //     })
        //   })
      } else if (user.loadMenus) {
        // 登录时未拉取菜单，在此处拉取
        // 修改成false，防止死循环
        user.updateLoadMenus()
        loadMenus(next, to)
      } else {
        next()
      }
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

export const loadMenus = (next: any, to: any) => {
  const { user, permission } = useStore()
  // 保存菜单(下面会 改变路由的配置，所以要深拷贝)
  let _menus1 = JSON.parse(JSON.stringify(user.menus))
  // 刷新页面，根据缓存的activeApps 显示对应的菜单
  let currentService = sessionStorage.getItem('activeApps')
  if (currentService) {
    _menus1.map((item: any) => {
      if (item.application === currentService || item.application === undefined) {
        item.hidden = false
      } else {
        item.hidden = true
      }
    })
  }

  new Promise((resolve) => {
    generatorDynamicRouter(_menus1).then((routers: any) => {
      user.homeMenus = routers
      const sdata = JSON.parse(JSON.stringify(routers))
      const rdata = JSON.parse(JSON.stringify(routers))
      const sidebarRoutes = filterAsyncRouter(sdata)
      const rewriteRoutes = filterAsyncRouter(rdata, false)
      // console.log(rewriteRoutes)
      permission.GenerateRoutes(rewriteRoutes).then(() => {
        rewriteRoutes.forEach((item) => {
          router.addRoute(item) // 动态添加可访问路由表
        })
        // 这句不能放到上面，会导致页面加载不到，空白
        rewriteRoutes.push({ path: '*', redirect: '/404', meta: { hidden: true } })
        next({ ...to, replace: true })
        permission.SetSidebarRouters(sidebarRoutes)
        resolve
      })
    })
  })
  // })
}

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
