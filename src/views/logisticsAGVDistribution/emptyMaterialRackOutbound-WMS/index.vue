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
  <ActionBarVue ref="actionBarVue" :loading="dataMap.loading" :confirmText="confirmText" @clear="handleClear"
    @confirm="confirm" />
</template>
    
<script lang="ts">
// 空料架出库-WMS
const cachedName = 'logisticsAGVDistribution.emptyMaterialRackOutbound-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import FormVue from '@/components/Form/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
// import { matchesPattern } from '@babel/types'
import { ref, reactive, onMounted } from 'vue'
import { WMSAPI } from '@/api/generalAPI'
import { formList } from './config'
import { showSuccessToast, showToast } from 'vant'
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
const confirmText = ref('确定')
let dataMap = reactive({
  list: [] as any[],
  formList,
  form: {} as any,
  show: false,
  loading: false
})
onMounted(() => {
  WMSAPI.get('business/webapi', {}, 'GetWarehouseNos').then(res => {
    dataMap.formList[0].options = res.result
  })
})
let user = localStorage.getItem('userInfo')
let userName = eval('(' + user + ')')
dataMap.formList[0].change = handelChange
function handelChange() {
  WMSAPI.get('business/webapi', { warehouseNo: dataMap.form.warehouseNo }, 'GetEmptyMaterialShelfs').then(res => {
    dataMap.formList[1].options = res.result
  })
  WMSAPI.get('business/webapi', { warehouseNo: dataMap.form.warehouseNo }, 'GetSiteNos').then(res => {
    dataMap.formList[2].options = res.result
  })
}
function confirm() {
  WMSAPI.post('business/webapi', { materialShelfNo: dataMap.form.materialShelfNo, agvSite: dataMap.form.agvSite, operatorNo: userName.account, operatorName:userName.name }, 'EmptyShelfOutStorage').then(res => {
    if (res && res.success) {
      showSuccessToast(res.message as string)
    } else {
      showToast(res.message as string)
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
    