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
// Z44跨区域调拨拣货
const cachedName = 'transfer.Z44CrossRegionalTransferPicking'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import TableDialogVue from '@/views/businessComponents/TableDialog.vue'
import { formList, showFormList, tableColumn } from './config'
import { reactive } from 'vue'
import { ITableBtnParams, TableColumn } from '@/typing'
import { getPartList, partListTableColumn } from '@/views/mixins/PartList'

const passAPIName = 'divertBusiness/doPostZ44'
const listAPIName = 'divertBusiness/findListZ44'

let dataMap = reactive({
  tableColumn,
  partList: [] as any[],
  partListTableColumn: JSON.parse(JSON.stringify(partListTableColumn)),
  visible: false
})

// 按钮-配件清单
function handlePartList(key: string, data: any, index: number) {
  let tableBtnParams = (dataMap.tableColumn[3] as TableColumn).tableBtnParams as ITableBtnParams
  getPartList(key, data, index, dataMap, tableBtnParams)
}
</script>
