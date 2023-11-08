<template>
  <van-list>
    <van-cell
      v-for="item in sidebarRouters"
      :key="item"
      class="second"
      :is-link="item.children && item.children.length > 0"
      @click="handleToThird(item)"
    >
      <van-icon name="balance-list-o" />
      <span>{{ item.meta?.title }}</span>
    </van-cell>
  </van-list>
</template>

<script lang="ts" setup name="SecondVue">
import { computed, getCurrentInstance, ComponentInternalInstance } from 'vue'
import useStore from '@/store'
const { permission } = useStore()

let _this = getCurrentInstance() as ComponentInternalInstance
let el = _this.appContext.config.globalProperties

// console.log(el?.$route.query.name)
const sidebarRouters = computed<any[]>(() => {
  let routerName = el?.$route.query.name as string
  let level = el?.$route.query.level
  let menu: any[] = []
  if (level === 'second') {
    menu = permission.sidebarRouters.filter((item) => item.name === routerName)[0].children as any[]
  } else {
    let secName = routerName.split('.')[0]
    let parentMenu = permission.sidebarRouters.filter((item) => item.name === secName)[0].children as any[]
    menu = parentMenu.filter((item) => item.name === routerName)[0].children as any[]
  }

  // console.log(menu)
  return menu
})

function handleToThird(item: any) {
  if (item.children && item.children.length) {
    el?.$router.push({ name: 'second', query: { name: item.name, text: item.meta.title, level: 'third' } })
  } else {
    el?.$router.push({ name: item.name })
  }
}
</script>

<style lang="scss" scoped>
.second {
  border-radius: 0;
  :deep(.van-cell__value) {
    font-size: 1rem;
    line-height: 1.5rem;
  }
  :deep(.van-icon) {
    font-size: 1.5rem;
    margin-right: 5px;
  }
}
</style>
