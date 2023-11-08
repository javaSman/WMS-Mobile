<template>
  <div>
    <van-field ref="inputRef" v-model="barcode" label="条码" placeholder="请输入条码" @keyup.enter="enterBarcode" />
    <ActionBar @clear="clearHandler" @confirm="comfirHandler" />
  </div>
</template>

<script setup lang="ts">
import { MISWMSAPI } from '@/api/generalAPI'
import { ref } from 'vue'
import { FieldInstance } from 'vant'
import ActionBar from '@/views/businessComponents/ActionBar.vue'
const barcode = ref('')
const inputRef = ref<FieldInstance>()
const queryAPIName = '/getData/getStateMateStock'
const enterBarcode = () => {
  MISWMSAPI.post(queryAPIName, { objnr: barcode.value }).then((res) => {
    // TODO: 这里说给一个提示就行
    console.log(res)
  })
}
// 清除
const clearHandler = () => {
  barcode.value = ''
  inputRef.value?.focus()
}
// 查询
const comfirHandler = () => {
  enterBarcode()
}
</script>

<style scoped></style>
