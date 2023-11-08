<template>
  <ToggleFormWMSVue
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :type="imOclas"
    :chkDisabled="true"
    mode="allAntDisable"
  />
</template>

<script lang="ts">
// 161跨月采购退货-WMS
const cachedName = 'receive.161PurchaseReturnGoodsExtendMonth-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSVue from '@/views/businessComponents/ToggleFormWMS.vue'
import { formList, showFormList, tableColumn } from './config'

const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const passAPIName = 'business/webapi/OutStock'
const imOclas = 'XWMS161'
</script>
