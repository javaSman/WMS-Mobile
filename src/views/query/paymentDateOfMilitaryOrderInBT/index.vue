<template>
  <div>
    <van-field
      ref="inputRef"
      clearable
      v-model="barcode"
      label="图纸条码"
      placeholder="请输入图纸条码"
      @keyup.enter="enterBarcode"
    />
    <SimpleTable v-if="isShow" :background="curBackground" :columns="tableColumn" :show-msg="showTextValue" />
    <van-action-bar>
      <van-action-bar-button type="default" text="清除" @click="handleClear" />
    </van-action-bar>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SimpleTable from '@/views/businessComponents/SimpleTable.vue'
import { TableColumn } from '@/typing'
import { MISWMSAPI } from '@/api/generalAPI'
import { FieldInstance } from 'vant'
import dayjs from 'dayjs'
import { _showFailToast } from '@/utils/message'
const barcode = ref('')
const curBackground = ref('') // 当前的背景色
const inputRef = ref<FieldInstance>()
const tableColumn: TableColumn[] = [
  { label: '图纸条码', prop: 'barcode' },
  { label: '物料编码', prop: 'materialNo' },
  { label: '军令状纳期', prop: 'deliveryDate' },
  { label: '项目工位', prop: 'projectStation' },
  { label: '生产批', prop: 'batchNo' },
  { label: '周别', prop: 'maktx' }
]
const showTextValue = ref<any>({})
const isShow = ref(false)
const queryAPIName = '/mes/getDeliveryDate'
const enterBarcode = () => {
  MISWMSAPI.post(queryAPIName, { imBarcode: barcode.value })
    .then((res) => {
      if (res && res.success) {
        isShow.value = true
        Object.assign(showTextValue.value, res.data)
        // 根据查询的军令状纳期动态修改背景颜色
        // 军令状纳期≤当天日期，明细渲染成红色
        // 军令状纳期-当天≤7天，明细渲染成黄色
        // 军令状纳期-当天日期＞7天，明细渲染成绿色
        const num = dayjs(new Date()).diff(showTextValue.value.deliveryDate as string, 'day')
        if (Math.abs(num) > 7) {
          curBackground.value = 'rgb(149, 242, 4)'
        } else if (Math.abs(num) >= 1 && Math.abs(num) <= 7) {
          curBackground.value = 'yellow'
        } else {
          curBackground.value = 'red'
        }
      } else {
        _showFailToast(res.data as string)
      }
    })
    .finally(() => {
      barcode.value = ''
    })
}
const handleClear = () => {
  barcode.value = ''
  showTextValue.value = {}
  isShow.value = false
  inputRef.value?.focus()
}
</script>

<style scoped></style>
