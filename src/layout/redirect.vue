<template>
  <div class="redirect-container">
    <!-- 子路由出口 -->
    <router-view />
    <!-- /子路由出口 -->
  </div>
</template>
<script lang="ts">
const cachedName = 'RedirectIndex'

export default {
  name: cachedName
}
</script>

<script lang="ts" setup>
// import { reactive, ref, getCurrentInstance, onBeforeUpdate } from 'vue'
// let dataMap: any = reactive({})
</script>

<style rel="stylesheet/scss" lang="scss" scoped></style>
