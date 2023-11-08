<template>
  <ToggleFormVue
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    mode="handler"
    @clickHandler="handlePartList"
  />
    <!-- 配件清单对话框 -->
  <TableDialogVue v-model:visible="dataMap.visible" :tableData="dataMap.partList" :tableColumn="partListTableColumn" />
</template>

<script lang="ts">
// 202部门退料
const cachedName = 'shipment.202DeptReturn'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import TableDialogVue from '@/views/businessComponents/TableDialog.vue'
import { formList, showFormList, tableColumn } from './config'
import { getPartList, partListTableColumn } from '@/views/mixins/PartList'
import { ITableBtnParams, TableColumn } from '@/typing'
import { reactive } from 'vue'
const passAPIName = '/exportGoodsBusiness/doPost202'
const listAPIName = '/exportGoodsBusiness/findList202'
let dataMap = reactive({
  tableColumn,
  partList: [] as any[],
  partListTableColumn: JSON.parse(JSON.stringify(partListTableColumn)),
  visible: false
})
// 点击配件清单时
const handlePartList = (key: string, data: any, index: number) => {
  let tableBtnParams = (dataMap.tableColumn[2] as TableColumn).tableBtnParams as ITableBtnParams
  getPartList(key, data, index, dataMap, tableBtnParams)
}
</script>
