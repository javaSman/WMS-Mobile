<template>
  <ToggleFormTransferAGV
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :enterFrontEvent="getImOclas"
    :type="dataMap.imOclas"
    :location="dataMap.location"
    mode="all"
    scanlKey="reqno"
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
import { reactive } from 'vue'
import ToggleFormTransferAGV from '../businessComponents/ToggleFormTransferAGV.vue'
import { formList, showFormList, tableColumn } from './config'
import { WMSAPI } from '@/api/generalAPI'
import { _showFailToast } from '@/utils/message'
const passAPIName = 'business/webapi/PickingFinished'
const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
let dataMap = reactive({
  imOclas: '',
  location: '' // 配送地点
  // imOclas: 'XWMS201'
})

async function getImOclas(val) {
  // 根据备料单号查询备料单是否存在及当前状态
  try {
    let res = await WMSAPI.get('business/webapi/getPickingExits', { pickingNo: val })
    if (res.success) {
      dataMap.imOclas = res.oclas
      dataMap.location = res.destination
      if (!res.oclas) {
        _showFailToast('未查到该领料单的移动类型')
        return true
      }
    } else {
      _showFailToast(res.message as string)
      return true
    }
  } catch (e) {
    console.log(e)
  }
}
</script>
