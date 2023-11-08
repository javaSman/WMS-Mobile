<template>
  <ToggleFormVue
    ref="toggleFormVue"
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :enterAfterEvent="handleSelectAll"
    @clickHandler="handlePartList"
    mode="one"
    scanlKey="reqno"
  />
  <!-- 配件清单对话框 -->
  <TableDialogVue v-model:visible="dataMap.visible" :tableData="dataMap.partList" :tableColumn="dataMap.partListTableColumn" />
</template>

<script lang="ts">
// Z43跨区域调拨入库
const cachedName = 'transfer.Z43CrossRegionalTransferReceipt'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import TableDialogVue from '@/views/businessComponents/TableDialog.vue'
import { formList, showFormList, tableColumn } from './config'
import { ITableBtnParams, TableColumn } from '@/typing'
import { getPartList, partListTableColumn } from '@/views/mixins/PartList'
import { reactive, ref } from 'vue'

const passAPIName = 'divertBusiness/doPostZ43'
const listAPIName = 'divertBusiness/findListZ43'

let dataMap = reactive({
  tableColumn,
  partList: [] as any[],
  partListTableColumn: JSON.parse(JSON.stringify(partListTableColumn)),
  visible: false
})

let toggleFormVue = ref<InstanceType<typeof ToggleFormVue> | null>(null)

// 按钮-配件清单
function handlePartList(key: string, data: any, index: number) {
  let tableBtnParams = (dataMap.tableColumn[3] as TableColumn).tableBtnParams as ITableBtnParams
  getPartList(key, data, index, dataMap, tableBtnParams)
}

function handleSelectAll(list: any[], _list: any[]) {
  let uuidList = list.map((item) => item.uuid)
  toggleFormVue.value?.table?.handleSelect(uuidList)
}
</script>
