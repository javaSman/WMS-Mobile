<template>
  <ToggleFormVue :formList="formList" :showFormList="showFormList" :tableColumn="tableColumn" :passAPIName="passAPIName" :listAPIName="listAPIName" />
</template>

<script lang="ts">
// 262生产退料
const cachedName = 'shipment.262ProductionReturn'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = '/exportGoodsBusiness/doPost262'
const listAPIName = '/exportGoodsBusiness/findList262'
</script>
