<template>
  <ToggleFormVue
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    @clickHandler="handlePartList"
    mode="one"
    scanlKey="reqno"
  />
  <!-- 配件清单对话框 -->
  <TableDialogVue v-model:visible="dataMap.visible" :tableData="dataMap.partList" :tableColumn="dataMap.partListTableColumn" />
</template>

<script lang="ts">
// Z41维修品出库
const cachedName = 'transfer.Z41RepairProductDelivery'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import TableDialogVue from '@/views/businessComponents/TableDialog.vue'
import { reactive } from 'vue'
import { formList, showFormList, tableColumn } from './config'
import { TableColumn, ITableBtnParams } from '@/typing'
import { getPartList, partListTableColumn } from '@/views/mixins/PartList'

let dataMap = reactive({
  tableColumn,
  partList: [] as any[],
  partListTableColumn: JSON.parse(JSON.stringify(partListTableColumn)),
  visible: false,
  disabledChkAll: false
})

const passAPIName = 'divertBusiness/doPostZ41'
const listAPIName = 'divertBusiness/findListZ41'
// 按钮-配件清单
function handlePartList(key: string, data: any, index: number) {
  let tableBtnParams = (dataMap.tableColumn[2] as TableColumn).tableBtnParams as ITableBtnParams
  getPartList(key, data, index, dataMap, tableBtnParams)
}
</script>
