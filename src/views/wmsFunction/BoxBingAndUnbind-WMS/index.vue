<template>
  <ToggleFormWMSCustom :formList="formList" :showFormList="showFormList" :passAPIName="passAPIName" />
</template>

<script lang="ts">
// 载具绑定/解绑货位-WMS
const cachedName = 'WMSFunction.InventoryBind-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSCustom from './components/ToggleFormWMSCustom.vue'
import { formList, showFormList } from './config'

const passAPIName = 'business/webapi/BoxBindOrUnbindingArea'
</script>
