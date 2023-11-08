<template>
  <ToggleFormWMSCustom
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :type="imOclas"
    mode="addTo"
    scanlKey="boxNo"
  />
</template>

<script lang="ts">
// 盘点明细单号-WMS
const cachedName = 'WMSFunction.InventoryDetails-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSCustom from './components/ToggleFormWMSCustom.vue'
// import ToggleFormWMSVue from '../components/ToggleFormWMS.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'business/webapi/OutStock'
const listAPIName = 'business/webapi/GetBoxDetail'
const imOclas = ''
</script>
