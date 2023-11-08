<template>
  <ToggleFormVue
    mode="handler"
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
  />
</template>

<script lang="ts">
// Z04工具退料
const cachedName = 'shipment.Z04ToolReturn'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = '/exportGoodsBusiness/doPostZ04'
const listAPIName = '/exportGoodsBusiness/findListZ04'

// 控制是否鉴权
</script>
