<template>
  <Overlay :show="true">
    <div class="loading_wrapper" @click.stop>
      <Loading color="#ffffff" type="spinner">{{ tips }}</Loading>
    </div>
  </Overlay>
</template>

<script lang="ts">
import { Loading, Overlay } from 'vant'
export default {
  name: 'CustomerLoading'
}
</script>
<script setup lang="ts">
withDefaults(
  defineProps<{
    tips: string
  }>(),
  {
    tips: '数据加载中'
  }
)
</script>

<style scoped>
.loading_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
