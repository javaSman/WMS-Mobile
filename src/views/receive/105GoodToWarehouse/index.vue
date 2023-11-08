<template>
  <ToggleFormVue
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    mode="one"
    scanlKey="objnr"
  />

</template>

<script lang="ts">
// 105良品入库
const cachedName = 'receive.105GoodToWarehouse'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'receivingAndWarehousing/doPost105GoodProducts'
const listAPIName = 'receivingAndWarehousing/findList105GoodProducts'

</script>
