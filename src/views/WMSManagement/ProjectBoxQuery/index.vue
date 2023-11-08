<template>
  <ToggleFormWMSCustom :formList="formList" :tableColumn="tableColumn" :getDetailAPIName="getDetailAPIName" :confirmText="confirmText" />
</template>

<script lang="ts">
// 项目箱号查询
const cachedName = 'WMSManagement.ProjectBoxQuery-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSCustom from './components/ToggleFormWMSCustom.vue'
import { formList, tableColumn } from './config'

const getDetailAPIName = 'business/webapi/GetMaterialBarcodeList'
const confirmText = '查询'
</script>
