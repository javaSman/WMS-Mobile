<template>
  <ToggleFormVue
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    scanlKey="objnr"
    mode="one"
  />
</template>

<script lang="ts">
// 103PO收货到质检
const cachedName = 'receive.103POReceiveToQuality'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'receivingAndWarehousing/doPost103'
const listAPIName = 'receivingAndWarehousing/findList103'
</script>
