<template>
  <ToggleFormWMSCustom
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :type="imOclas"
    scanlKey="barcode"
  />
</template>

<script lang="ts">
// 不良箱号绑定
const cachedName = 'WMSFunction.BadBoxBind'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSCustom from './components/ToggleFormWMSCustom.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'business/webapi/PostIn'
const listAPIName = 'business/webapi/GetMaterialBarcodeList'
</script>
