import useUserStore from './modules/user'
import useAPPStore from './modules/app'
import usePermissionStore from './modules/permission'

const useStore = () => ({
  user: useUserStore(),
  app: useAPPStore(),
  permission: usePermissionStore()
})

export default useStore
