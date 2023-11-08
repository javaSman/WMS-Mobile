<template>
  <QueryToggleFormVue
    :formList="dataMap.formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    v-model:formData="dataMap.form"
    v-model:tableData="dataMap.list"
    :showArrow="false"
    @confirm="comfirSearch"
  />
</template>

<script lang="ts">
// 生产订单状态查询
const cachedName = 'query.componentQuery'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import QueryToggleFormVue from '@/views/businessComponents/QueryToggleForm.vue'
import { formList, showFormList, tableColumn } from './config'
import { MISWMSAPI } from '@/api/generalAPI'
import { reactive } from 'vue'
import Loading from '@/components/Loading'
import { _showFailToast } from '@/utils/message'

const listAPIName = '/getData/getStateMateStock'

let dataMap = reactive({
  formList,
  form: {} as any,
  list: [] as any[]
})

//  这里项目号和条码都绑定enter事件
dataMap.formList[0].enter = enterHandler
// 条码或者项目号回车
function enterHandler() {
  Loading.show()
  MISWMSAPI.post(listAPIName, { objnr: dataMap.form.barcode })
    .then((res) => {
      console.log(res)
      if (res && res.success) {
        dataMap.list = res.data as any[]
        // 取出第一项赋值项目工位
        if (dataMap.list.length > 0) {
          dataMap.form.projectNum = `${dataMap.list[0].charg}-${dataMap.list[0].workp}`
        }
      } else {
        _showFailToast(res.data as string)
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
