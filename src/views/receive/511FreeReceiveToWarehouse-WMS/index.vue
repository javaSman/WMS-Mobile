<template>
  <ToggleFormWMSVue
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :type="imOclas"
    mode="addTo"
    scanlKey="barcode"
  />
</template>

<script lang="ts">
// 511免费收货入库
const cachedName = 'receive.511FreeReceiveToWarehouse'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSVue from '@/views/businessComponents/ToggleFormWMS.vue'
import { formList, showFormList, tableColumn } from './config'

const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const passAPIName = 'business/webapi/OutStock'
const imOclas = 'XWMS511'
</script>
