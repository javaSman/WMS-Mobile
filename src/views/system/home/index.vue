<template>
  <!-- 需要加载有权限的菜单列表 -->
  <van-grid column-num="3" :gutter="5">
    <van-grid-item
      v-for="menu in sidebarRouters"
      :key="menu.name"
      :text="menu.meta?.title"
      class="border-grid"
      @click="handleToSecond(menu)"
    >
      <van-image fit="fill" :src="require(`@/assets/img/${menu.meta?.icon || 'lyric'}.png`)" />
      {{ menu.meta?.title }}
    </van-grid-item>
    <!-- <van-grid-item
      v-for="menu in sidebarRouters"
      :key="menu.name"
      :text="menu.meta?.title"
      icon="photo-o"
      class="border-grid"
      @click="handleToSecond(menu)"
    /> -->
  </van-grid>
</template>

<script lang="ts" setup name="Dashboard">
import { computed, getCurrentInstance, ComponentInternalInstance } from 'vue'
import useStore from '@/store'
import { _showFailToast } from '@/utils/message'
const { permission } = useStore()

let _this = getCurrentInstance() as ComponentInternalInstance
let el = _this.appContext.config.globalProperties

const sidebarRouters = computed<any[]>(() => {
  let list: any[] = []
  permission.sidebarRouters.forEach((item) => {
    if (!item.meta || !item.meta.hidden) list.push(item)
  })
  // console.log(list)
  return list
})

function handleToSecond(item: any) {
  if (!item.children || item.children.length === 0) {
    _showFailToast(item.meta?.title + '暂无子目录')
    return
  }
  el?.$router.push({ name: 'second', query: { name: item.name, text: item.meta.title, level: 'second' } })
}
</script>

<style lang="scss" scoped>
.border-grid :deep(.van-grid-item__content) {
  padding: 3px;
  margin-top: 10px;
  border-radius: 10px;
  box-shadow: 0 0 10px 2px #dde2ea;
  font-size: 0.9rem;
  background-color: transparent;
  .van-image {
    margin-bottom: 5px;
  }
}
</style>
