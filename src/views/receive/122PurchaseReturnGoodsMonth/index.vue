<template>
  <ToggleFormVue
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    mode="all"
  />
</template>

<script lang="ts">
// 122当月采购退货
const cachedName = 'receive.122PurchaseReturnGoodsMonth'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'receivingAndWarehousing/doPost122'
const listAPIName = 'receivingAndWarehousing/findList122'
</script>
