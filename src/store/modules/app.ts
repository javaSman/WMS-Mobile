import Cookies from 'js-cookie'
import { defineStore } from 'pinia'
import { AppState } from '@/typing'

const useAPPStore = defineStore({
  id: 'app',
  state: (): AppState => ({
    sidebar: {
      opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
      withoutAnimation: false
    },
    device: 'desktop',
    size: Cookies.get('size') || 'default'
  }),
  actions: {
    toggleSideBar() {
      this.sidebar = {
        opened: !this.sidebar.opened,
        withoutAnimation: false
      }
      if (this.sidebar.opened) {
        Cookies.set('sidebarStatus', 1 + '')
      } else {
        Cookies.set('sidebarStatus', 0 + '')
      }
    },
    closeSideBar({ withoutAnimation }: any) {
      Cookies.set('sidebarStatus', 0 + '')
      this.sidebar.opened = false
      this.sidebar.withoutAnimation = withoutAnimation
    },
    toggleDevice(device: any) {
      this.device = device
    },
    setSize(size: any) {
      this.size = size
      Cookies.set('size', size)
    }
  }
})

export default useAPPStore
