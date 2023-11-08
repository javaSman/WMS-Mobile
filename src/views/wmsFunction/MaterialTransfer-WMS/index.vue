<template>
  <ToggleFormWMSCustom
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :boxIDAPIName="boxIDAPIName"
  />
</template>

<script lang="ts">
// 物料箱号调拨-WMS
const cachedName = 'WMSFunction.MaterialTransfer-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSCustom from './components/ToggleFormWMSCustom.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'business/webapi/OutStock'
const listAPIName = 'business/webapi/GetMaterialBarcodeList'
const boxIDAPIName = 'business/webapi/GetBoxDetail'
</script>
