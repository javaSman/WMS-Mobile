<template>
  <div style="height: 50px" />
  <van-action-bar>
    <van-action-bar-button type="default" text="清除" @click="handleClear" />
    <van-action-bar-button type="primary" :text="confirmText" :loading="loading" @click="handleConfirm" />
  </van-action-bar>
</template>

<script lang="ts" setup name="ActionBarVue">
// import { PropType } from 'vue'

let emits = defineEmits(['clear', 'confirm'])
let props = defineProps({
  loading: { type: Boolean, default: false },
  confirmText: { type: String, default: '过账' }
})

// 清空
function handleClear() {
  emits('clear')
}
// 过账
function handleConfirm() {
  emits('confirm')
}

</script>

<style lang="scss" scoped>
:deep(.van-action-bar-button--first),
:deep(.van-action-bar-button--last) {
  border-radius: 0;
}
</style>
