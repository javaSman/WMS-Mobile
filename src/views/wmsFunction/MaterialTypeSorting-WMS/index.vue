<template>
  <ToggleFormWMSCustom
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    scanlKey="barcode"
  />
</template>

<script lang="ts">
// 物料类型分拣-WMS
const cachedName = 'WMSFunction.MaterialTypeSorting-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSCustom from './components/ToggleFormWMSCustom.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'business/webapi/MaterialBindBox'
const listAPIName = 'business/webapi/GetMaterialBarcodeList'
</script>
