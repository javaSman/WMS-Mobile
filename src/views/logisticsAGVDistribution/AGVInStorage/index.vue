<template>
  <FormVue ref="formComponent" v-model:formData="dataMap.form" :formList="dataMap.formList" />
  <div style="height: 50px" />
  <van-action-bar>
    <!-- <van-action-bar-button type="default" text="清除" @click="handleClear" /> -->
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
const cachedName = 'logisticsAGVDistribution.AGVInStorage'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import FormVue from '@/components/Form/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { ref, reactive, onMounted } from 'vue'
import { WMSAPI } from '@/api/generalAPI'
import { formList } from './config'
import { showSuccessToast } from 'vant'
import { _showFailToast } from '@/utils/message'

const APIName = 'business/webapi'
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)

let dataMap = reactive({
  loading: false,
  formList,
  form: {
    storehouse: '',
    wharf: '',
    boxId: '',
    stations: ''
  },
  locations: [
    { text: '01层', value: '01层' },
    { text: '02层', value: '02层' },
    { text: '03层', value: '03层' },
    { text: '04层', value: '04层' },
    { text: '05层', value: '05层' }
  ]
})
onMounted(() => {
  storehouse()
  // 聚焦
  // let wharf = formComponent.value?.formInputRef.x2.inputRef
  // wharf.focus()
})
// 获取仓库
function storehouse() {
  WMSAPI.get(APIName, {}, 'GetWarehouseNos').then((res) => {
    if (res && res.success) dataMap.formList[0].options = res.result as any[]
  })
}
// 获取仓库层高
dataMap.formList[0].change = getFloor
function getFloor() {
  WMSAPI.get(APIName, { warehouseNo: dataMap.form.storehouse }, 'GetFloorHeight').then((res) => {
    if (res && res.success) dataMap.formList[3].options = res.result as any[]
  })
}
// 获取码头
dataMap.formList[1].enter = getWharf
function getWharf() {
  WMSAPI.get(APIName, { boxNo: dataMap.form.boxId }, 'GetBox').then((res) => {
    if (res && res.success) dataMap.form.wharf = res.result.locationNo
  })
}
// 确定
function handleQueryInstorage() {
  formComponent.value?.refForm.validate().then(() => {
    let userInfo = localStorage.getItem('userInfo')
    let text = eval('(' + userInfo + ')')
    let data = {
      warehouseNo: dataMap.form.storehouse,
      boxNo: dataMap.form.boxId,
      locationNo: dataMap.form.wharf,
      floor: dataMap.form.stations.substring(0, dataMap.form.stations.length - 1),
      operatorNo: text.account,
      operatorName: text.name
    }
    WMSAPI.post(APIName, data, 'BoxInStorage').then((res) => {
      if (res && res.success) showSuccessToast(res.message as string)
      else _showFailToast(res.message as string)
    })
  })
}
// 清除
function handleClear() {
  dataMap.form = {
    storehouse: '',
    wharf: '',
    boxId: '',
    stations: ''
  }
  dataMap.formList[3].options = []
  // 清除验证信息
  formComponent.value?.refForm.resetValidation()
}
// initFormList()
</script>
