<template>
  <ToggleFormWMSCustom
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :boxIDAPIName="boxIDAPIName"
    :type="imOclas"
    mode="one"
    scanlKey="barcode"
  />
  <UserAuth v-model:visible="userAuthVisible" v-model:extra="extraParams" />
</template>

<script lang="ts">
// 261 机加件发料-按箱-WMS
const cachedName = 'WMSManagement.261MachinedPartsMaterialIssuanceByBox-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormWMSCustom from './components/ToggleFormWMSCustom.vue'
import UserAuth from '@/views/businessComponents/UserAuth.vue'
import { formList, showFormList, tableColumn } from './config'
import useAuth from './hooks/useAuth'
const { userAuthVisible, extraParams } = useAuth()
const passAPIName = 'business/webapi/OutStock'
const boxIDAPIName = 'business/webapi/GetBoxDetail'
const imOclas = ''
</script>
