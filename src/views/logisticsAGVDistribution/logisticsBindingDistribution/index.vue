<template>
  <ToggleFormTransferAGV
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :codeType="codeType"
    :confirmTips="confirmTips"
    :generalCatalogue="false"
    confirmText="确定"
    mode="addTo"
    scanlKey="pickingNo"
  />
</template>

<script lang="ts">
// 后勤备料-WMS
const cachedName = 'logisticsAGVDistribution.logisticsStock'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormTransferAGV from '../businessComponents/ToggleFormTransferAGV.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'business/webapi/AGVBinding'
const listAPIName = 'business/webapi/getPickingExits'
const codeType = 'pickingNo'
const confirmTips = '是否确认配送？'
</script>
