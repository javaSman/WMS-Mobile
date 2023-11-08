<template>
  <ToggleFormWMSVue
    ref="toggleFormWMSVue"
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :type="imOclas"
    :submit="handleSubmit"
    v-model:chkDisabled="chkDisabled"
    mode="allAntDisable"
    :autoSubmit="true"
    computedKey="scrqty"
  />
</template>

<script lang="ts">
// 124不良品退货-WMS
const cachedName = 'receive.124RejectsReturnGoods-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import { ref } from 'vue'
import ToggleFormWMSVue from '@/views/businessComponents/ToggleFormWMS.vue'
import { formList, showFormList, tableColumn } from './config'

const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const passAPIName = 'business/webapi/OutStock'
const imOclas = 'XWMS124'

let toggleFormWMSVue = ref<InstanceType<typeof ToggleFormWMSVue> | null>(null)
const chkDisabled = ref(false)

// 获取过账（入库）的参数
const handleSubmit = (data: any) => {
  let _list = toggleFormWMSVue.value?.selectedList as any[]
  data.wmsOutStockList.forEach((item: any, index: number) => {
    item.quantity = _list[index].scrqty
  })
  return false
}
</script>
