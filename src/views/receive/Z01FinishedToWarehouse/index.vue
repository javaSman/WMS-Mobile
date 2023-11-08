<template>
  <ToggleFormVue
    ref="toggleFormVue"
    :formList="formList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :enterFrontEvent="handleQueryDeliveryDate"
    :enterAfterEvent="handleReDataAgain"
    chkDisabled
    mode="all"
  />
</template>

<script lang="ts">
// Z01成品入库
const cachedName = 'receive.Z01FinishedToWarehouse'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import { MISWMSAPI } from '@/api/generalAPI'
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import { formList, tableColumn } from './config'
import { _showFailToast } from '@/utils/message'

const passAPIName = 'receivingAndWarehousing/doPostZ01'
const listAPIName = 'receivingAndWarehousing/findListZ01'
const getDeliveryDate = 'mes/getDeliveryDate'
const fourteenDay = 1000 * 60 * 60 * 24 * 14

function handleReDataAgain(list: any[], _list: any[]) {
  list.forEach((item, index) => {
    item._erfmg = _list[index].erfmg
  })
}

/**
 * 查询军令状纳期
 * @param barcode 当前条码
 * @param postDate 当前过账日期
 * @description 与当前所选择过账时间对比，相差 >=14 天则提示：物料号+物料提前交货大于等于14天
 */
async function handleQueryDeliveryDate(barcode: string, postDate: string) {
  MISWMSAPI.post(getDeliveryDate, { imBarcode: barcode }).then((res) => {
    if (res && res.success) {
      // 比较
      let pD = new Date(postDate).getTime()
      let { deliveryDate, materialNo } = res.data as any
      if (!deliveryDate) {
        _showFailToast('军令状纳期不存在！')
        return
      }
      let dD = new Date(deliveryDate).getTime()
      if (dD - pD >= fourteenDay) {
        _showFailToast(materialNo + '物料提前交货大于等于14天')
      }
    } else _showFailToast(res.data as string)
  })
}
</script>
