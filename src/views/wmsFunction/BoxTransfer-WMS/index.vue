<template>
  <ToggleFormWMSCustom
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :boxIDAPIName="boxIDAPIName"
    :chk-disabled="true"
    :type="imOclas"
    mode="all"
    scanlKey="barcode"
  />
</template>

<script lang="ts">
// 整箱物料调拨-WMS
const cachedName = 'WMSFunction.BoxTransfer-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSCustom from './components/ToggleFormWMSCustom.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'business/webapi/OutStock'
const boxIDAPIName = 'business/webapi/GetBoxDetail'
const imOclas = ''
</script>
