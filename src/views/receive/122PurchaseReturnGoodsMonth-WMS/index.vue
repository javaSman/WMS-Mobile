<template>
  <ToggleFormWMSVue
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :type="imOclas"
    mode="allAntDisable"
    :chkDisabled="true"
  />
</template>

<script lang="ts">
// 122当月采购退货-WMS
const cachedName = 'receive.122PurchaseReturnGoodsMonth-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSVue from '@/views/businessComponents/ToggleFormWMS.vue'
import { formList, showFormList, tableColumn } from './config'

const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const passAPIName = 'business/webapi/OutStock'
const imOclas = 'XWMS122'
</script>
