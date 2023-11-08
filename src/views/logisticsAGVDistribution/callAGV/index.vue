<template>
  <ToggleFormAGV
    :formList="dataMap.formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    v-model:formData="dataMap.form"
    v-model:tableData="dataMap.list"
    :showArrow="false"
    confirmText="确定"
    @confirm="comfirSearch"
  />
</template>

<script lang="ts">
// AGV叫车-WMS
const cachedName = 'logisticsAGVDistribution.callAGV'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormAGV from '../businessComponents/ToggleFormAGV.vue'
import { formList, showFormList, tableColumn } from './config'
import { WMSAPI } from '@/api/generalAPI'
import { reactive } from 'vue'
import Loading from '@/components/Loading'
import { _showFailToast } from '@/utils/message'

const listAPIName = 'business/webapi/AGVCalling'

let dataMap = reactive({
  formList,
  form: {} as any,
  list: [] as any[]
})

function enterHandler() {
  Loading.show()
  WMSAPI.post(listAPIName, { destination: dataMap.form.destination, count: dataMap.form.count })
    .then((res) => {
      console.log(res)
      if (res && res.success) {
        dataMap.list = res.data as any[]
      } else {
        _showFailToast(res.message as string)
      }
    })
    .finally(() => {
      Loading.hide()
    })
}
const comfirSearch = () => {
  enterHandler()
}
</script>
