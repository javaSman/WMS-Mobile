<template>
  <ToggleFormVue
    ref="toggleFormVue"
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="dataMap.tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :enterAfterEvent="handleReDataAgain"
    :submit="handleSubmit"
    @clickHandler="handlePartList"
    mode="one"
    scanlKey="reqno"
  />
  <!-- 配件清单对话框 -->
  <TableDialogVue
    v-model:visible="dataMap.visible"
    :tableData="dataMap.partList"
    :tableColumn="dataMap.partListTableColumn"
  />
</template>

<script lang="ts">
// Z42维修品收货
const cachedName = 'transfer.Z42RepairGoodsReceipt'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import TableDialogVue from '@/views/businessComponents/TableDialog.vue'
import { reactive, ref } from 'vue'
import { showSuccessToast } from 'vant'
import { formList, showFormList, tableColumn } from './config'
import { MISWMSAPI } from '@/api/generalAPI'
import { TableColumn, ITableBtnParams } from '@/typing'
import { getPartList, partListTableColumn } from '@/views/mixins/PartList'
import { _showFailToast } from '@/utils/message'

let dataMap = reactive({
  tableColumn,
  partList: [] as any[],
  partListTableColumn: JSON.parse(JSON.stringify(partListTableColumn)),
  visible: false,
  disabledChkAll: false
})

const passAPIName = 'divertBusiness/doPostZ42'
const listAPIName = 'divertBusiness/findListZ42'

let toggleFormVue = ref<InstanceType<typeof ToggleFormVue> | null>(null)

// 按钮-配件清单
function handlePartList(key: string, data: any, index: number) {
  let tableBtnParams = (dataMap.tableColumn[2] as TableColumn).tableBtnParams as ITableBtnParams
  getPartList(key, data, index, dataMap, tableBtnParams)
}
// 输入框回车后重新组合数据
function handleReDataAgain(list: any[], _list: any[]) {
  list.forEach((item, index) => {
    item._werks = `${_list[index].werks}-${_list[index].lgort}`
  })
}
// 提交前数据组合
async function handleSubmit(data: any) {
  let _list: any[] = JSON.parse(JSON.stringify(data.data))
  let flag = true
  // 重新处理数据
  _list.forEach((item) => {
    let arr = item._werks.split('-')
    item.werks = arr[0]
    item.lgort = arr[1]
    delete item._werks
  })
  if (!flag) return

  return new Promise((resolve, rejects) => {
    MISWMSAPI.post(passAPIName, data)
      .then((res) => {
        if (res && res.success) {
          showSuccessToast(res.msg)
          // 清空表单和列表
          toggleFormVue.value?.clearHandler()
          resolve(true)
        } else {
          _showFailToast(res.data as string)
          resolve(true)
        }
      })
      .catch(() => {
        resolve(true)
      })
  })
}
</script>
