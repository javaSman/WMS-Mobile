<template>
  <ToggleFormWMSVue
    ref="toggleFormWMSVue"
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :type="imOclas"
    mode="all"
    :isPass="dataMap.isPass"
    v-model:snrc="dataMap.list"
    v-model:barcode="dataMap.barcode"
    :submit="handleSubmit"
    @clickHandler="handleClickSerialNumber"
    :is-all-select-and-submit="true"
  />
  <serialNumberVue
    v-model:visible="dataMap.visible"
    :list="dataMap.list"
    v-model:isPass="dataMap.isPass"
    :barcode="dataMap.barcode"
  />
</template>

<script lang="ts" setup name="transfer.Z31TransferToWarehouse-WMS">
// Z31转移到结算仓/样机仓-WMS
import ToggleFormWMSVue from '@/views/businessComponents/ToggleFormWMS.vue'
import serialNumberVue from './serialNumber.vue'
import { reactive, ref, watch } from 'vue'
import { formList, showFormList, tableColumn } from './config'

const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const passAPIName = 'business/webapi/OutStock'
const imOclas = 'XWMSZ31'

let dataMap = reactive({
  visible: false,
  list: [] as any[],
  isPass: false,
  barcode: '' // 扫码的条码值
})

let toggleFormWMSVue = ref<InstanceType<typeof ToggleFormWMSVue> | null>(null)

// 判断序列号的条件，如果数组不存在，则允许过账
watch(
  () => dataMap.list.length,
  (val) => {
    if (val === 0) dataMap.isPass = true
  },
  { immediate: true, deep: true }
)

/**
 * @description: 序列号按钮
 * @param key 当前的行prop
 * @param data 当前行数据
 * @param index 当前行下标
 */
function handleClickSerialNumber(key: string, data: any, index: number) {
  dataMap.visible = true
}

// 获取过账（入库）的参数
const handleSubmit = (data: any) => {
  data.wmsOutStockList.forEach((item: any, index: number) => {
    item.barcode = ''
  })

  return false
}
</script>
