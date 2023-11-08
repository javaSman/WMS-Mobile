<template>
  <ToggleFormVue
    ref="ToggleFormVueRef"
    :submit="customSubmit"
    :formList="formList"
    :showFormList="showFormList"
    :tableColumn="tableColumn"
    :passAPIName="passAPIName"
    :listAPIName="listAPIName"
  />
  <UserAuth v-model:visible="userAuthVisible" v-model:extra="extraParams" />
</template>

<script lang="ts">
// 541委外发料
const cachedName = 'shipment.541SubcontractingIssuance'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import ToggleFormVue from '@/views/businessComponents/ToggleForm.vue'
import UserAuth from '@/views/businessComponents/UserAuth.vue'
import { formList, showFormList, tableColumn } from './config'
import { Ref, ref } from 'vue'
import { MISWMSAPI } from '@/api/generalAPI'
import { showSuccessToast } from 'vant'
import { _showFailToast } from '@/utils/message'

const passAPIName = '/exportGoodsBusiness/doPost541'
const listAPIName = '/exportGoodsBusiness/findList541'

// 控制是否鉴权
const userAuthVisible = ref(true)
// 控制是否鉴权
const extraParams = ref(null)
const ToggleFormVueRef = ref<InstanceType<typeof ToggleFormVue>>()
/**
 * @description:自定义过账方法
 * @param {*} val 勾选的数据
 * @param {*} loading 过账按钮的loading效果控制
 */
const customSubmit = async (val: any, loading: Ref<boolean>) => {
  // 构造参数,循环混入额外参数
  if (extraParams.value) {
    let key = getEditableKey()
    if (val.data.every((item: any) => Number(item[key]) > 0)) {
      let temp = Object.assign({}, extraParams.value)
      let result = { ...val, data: val.data.map((item: any) => ({ ...item, ...(temp as Object) })) }
      MISWMSAPI.post(passAPIName, result)
        .then((res) => {
          if (res && res.success) {
            showSuccessToast(res.msg)
            // 清空表单和列表
            ToggleFormVueRef.value?.clearHandler()
          } else {
            _showFailToast(res.data as string)
          }
        })
        .finally(() => {
          loading.value = false
        })
    } else {
      _showFailToast({
        message: '所提交项中存在数量小于或等于0的项目，请检查'
      })
    }
  }
}
// 获取可编辑项的prop
// 取出tableColumn中类型是Table/Number的项目的prop，因为这个才是可以编辑的项
const getEditableKey = () => {
  let tarItem = tableColumn.find((item) => item.type === 'Table/Number')
  let key = tarItem ? tarItem.prop : 'erfmg'
  return key
}
</script>
