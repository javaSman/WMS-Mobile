<template>
  <ToggleFormWMSVue
    ref="toggleFormWMSVue"
    :formList="dataMap.formList"
    :showFormList="showFormList"
    :tableColumn="dataMap.tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :type="imOclas"
    mode="one"
    scanlKey="objnr"
    @clickHandler="handlePartList"
    :auto-submit="true"
    :chkDisabled="true"
    :is-disable-checked="true"
    :is-check-and-to-top="true"
    :is-all-select-and-submit="true"
  />
  <!-- 配件清单对话框 -->
  <TableDialogVue
    v-model:visible="dataMap.visible"
    :tableData="dataMap.partList"
    :tableColumn="dataMap.partListTableColumn"
  />
</template>

<script lang="ts" setup name="receive.103POReceiveToQuality-WMS">
// 103PO收货到质检-WMS
import { reactive } from 'vue'
import ToggleFormWMSVue from '@/views/businessComponents/ToggleFormWMS.vue'
import TableDialogVue from '@/views/businessComponents/TableDialog.vue'
import { formList, showFormList, tableColumn } from './config'
import { ITableBtnParams, TableColumn } from '@/typing'
import { getPartList, partListTableColumn } from '@/views/mixins/PartList'

let dataMap = reactive({
  formList,
  tableColumn,
  partList: [] as any[],
  partListTableColumn: JSON.parse(JSON.stringify(partListTableColumn)),
  visible: false
})

const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const passAPIName = 'business/webapi/PostIn'
const imOclas = 'XWMS103'

// 按钮-配件清单
function handlePartList(key: string, data: any, index: number) {
  let tableBtnParams = (dataMap.tableColumn[4] as TableColumn).tableBtnParams as ITableBtnParams
  getPartList(key, data, index, dataMap, tableBtnParams)
}
</script>
