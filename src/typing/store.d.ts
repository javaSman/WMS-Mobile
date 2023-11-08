import { SYS_User_Dict } from '@/api/model/System'
import { RouteRecordRaw } from 'vue-router'
/**
 * 登录
 */
export interface AppState {
  device: string
  sidebar: Sidebar
  size: string
}

export interface ExtraProps {
  cardmo: string
  cardmame: string
  cardno: string
  cardname: string
}

interface Sidebar {
  opened: boolean
  withoutAnimation: boolean
}

export interface PermissionState {
  routers: RouteRecordRaw[]
  addRouters: RouteRecordRaw[]
  sidebarRouters: RouteRecordRaw[]
}

export interface SettingsState {
  theme: any
  showSettings: boolean
  tagsView: any
  fixedHeader: any
  sidebarLogo: any
  uniqueOpened: any
  showFooter: boolean
  footerTxt: string
  caseNumber: string
  /** 显示侧边栏 */
  showSidebar: boolean
  /** 显示头部 */
  showHeader: boolean
}

export interface UserState {
  token: string
  keyId: string
  user: any
  roles: any[]
  loadMenus: boolean
  menus: any[]
  noAuth: boolean
  homeMenus: any[]
  userList: SYS_User_Dict[]
  authUserInfo: ExtraProps | null
}
export interface TagsViewState {
  visitedViews: any[]
  cachedViews: any[]
}
