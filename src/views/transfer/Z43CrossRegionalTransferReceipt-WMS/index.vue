<template>
  <ToggleFormWMSVue
    ref="toggleFormWMSVue"
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :type="imOclas"
    mode="one"
    scanlKey="reqno"
    @clickHandler="handlePartList"
    :submit="customSumbmit"
    :is-all-select-and-submit="true"
    :is-check-and-to-top="true"
  />
  <!-- 配件清单对话框 -->
  <TableDialogVue
    v-model:visible="dataMap.visible"
    :tableData="dataMap.partList"
    :tableColumn="dataMap.partListTableColumn"
  />
</template>

<script lang="ts" setup name="transfer.Z43CrossRegionalTransferReceipt-WMS">
// Z43跨区域调拨入库-WMS
import ToggleFormWMSVue from '@/views/businessComponents/ToggleFormWMS.vue'
import { formList, showFormList, tableColumn } from './config'
import { reactive, ref } from 'vue'
import { getPartList, partListTableColumn } from '@/views/mixins/PartList'
import { ITableBtnParams, TableColumn } from '@/typing'
import TableDialogVue from '@/views/businessComponents/TableDialog.vue'
const passAPIName = 'business/webapi/PostIn'
const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const imOclas = 'XWMSZ43'
let dataMap = reactive({
  formList,
  tableColumn,
  partList: [] as any[],
  partListTableColumn: JSON.parse(JSON.stringify(partListTableColumn)),
  visible: false
})
let toggleFormWMSVue = ref<InstanceType<typeof ToggleFormWMSVue> | null>(null)
// 按钮-配件清单
function handlePartList(key: string, data: any, index: number) {
  let tableBtnParams = (dataMap.tableColumn[5] as TableColumn).tableBtnParams as ITableBtnParams
  getPartList(key, data, index, dataMap, tableBtnParams)
}
// tips: 增加自定义过账方法，增强参数
const customSumbmit = async (data: any) => {
  let _list = toggleFormWMSVue.value?.selectedList as any[]
  data.wmsPostInList.forEach((item: any, index: number) => {
    // tips:前端将字段“reqno”拼接符号“-”“rspos”作为WMS的barcode
    item.barcode = _list[index].reqno + '-' + _list[index].rspos
  })
  return false
}
</script>
