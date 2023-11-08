<template>
  <ToggleFormWMSVue
    ref="toggleFormWMSVue"
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :type="imOclas"
    :submit="handleSubmit"
    mode="one"
    scanlKey="objnr"
    :autoSubmit="true"
    :onlyShowDoNotFillLocation="true"
    :isDisableChecked="true"
    :chkDisabled="true"
    :is-check-and-to-top="true"
  />
</template>

<script lang="ts" setup name="receive.105GoodToWarehouse-WMS">
// 105良品入库-WMS
import { ref } from 'vue'
import ToggleFormWMSVue from '@/views/businessComponents/ToggleFormWMS.vue'
import { formList, showFormList, tableColumn } from './config'

const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const passAPIName = 'business/webapi/PostIn'
const imOclas = 'XWMS105'

let toggleFormWMSVue = ref<InstanceType<typeof ToggleFormWMSVue> | null>(null)

/**
 * @param tcqty 良品数量
 * @param tqty  特采数量
 */
const computedQty = (tcqty: number, qcqty: number) => {
  if (tcqty > 0) return tcqty
  if (qcqty > 0) return qcqty
}

const computedType = (matnr: string, kdauf: string, onjnr: string) => {
  if (/^[a-zA-Z]|^2/.test(matnr)) {
    return kdauf + '-000001'
  } else {
    return onjnr
  }
}

// 获取过账（入库）的参数
const handleSubmit = (data: any) => {
  let _list = toggleFormWMSVue.value?.selectedList as any[]
  data.wmsPostInList.forEach((item: any, index: number) => {
    // tips 谁的数量不为空就取谁
    item.quantity = computedQty(Number(_list[index].tcqty), Number(_list[index].qcqty))
    // tips 这里要区分是外购件还是机加件,因为matnr已经被处理好了，所以只需要判断这个是否是以2开头或者字母开头，如果是就是机加件，否则是外购件
    item.barcode = computedType(_list[index].matnr, _list[index].kdauf, _list[index].objnr)
  })
  return false
}
</script>
