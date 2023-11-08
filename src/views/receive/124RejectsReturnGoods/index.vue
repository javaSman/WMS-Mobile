<template>
  <ToggleFormVue
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    mode="handler"
  />
</template>

<script lang="ts">
// 124不良品退货
const cachedName = 'receive.124RejectsReturnGoods'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'receivingAndWarehousing/doPost124'
const listAPIName = 'receivingAndWarehousing/findList124'

</script>
