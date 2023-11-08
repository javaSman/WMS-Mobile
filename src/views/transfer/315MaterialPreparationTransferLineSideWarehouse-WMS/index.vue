<template>
  <ToggleFormWMS
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
// 315辅料备料转移-线边仓WMS
const cachedName = 'transfer.315MaterialPreparationTransferLineSideWarehouse-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMS from '@/views/businessComponents/ToggleFormWMS.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'business/webapi/OutStock'
const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const imOclas = 'XWMS315'

</script>
