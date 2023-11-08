<template>
  <div class="layout-flex-container">
    <!-- 顶部导航栏 -->
    <NavBarVue :title="title" :leftArrow="leftArrow" />
    <!-- 子路由出口 -->
    <div class="layout-flex-main">
      <router-view />
    </div>
    <!-- /子路由出口 -->
    <!-- 底部提示 -->
    <!-- <FootBar class="layout-flex-footer" /> -->
  </div>
</template>
<script lang="ts">
const cachedName = 'LayoutIndex'
export default {
  name: cachedName
}
</script>

<script lang="ts" setup>
import NavBarVue from './components/NavBar.vue'
import { watch, ref, ComponentInternalInstance, getCurrentInstance } from 'vue'

let _this = getCurrentInstance() as ComponentInternalInstance
let el = _this.appContext.config.globalProperties

// console.log(el.$route)
const title = ref<string>(el.$route.meta.title as string)
const leftArrow = ref<boolean>(el.$route.name !== 'Dashboard')

watch(
  () => [el.$route.name, el.$route.meta.title],
  ([_name, _title]) => {
    leftArrow.value = _name !== 'Dashboard'
    if (_name === 'second') {
      title.value = el.$route.query.text as string
    } else {
      title.value = _title as string
    }
  }
)
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
// 固定头部、底部-中间内容超出出现滚动条
.layout-flex-container {
  display: flex; // 父元素的定义为flex布局
  flex-direction: column; // 定义排列方向为竖排
  overflow: hidden;
  width: 100%;
  height: 100vh;
  text-align: center;
  // 中间分配剩下的所有空间
  // 菜单容器 位置定位，超出出现滚动条
  .layout-flex-main {
    flex: 1;
    overflow: auto;
    padding-bottom: 5px;
  }
}
</style>
