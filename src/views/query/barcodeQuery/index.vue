<template>
  <van-field ref="inputRef" v-model="barcode" label="条码" placeholder="请输入条码" @keyup.enter="barcodeEnter" />
  <SimpleTable :columns="tableColumn" :show-msg="showTextValue" />
  <ActionBar confirm-text="查询" @confirm="comfirSearch" @clear="clearHandler" />
</template>

<script lang="ts">
// 条码查询
const cachedName = 'query.barcodeQuery'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import SimpleTable from '@/views/businessComponents/SimpleTable.vue'
import ActionBar from '@/views/businessComponents/ActionBar.vue'
import { tableColumn } from './config'
import { MISWMSAPI } from '@/api/generalAPI'
import { ref } from 'vue'
import { FieldInstance } from 'vant'
import { _showFailToast } from '@/utils/message'
const listAPIName = '/getData/getValidBarcode'
const barcode = ref('')
const showTextValue = ref({})
const inputRef = ref<FieldInstance>()
const barcodeEnter = () => {
  comfirSearch()
}
// 确定查询按钮
const comfirSearch = () => {
  if (!barcode.value) {
    _showFailToast('请输入条码')
    return
  }
  MISWMSAPI.post(listAPIName, { orderNumber: barcode.value })
    .then((res) => {
      if (res && res.success) {
        Object.assign(showTextValue.value, res.data)
        console.log(showTextValue.value)
      } else {
        _showFailToast(res.data as string)
      }
    })
    .finally(() => {
      console.log(111)
    })
}
// 清除按钮
const clearHandler = () => {
  showTextValue.value = {}
  barcode.value = ''
  inputRef.value?.focus()
}
</script>
