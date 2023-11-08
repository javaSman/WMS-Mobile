<template>
  <ToggleFormWMSCustom
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    mode="all"
  />
</template>

<script lang="ts">
// 物料主数据信息修改-WMS
const cachedName = 'WMSFunction.MaterialInfoModify-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSCustom from './components/ToggleFormWMSCustom.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'business/webapi/MasterDataModify'
const listAPIName = 'business/webapi/GetMaterialListByBarcode'
// const listAPIName = 'business/webapi/GetMaterialList'
</script>
