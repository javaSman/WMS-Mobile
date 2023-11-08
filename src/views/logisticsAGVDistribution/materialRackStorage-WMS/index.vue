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
    :confirmText="confirmText"
    @clear="handleClear"
    @confirm="confirm"
  />
</template>

<script lang="ts">
// 料架入库-WMS
const cachedName = 'logisticsAGVDistribution.materialRackStorage-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import FormVue from '@/components/Form/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { ref, reactive, onMounted } from 'vue'
import { formList } from './config'
import { WMSAPI } from '@/api/generalAPI'
import { showSuccessToast } from 'vant'
import { _showFailToast } from '@/utils/message'
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
onMounted(() => {
  let inputRef = formComponent.value?.formInputRef.materialShelfNo.inputRef
  inputRef.focus()
  WMSAPI.get('business/webapi', {}, 'GetWarehouseNos').then((res) => {
    dataMap.formList[0].options = res.result
  })
})
const confirmText = ref('确认')
let dataMap = reactive({
  list: [] as any[],
  formList,
  form: {} as any,
  show: false,
  loading: false
})
let user = localStorage.getItem('userInfo')
let userName = eval('(' + user + ')')
dataMap.formList[1].enter = handleEnter
function handleEnter() {
  WMSAPI.get('business/webapi', { materialShelfNo: dataMap.form.materialShelfNo }, 'GetLocation').then((res) => {
    if (res && res.success) {
      dataMap.form.locationNo = res.result.locationNo
    } else {
      _showFailToast(res.message as string)
    }
  })
}
function confirm() {
  WMSAPI.post(
    'business/webapi',
    {
      materialShelfNo: dataMap.form.materialShelfNo,
      warehouseNo: dataMap.form.warehouseNo,
      operatorNo: userName.account,
      operatorName: userName.name
    },
    'ShelfInStorage'
  ).then((res) => {
    if (res && res.success) {
      showSuccessToast(res.message as string)
    } else {
      _showFailToast(res.message as string)
    }
  })
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
