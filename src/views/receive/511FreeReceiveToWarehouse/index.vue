<template>
  <ToggleFormVue
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
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
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'receivingAndWarehousing/doPost511'
const listAPIName = 'receivingAndWarehousing/findList511'

</script>
