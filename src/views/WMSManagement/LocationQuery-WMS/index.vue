<template>
  <ToggleFormWMSCustom
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :getDetailAPIName="getDetailAPIName"
    :confirmText="confirmText"
  />
</template>

<script lang="ts">
// WMS区域查询
const cachedName = 'WMSManagement.LocationQuery-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSCustom from './components/ToggleFormWMSCustom.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'business/webapi/BoxUnBindLocation'
const getDetailAPIName = 'business/webapi/GetBoxListByLocationNo'
const confirmText = '解绑'
</script>
