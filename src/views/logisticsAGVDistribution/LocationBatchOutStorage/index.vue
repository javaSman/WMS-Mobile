<template>
  <FormVue ref="formComponent" v-model:formData="dataMap.form" :formList="dataMap.formList" />
  <!-- 列表信息总览 -->
  <van-sticky :offset-top="46">
    <van-grid
      direction="horizontal"
      :column-num="3"
      :border="false"
      style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc"
    >
      <van-grid-item>总数：{{ tableData.length }}</van-grid-item>
      <van-grid-item>已确认：{{ selection.length }}</van-grid-item>
      <van-grid-item>剩余数：{{ tableData.length - selection.length }}</van-grid-item>
      <!-- <van-grid-item>
        <van-checkbox v-model="selectAll" shape="square" @click="handleSelectAll">全选</van-checkbox>
      </van-grid-item> -->
    </van-grid>
  </van-sticky>
  <!-- 列表 -->
  <TableVue
    ref="table"
    v-model:table-data="tableData"
    v-model:selection="selection"
    :tableColumn="dataMap.tableColumn"
    @click-handler=""
    @inputNumHandler=""
  />
  <div style="height: 50px" />
  <van-action-bar>
    <ActionBarVue
      ref="actionBarVue"
      :loading="dataMap.loading"
      :confirmText="'确定'"
      @clear="handleClear"
      @confirm="handleQueryInstorage"
    />
  </van-action-bar>
</template>

<script lang="ts">
// 物料凭证查询
const cachedName = 'logisticsAGVDistribution.LocationBatchOutStorage'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import FormVue from '@/components/Form/index.vue'
import TableVue from '@/components/singleTable/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { ref, reactive, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { WMSAPI } from '@/api/generalAPI'
import { formList, tableColumn } from './config'
import { showSuccessToast } from 'vant'
import { _showFailToast } from '@/utils/message'

const APIName = 'business/webapi'

let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
// 列表实例
let table = ref<InstanceType<typeof TableVue> | null>(null)
// 选中的数据
const selection = ref([])
const tableData = ref<any[]>([])

let dataMap = reactive({
  loading: false,
  selectAll: false,
  // selection: [] as any[],
  // list: [] as any[],
  formList,
  tableColumn,
  form: {
    projectNo: '',
    batchNo: '',
    stationNo: '',
    warehouseNo: '',
    siteNos: ''
  }
})
onMounted(() => {
  // 项目编号聚焦
  let projectNo = formComponent.value?.formInputRef.projectNo.inputRef
  projectNo.focus()
  wharf()
})
// 获取批次号
dataMap.formList[0].enter = batch
function batch() {
  WMSAPI.get(APIName, { projectNo: dataMap.form.projectNo }, 'GetBatchNos').then((res) => {
    if (res && res.success) dataMap.formList[1].options = res.result as any[]
  })
}
// 获取工位号
dataMap.formList[1].change = location
function location() {
  WMSAPI.get(APIName, { batchNo: dataMap.form.batchNo }, 'GetStationNos').then((res) => {
    if (res && res.success) dataMap.formList[2].options = res.result as any[]
  })
}
// 获取仓库
function wharf() {
  WMSAPI.get(APIName, {}, 'GetWarehouseNos').then((res) => {
    if (res && res.success) dataMap.formList[3].options = res.result as any[]
  })
}
// 获取站点
dataMap.formList[3].change = stations
function stations() {
  WMSAPI.get(APIName, { warehouseNo: dataMap.form.warehouseNo }, 'GetSiteNos').then((res) => {
    if (res && res.success) dataMap.formList[4].options = res.result as any[]
  })
}
// 查询表格数据
dataMap.formList[2].change = getList
function getList() {
  WMSAPI.get(APIName, { stationNo: dataMap.form.stationNo }, 'GetBoxNos').then((res) => {
    if (res && res.success) tableData.value = res.result as any[]
    let _data: any[] = tableData.value as any[]
    // 混入唯一值，用于勾选数据
    tableData.value = _data.map((item) => ({ ...item, uuid: uuidv4(), boxID: item.boxId }))
  })
}

// 确定
function handleQueryInstorage() {
  formComponent.value?.refForm.validate().then(() => {
    let data = JSON.parse(JSON.stringify(selection.value))
    let userInfo = localStorage.getItem('userInfo')
    let text = eval('(' + userInfo + ')')
    let content = {
      boxNo: data[0].boxId,
      agvSite: dataMap.form.siteNos,
      operatorNo: text.account,
      operatorName: text.name
    }
    WMSAPI.post(APIName, content, 'BoxOutbound').then((res) => {
      if (res && res.success) showSuccessToast(res.message as string)
      else _showFailToast(res.message as string)
    })
  })
}
// 清除
function handleClear() {
  dataMap.form = {
    projectNo: '',
    batchNo: '',
    stationNo: '',
    siteNos: '',
    warehouseNo: ''
  }
  tableData.value = []
  selection.value = []
  dataMap.formList[1].options = []
  dataMap.formList[2].options = []
  dataMap.formList[4].options = []
  // 清除验证信息
  formComponent.value?.refForm.resetValidation()
}
</script>
