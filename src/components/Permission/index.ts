import useStore from '@/store'

export const permission = {
  mounted(el: any, binding: any) {
    let { user } = useStore()
    const { value } = binding
    const roles = user.roles
    if (value && value instanceof Array) {
      if (value.length > 0) {
        const permissionRoles = value
        // console.log('com-roles', roles)
        // console.log('com-permissionRoles', permissionRoles)
        const hasPermission = roles.some((role: any) => {
          // 配置'any'即为所有人都可操作的权限
          return permissionRoles.includes(role) || permissionRoles.includes('any')
        })
        // console.log('com-hasPermission', hasPermission)
        if (!hasPermission) {
          el.parentNode && el.parentNode.removeChild(el)
        }
      }
    } else {
      throw new Error(`使用方式： v-permission="['admin','editor']"`)
    }
  }
}
