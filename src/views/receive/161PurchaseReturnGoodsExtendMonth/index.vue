<template>
  <ToggleFormVue
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    mode="handler"
  />
</template>

<script lang="ts">
// 161跨月采购退货
const cachedName = 'receive.161PurchaseReturnGoodsExtendMonth'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'receivingAndWarehousing/doPost161'
const listAPIName = 'receivingAndWarehousing/findList161'
</script>
