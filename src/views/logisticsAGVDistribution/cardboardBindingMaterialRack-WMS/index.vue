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
  <!-- 底部按钮 -->
  <div style="height: 50px" />
  <ActionBarVue
    ref="actionBarVue"
    :loading="dataMap.loading"
    :confirmText="dataMap.confirmText"
    @clear="handleClear"
    @confirm="handelConfirm"
  />
</template>

<script lang="ts">
// 卡板绑定料架-WMS
const cachedName = 'logisticsAGVDistribution.cardboardBindingMaterialRack-WMS'
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
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
onMounted(() => {
  let inputRef = formComponent.value?.formInputRef.boxNo.inputRef
  // console.log(inputRef)
  inputRef.focus()
  // dataMap.formList[0].value?.focus()
  // let inputRef = formComponent.value?.formInputRef.imBarcode.inputRef
  // inputRef.focus()
})
let dataMap = reactive({
  list: [] as any[],
  formList,
  form: {} as any,
  show: false,
  loading: false,
  confirmText: '绑定/解绑'
})
let user = localStorage.getItem('userInfo')
let userName = eval('(' + user + ')')
dataMap.formList[0].enter = handleEnter
function handleEnter() {
  WMSAPI.get('business/webapi', { boxNo: dataMap.form.boxNo }, 'GetBox').then((res) => {
    if (res && res.success) {
      if (res.result.materialShelfNo === null || dataMap.form.materialShelfNo === '' || res.result === null) {
        dataMap.confirmText = '绑定'
        _showFailToast('请输入料架')
        let inputRef = formComponent.value?.formInputRef.materialShelfNo.inputRef
        inputRef.focus()
      } else {
        dataMap.form.materialShelfNo = res.result.materialShelfNo
        dataMap.confirmText = '解绑'
      }
    }
  })
}
function handelConfirm() {
  if (dataMap.confirmText === '绑定') {
    WMSAPI.post(
      'business/webapi',
      {
        boxNo: dataMap.form.boxNo,
        materialShelfNo: dataMap.form.materialShelfNo,
        operatorNo: userName.account,
        operatorName: userName.name
      },
      'UpdateBoxMaterialShelfNo'
    ).then((res) => {
      if (res && res.success) {
        showSuccessToast(res.message as string)
        handleClear()
      } else {
        _showFailToast(res.message as string)
      }
    })
  } else {
    WMSAPI.post(
      'business/webapi',
      { boxNo: dataMap.form.boxNo, operatorNo: userName.account, operatorName: userName.name },
      'UpdateBoxMaterialShelfNo'
    ).then((res) => {
      if (res && res.success) {
        showSuccessToast(res.message as string)
        handleClear()
      } else {
        _showFailToast(res.message as string)
      }
    })
  }
}
// 清除
function handleClear() {
  dataMap.form = {}
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
