<template>
  <ToggleFormMachinedWareHousingWMS
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :type="imOclas"
  />
</template>

<script lang="ts" setup name="machinedWarehousing.261MachinedPartsMaterialPreparationAndIssuance-WMS">
// 261机加件备料发料-WMS
import { formList, showFormList, tableColumn } from './config'
import ToggleFormMachinedWareHousingWMS from '@/views/businessComponents/ToggleFormMachinedWareHousingWMS.vue'

const passAPIName = 'business/webapi/OutStock'
const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'

const imOclas = 'XWMS261'

</script>
