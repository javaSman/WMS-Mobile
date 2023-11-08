<template>
  <FormVue ref="formComponent" v-model:formData="dataMap.form" :formList="dataMap.formList" />
  <!-- 列表 -->
  <TableVue ref="table" :tableData="dataMap.list" :tableColumn="dataMap.tableColumn" />
  <div style="height: 50px" />
  <van-action-bar>
    <van-action-bar-button type="default" text="清除" @click="handleClear" />
  </van-action-bar>
</template>

<script lang="ts">
// 物料凭证查询
const cachedName = 'query.materialVoucherQuery'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import FormVue from '@/components/Form/index.vue'
import TableVue from '@/components/Table/index.vue'
import { ref, computed, reactive } from 'vue'
import { MISWMSAPI } from '@/api/generalAPI'
import { formList, tableColumn } from './config'
import Dates from '@/utils/datetime'
import useStore from '@/store'
import { _showFailToast } from '@/utils/message'
let { user } = useStore()

const queryAPIName = 'getData/getDataMateDoc'

let formComponent = ref<InstanceType<typeof FormVue> | null>(null)

let currentUser = computed(() => user.user)
const today = new Dates(new Date()).strftime('YYYY-MM-DD')

let dataMap = reactive({
  list: [] as any[],
  formList,
  tableColumn,
  form: {
    imCardno: currentUser.value.account,
    imPostdate: today,
    imMovetype: ''
  }
})
// 初始化表单，给过账日期和移动类型加上change事件
function initFormList() {
  dataMap.formList.forEach((item) => {
    if (item.prop === 'imPostdate') item.change = handleQueryMaterial
    if (item.prop === 'imMovetype') item.change = handleQueryMaterial
  })
}
// 查询
function handleQueryMaterial() {
  formComponent.value?.refForm.validate().then(() => {
    MISWMSAPI.post(queryAPIName, dataMap.form).then((res) => {
      // console.log(res)
      if (res && res.success) dataMap.list = res.data as any[]
      else _showFailToast(res.data as string)
    })
  })
}
// 清除
function handleClear() {
  dataMap.form = {
    imCardno: currentUser.value.account,
    imPostdate: today,
    imMovetype: ''
  }
  dataMap.list = []
  // 清除验证信息
  formComponent.value?.refForm.resetValidation()
}

initFormList()
</script>
