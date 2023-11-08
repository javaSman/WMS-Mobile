<template>
  <ToggleFormWMSCustom
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :wmsOclas="wmsOclas"
    scanlKey="barcode"
  />
</template>

<script lang="ts">
// 库存绑定-WMS
const cachedName = 'WMSFunction.InventoryBind-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSCustom from './components/ToggleFormWMSCustom.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'business/webapi/PostIn'
const listAPIName = 'business/webapi/GetMaterialBarcodeList'
const wmsOclas = '库存绑定'
</script>
