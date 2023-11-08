<template>
  <ToggleFormTransferWMS
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :type="imOclas"
    mode="one"
    scanlKey="objnr"
  />
</template>

<script lang="ts">
// 315机加件备料-WMS
const cachedName = 'machinedWarehousing.315MachinedPartsMaterialPreparation-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormTransferWMS from '@/views/businessComponents/ToggleFormTransferWMS.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'business/webapi/OutStock'
const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const imOclas = 'XWMS315'

</script>
