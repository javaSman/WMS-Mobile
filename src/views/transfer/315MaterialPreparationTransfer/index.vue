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
// 315备料转移
const cachedName = 'transfer.315MaterialPreparationTransfer'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'divertBusiness/doPost315'
const listAPIName = 'divertBusiness/findList315'

</script>
