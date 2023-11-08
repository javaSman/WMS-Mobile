<template>
  <ToggleFormVue
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="dataMap.tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    mode="handler"
    @clickHandler="handlePartList"
  />
  <!-- 配件清单对话框 -->
  <TableDialogVue v-model:visible="dataMap.visible" :tableData="dataMap.partList" :tableColumn="dataMap.partListTableColumn" />
</template>

<script lang="ts">
// 101PO收货入库
const cachedName = 'receive.101POReceiveToWarehouse'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import TableDialogVue from '@/views/businessComponents/TableDialog.vue'
import { reactive } from 'vue'
import { formList, showFormList, tableColumn } from './config'
import { ITableBtnParams, TableColumn } from '@/typing'
import { getPartList, partListTableColumn } from '@/views/mixins/PartList'

let dataMap = reactive({
  tableColumn,
  partList: [] as any[],
  partListTableColumn: JSON.parse(JSON.stringify(partListTableColumn)),
  visible: false
})

const passAPIName = 'receivingAndWarehousing/doPost101'
const listAPIName = 'receivingAndWarehousing/findList101'

// 按钮-配件清单
function handlePartList(key: string, data: any, index: number) {
  let tableBtnParams = (dataMap.tableColumn[2] as TableColumn).tableBtnParams as ITableBtnParams
  getPartList(key, data, index, dataMap, tableBtnParams)
}
</script>
