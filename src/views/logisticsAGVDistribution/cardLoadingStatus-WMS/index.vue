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
      <van-cell v-for="item in showInfo" :key="item.prop" :title="item.label">{{ (dataMap.form as any)[item.prop]
      }}</van-cell>
    </van-list>
  </van-cell-group> -->
  <!-- 底部按钮 -->
  <div style="height: 50px" />
  <!-- <ActionBarVue ref="actionBarVue" :loading="dataMap.loading" :confirmText="'解绑/绑定'" @clear="handleClear"
    @confirm="handleQueryInventory" /> -->
  <ActionBarVue
    ref="actionBarVue"
    :loading="dataMap.loading"
    :confirmText="confirmText"
    @clear="handleClear"
    @confirm="handelConfirm"
  />
</template>

<script lang="ts">
// 卡板装载状态-WMS
const cachedName = 'logisticsAGVDistribution.cardLoadingStatus-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import FormVue from '@/components/Form/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { ref, reactive } from 'vue'
import { WMSAPI } from '@/api/generalAPI'
import { formList } from './config'
import { onMounted } from 'vue'
import { showSuccessToast } from 'vant'
import { _showFailToast } from '@/utils/message'

let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
let confirmText = ref('确定')
onMounted(() => {
  let inputRef = formComponent.value?.formInputRef.boxNo.inputRef
  inputRef.focus()
})
let dataMap = reactive({
  list: [] as any[],
  formList,
  form: {} as any,
  show: false,
  loading: false
})
let user = localStorage.getItem('userInfo')
let userName = eval('(' + user + ')')
dataMap.formList[0].enter = handleBlur
function handleBlur() {
  WMSAPI.get('business/webapi', { boxNo: dataMap.form.boxNo }, 'GetBox').then((res) => {
    if (res && res.success) {
      // const text = res.result.status
      // dataMap.formList[1].options = [{text:text,value:text}]
      dataMap.form.dqstatus = res.result.status
    }
    // console.log(res)
  })
}
// 绑定接口
const handelConfirm = () => {
  let NowStatus = dataMap.form.status
  let Dqstatus = dataMap.form.dqstatus
  // console.log(Dqstatus)
  // console.log(NowStatus)
  if (NowStatus === Dqstatus) {
    _showFailToast('载具装载状态不能等于当前卡板状态')
  } else {
    WMSAPI.post(
      'business/webapi',
      {
        boxNo: dataMap.form.boxNo,
        status: dataMap.form.status,
        operatorNo: userName.account,
        operatorName: userName.name
      },
      'UpdateBoxStatus'
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
