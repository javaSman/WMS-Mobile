<template>
  <!-- 表单布局 -->
  <van-cell-group>
    <van-cell title-class="toggleFormCellTitle" style="padding-left: 0; padding-right: 0; border-radius: 0">
      <template #title>
        <!-- <van-icon :name="dataMap.show ? 'arrow-down' : 'arrow'" @click="dataMap.show = !dataMap.show" /> -->
      </template>
      <template #value>
        <FormVue ref="formComponent" v-model:formData="dataMap.form" :formList="dataMap.formList" />
      </template>
    </van-cell>
  </van-cell-group>
  <!-- 隐藏字段布局 -->
  <!-- <van-cell-group v-show="dataMap.show" style="padding-left: 20px" class="showInfo">
      <van-list>
        <van-cell v-for="item in showInfo" :key="item.prop" :title="item.label">{{ (dataMap.form as any)[item.prop] }}</van-cell>
      </van-list>
    </van-cell-group> -->
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
    </van-grid>
  </van-sticky>
  <TableVue
    ref="table"
    v-model:table-data="tableData"
    v-model:selection="selection"
    :tableColumn="dataMap.tableColumn"
    @click-handler=""
    @inputNumHandler=""
  />
  <!-- 底部按钮 -->
  <div style="height: 50px" />
  <ActionBarVue
    ref="actionBarVue"
    :loading="dataMap.loading"
    :confirmText="confirmText"
    @clear="handleClear"
    @confirm="submit"
  />
</template>

<script lang="ts">
// 料架出库-WMS
const cachedName = 'logisticsAGVDistribution.materialRackOutbound-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import FormVue from '@/components/Form/index.vue'
import TableVue from '@/components/singleTable/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { v4 as uuidv4 } from 'uuid'
import { ref, reactive, onMounted } from 'vue'
import { WMSAPI } from '@/api/generalAPI'
import { formList, tableColumn } from './config'
import { showSuccessToast } from 'vant'
import { _showFailToast } from '@/utils/message'
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
const tableData = ref<any[]>([])
// 选中的数据
const selection = ref([])
onMounted(() => {
  let inputRef = formComponent.value?.formInputRef.projectNo.inputRef
  inputRef.focus()
  WMSAPI.get('business/webapi', {}, 'GetWarehouseNos').then((res) => {
    dataMap.formList[3].options = res.result as any[]
  })
})
const confirmText = ref('确认')
let dataMap = reactive({
  list: [] as any[],
  formList,
  form: {} as any,
  show: false,
  loading: false,
  tableColumn
})
let user = localStorage.getItem('userInfo')
let userName = eval('(' + user + ')')
dataMap.formList[0].enter = handleQueryInventory
dataMap.formList[1].change = handleChange
dataMap.formList[2].change = handleStationNo
dataMap.formList[3].change = handleSiteNos
function handleQueryInventory() {
  WMSAPI.get('business/webapi', { projectNo: dataMap.form.projectNo }, 'GetBatchNos').then((res) => {
    // console.log(res.result)
    if (res && res.success) {
      dataMap.formList[1].options = res.result as any[]
    }
  })
}
function handleChange() {
  WMSAPI.get('business/webapi', { batchNo: dataMap.form.batchNo }, 'GetStationNos').then((res) => {
    if (res && res.success) {
      dataMap.formList[2].options = res.result as any[]
    }
  })
}
function handleSiteNos() {
  WMSAPI.get('business/webapi', { warehouseNo: dataMap.form.warehouseNo }, 'GetSiteNos').then((res) => {
    dataMap.formList[4].options = res.result as any[]
  })
}
function handleStationNo() {
  WMSAPI.get('business/webapi', { stationNo: dataMap.form.stationNo, getMaterialShelf: true }, 'GetBoxNos').then(
    (res) => {
      if (res && res.success) {
        tableData.value = res.result as any[]
        let _data: any[] = tableData.value as any[]
        tableData.value = _data.map((item) => ({
          ...item,
          uuid: uuidv4(),
          boxId: item.boxId,
          materialShelfNo: item.materialShelfNo,
          materialShelfStatus: item.materialShelfStatus
        }))
      }
    }
  )
}
function submit() {
  let data = JSON.parse(JSON.stringify(selection.value))
  // console.log(data)
  WMSAPI.post(
    'bussiness/webapi',
    {
      materialShelfNo: data[0].materialShelfNo,
      agvSite: dataMap.form.agvSite,
      operatorNo: userName.account,
      operatorName: userName.name
    },
    'ShelfOutStorage'
  ).then((res) => {
    if (res && res.success) {
      showSuccessToast(res.message as string)
    } else {
      _showFailToast(res.message as string)
    }
  })
}
// 清除
function handleClear() {
  dataMap.form = {}
  tableData.value = []
  dataMap.formList[1].options = []
  dataMap.formList[2].options = []
}
</script>

<style lang="scss" scoped>
// .showInfo {
//   :deep(.van-cell-group) {
//     border-radius: 0;
//   }
//   :deep(.van-cell__title) {
//     width: 80px;
//     display: block;
//     flex: none;
//     text-align: right;
//     padding-right: 10px;
//   }
// }
</style>
