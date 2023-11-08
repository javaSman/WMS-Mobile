<template>
  <ToggleFormVue
    ref="toggleFormVue"
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
    :isPass="dataMap.isPass"
    v-model:snrc="dataMap.list"
    v-model:barcode="dataMap.barcode"
    @clickHandler="handleClickSerialNumber"
  />
  <serialNumberVue v-model:visible="dataMap.visible" :list="dataMap.list" v-model:isPass="dataMap.isPass" :barcode="dataMap.barcode" />
</template>

<script lang="ts">
// Z31转移到结算仓/样机仓
const cachedName = 'transfer.Z31TransferToWarehouse'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import serialNumberVue from './serialNumber.vue'
import { reactive, ref, watch } from 'vue'
import { formList, showFormList, tableColumn } from './config'

const passAPIName = 'divertBusiness/doPostZ31'
const listAPIName = 'divertBusiness/findListZ31'

let dataMap = reactive({
  visible: false,
  list: [] as any[],
  isPass: false,
  barcode: '' // 扫码的条码值
})

let toggleFormVue = ref<InstanceType<typeof ToggleFormVue> | null>(null)

// 判断序列号的条件，如果数组不存在，则允许过账
watch(() => dataMap.list.length, (val) => {
  if (val === 0) dataMap.isPass = true
}, { immediate: true, deep: true })

/**
 * @description: 序列号按钮
 * @param key 当前的行prop
 * @param data 当前行数据
 * @param index 当前行下标
 */
function handleClickSerialNumber(data: any, index: number) {
  dataMap.visible = true
}

</script>
