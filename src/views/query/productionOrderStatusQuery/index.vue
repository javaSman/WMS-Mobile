<template>
  <QueryToggleFormVue
    :formList="dataMap.formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    v-model:formData="dataMap.form"
    v-model:tableData="dataMap.list"
    @confirm="handleConfirm"
  />
</template>

<script lang="ts">
// 生产订单状态查询
const cachedName = 'query.productionOrderStatusQuery'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import QueryToggleFormVue from '@/views/businessComponents/QueryToggleForm.vue'
import { formList, showFormList, tableColumn } from './config'
import { MISWMSAPI } from '@/api/generalAPI'
import { reactive } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { _showFailToast } from '@/utils/message'

const listAPIName = 'getData/getProdocInfo'

let dataMap = reactive({
  formList,
  loading: false,
  form: {} as any,
  list: [] as any[]
})

// 条码绑定回车
dataMap.formList[0].enter = barcodeEnter
// 条码回车
function barcodeEnter(val: string | number | null) {
  if (!val) {
    _showFailToast('请输入条码')
    return
  }
  dataMap.loading = true
  MISWMSAPI.post(listAPIName, { orderNumber: val })
    .then((res) => {
      // console.log(res)
      if (res && res.success) {
        let _data: any = res.data
        dataMap.form = Object.assign({}, dataMap.form, _data.title)
        let arr: any[] = []
        // 增加uuid为唯一识别符
        ;(_data.data as any[]).forEach((item, index) => {
          item.uuid = uuidv4()
          item.index = index + 1
          arr.push(item)
        })
        dataMap.list = arr
      } else {
        _showFailToast(res.data as string)
      }
    })
    .finally(() => {
      dataMap.loading = false
      dataMap.form[dataMap.formList[0].prop] = ''
    })
}

// 查询
function handleConfirm() {
  if (!dataMap.form.imBarcode) {
    _showFailToast('请输入条码或扫码查询！')
    return
  }
  barcodeEnter(dataMap.form.imBarcode)
}
</script>
