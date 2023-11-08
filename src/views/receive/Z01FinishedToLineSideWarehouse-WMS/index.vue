<template>
  <ToggleFormWMSVue
    ref="toggleFormVue"
    :formList="formList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :enterAfterEvent="handleReDataAgain"
    :type="imOclas"
    chkDisabled
    mode="all"
  />
</template>

<script lang="ts" setup name="receive.Z01FinishedToLineSideWarehouse-WMS">
// Z01成品入库-线边仓WMS
import ToggleFormWMSVue from '@/views/businessComponents/ToggleFormWMS.vue'
import { formList, tableColumn } from './config'

const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const passAPIName = 'business/webapi/PostIn'
const imOclas = 'XWMSZ01'

function handleReDataAgain(list: any[], _list: any[]) {
  list.forEach((item, index) => {
    item._erfmg = _list[index].erfmg
  })
}

</script>
