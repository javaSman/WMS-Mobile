import { WMSLogin, logout, getKeyIdQYY } from '@/api/system/login'
import { getToken, setToken, removeToken, getKeyId, setKeyId, removeKeyId } from '@/utils/auth'
import { defineStore } from 'pinia'
import { UserState } from '@/typing'
// import { LoginFormData } from '@/api/model/System'
import { asyncRoutes } from '@/router/routers'

export const useUserStore = defineStore({
  id: 'user',
  state: (): UserState => ({
    token: getToken(),
    keyId: getKeyId(),
    user: {},
    roles: [],
    // 第一次加载菜单时用到
    loadMenus: false,
    menus: [],
    noAuth: false, // 判断当前是否有菜单权限，true 为没有
    // 快捷菜单
    homeMenus: [],
    userList: [],
    authUserInfo: null // 授权参数
  }),
  actions: {
    // 登录
    Login(_data: any) {
      return new Promise((resolve, reject) => {
        WMSLogin(_data)
          .then((res: any) => {
            if (!res.access_token) {
              // 调用reject方法后，Promise状态变为rejected，即操作失败状态
              reject('登录失败')
              return
            }
            // let _res = res.data.data
            let _res = { account: 'admin', name: 'admin' }
            setUserInfo(_res)
            // TODO: 由于个人信息是从登录返回而不是另开接口，一刷新该数据就没有了，所以该数据需要缓存到本地
            localStorage.setItem('userInfo', JSON.stringify(_res))
            // 若rememberMe为true，token添加过期时间
            setToken(res.access_token, false)
            // TODO: 获取企业云keyId，目前没有权限，先写死用户工号
            this.GetKeyIdQYY('13383')
            // setkeyId(res.access_token)
            this.token = res.access_token
            // 第一次加载菜单时用到， 具体见 src 目录下的 permission.js
            this.loadMenus = true
            resolve(res)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    // 根据当前登录用户工号，获取企业云接口的keyId
    GetKeyIdQYY(account: string) {
      getKeyIdQYY(account)
        .then((res) => {
          // console.log(res)
          this.keyId = res.data.keyId
          setKeyId(res.data.keyId)
        })
        .catch((e) => {
          console.log(e)
        })
    },
    // 获取用户
    // 获取用户信息
    GetInfo() {
      // 刷新页面再次加载菜单前需要获取当前用户信息
      let userInfo = localStorage.getItem('userInfo')
      if (userInfo === null) {
        this.token = ''
        removeToken()
        this.keyId = ''
        removeKeyId()
        return false
      } else {
        let _info = JSON.parse(userInfo)
        this.token = getToken()
        this.menus = asyncRoutes
        // 重新加载用户信息
        setUserInfo(_info)
        return true
      }
      // return new Promise((resolve, reject) => {
      //   getInfo()
      //     .then((res) => {
      //       // 第一次加载菜单时用到， 具体见 src 目录下的 permission.js;第一次加载不做缓存
      //       this.menus = res.data
      //       resolve(res)
      //     })
      //     .catch((error) => {
      //       // 如果是返回 null 表示没有任何菜单权限
      //       if (error === null) {
      //         this.noAuth = true
      //         resolve(null)
      //       }
      //       reject(error)
      //     })
      // })
    },
    // 登出
    LogOut() {
      return new Promise((resolve, reject) => {
        logout()
          .then((res: any) => {
            if (res.success) {
              this.token = ''
              removeToken()
              resolve(res)
            } else {
              // 跳转到登录页
              console.log(res)
              removeToken()
              resolve(res)
              // router.push({ path: '/login' })
            }
          })
          .catch((error) => {
            // this.token = ''
            // 退出登录失败也要跳转到登录，清除本地缓存
            removeToken()
            reject(error)
            console.log(error)
            // debugger
          })
          .finally(() => {
            localStorage.removeItem('userInfo')
          })
      })
    },
    updateLoadMenus() {
      return new Promise(() => {
        this.loadMenus = false
      })
    }
  }
})

export const logOut = () => {
  useUserStore().token = ''
  useUserStore().keyId = ''
  useUserStore().roles = []
  removeToken()
  removeKeyId()
  localStorage.removeItem('userInfo')
}

export const setUserInfo = (res: any) => {
  // 如果没有任何权限，则赋予一个默认的权限，避免请求死循环
  // if (res.userRoleCodes === '') {
  //   useUserStore().roles = ['ROLE_SYSTEM_DEFAULT']
  // } else {
  //   useUserStore().roles = res.userRoleCodes.split(',')
  // }
  useUserStore().roles = ['admin']
  useUserStore().user = res
  // commit('SET_USER', res)
}

export default useUserStore
