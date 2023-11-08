<template>
  <ToggleFormVue
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    mode="one"
    scanlKey="reqno"
  />
</template>

<script lang="ts">
// 301工厂间调拨
const cachedName = 'transfer.301TransferBetweenFactories'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'divertBusiness/doPost301'
const listAPIName = 'divertBusiness/findList301'

</script>
