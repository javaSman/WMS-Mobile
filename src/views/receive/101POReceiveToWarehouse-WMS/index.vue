<template>
  <ToggleFormWMSVue
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :type="imOclas"
    mode="one"
    scanlKey="matnr"
    :autoSubmit="true"
  />
</template>

<script lang="ts">
// 101PO收货入库-WMS
const cachedName = 'receive.101POReceiveToWarehouse-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSVue from '@/views/businessComponents/ToggleFormWMS.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'business/webapi/PostIn'
const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const imOclas = 'XWMS101'
</script>
