<template>
  <ToggleFormVue :formList="formList" :showFormList="showFormList" :tableColumn="tableColumn" :passAPIName="passAPIName" :listAPIName="listAPIName" />
</template>

<script lang="ts">
// 531副产品收货
const cachedName = 'shipment.531ByProductReceive'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = '/exportGoodsBusiness/doPost531'
const listAPIName = '/exportGoodsBusiness/findList531'
</script>
