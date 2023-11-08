<template>
  <!-- 表单布局 -->
  <van-cell-group>
    <van-cell title-class="toggleFormCellTitle" style="padding-left: 0; padding-right: 0; border-radius: 0">
      <template #title>
        <van-icon :name="dataMap.show ? 'arrow-down' : 'arrow'" @click="dataMap.show = !dataMap.show" />
      </template>
      <template #value>
        <FormVue ref="formComponent" v-model:formData="dataMap.form" :formList="dataMap.formList" />
      </template>
    </van-cell>
  </van-cell-group>
  <!-- 隐藏字段布局 -->
  <van-cell-group v-show="dataMap.show" style="padding-left: 20px" class="showInfo">
    <van-list>
      <van-cell v-for="item in showInfo" :key="item.prop" :title="item.label">
        {{ (dataMap.form as any)[item.prop] }}
      </van-cell>
    </van-list>
  </van-cell-group>
  <!-- 底部按钮 -->
  <div style="height: 50px" />
  <ActionBarVue
    ref="actionBarVue"
    :loading="dataMap.loading"
    :confirmText="'查询'"
    @clear="handleClear"
    @confirm="handleQueryInventory"
  />
</template>

<script lang="ts">
// 库存查询
const cachedName = 'query.inventoryQuery'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import FormVue from '@/components/Form/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { ref, reactive } from 'vue'
import { MISWMSAPI } from '@/api/generalAPI'
import { formList, showInfo } from './config'
import { _showFailToast } from '@/utils/message'

const queryAPIName = 'getData/getValidBarcode'

let formComponent = ref<InstanceType<typeof FormVue> | null>(null)

let dataMap = reactive({
  list: [] as any[],
  formList,
  form: {} as any,
  show: false,
  loading: false
})

dataMap.formList[0].enter = handleQueryInventory
// 查询
function handleQueryInventory(val: any) {
  if (!val) return
  MISWMSAPI.post(queryAPIName, { imBarcode: val }).then((res) => {
    console.log(res)
    if (res && res.success) dataMap.form = res.data as any[]
    else _showFailToast(res.data as string)
  })
  // formComponent.value?.refForm.validate().then(() => {
  //   API.post(queryAPIName, dataMap.form).then((res) => {
  //     // console.log(res)
  //     if (res && res.success) dataMap.list = res.data as any[]
  //     else _showFailToast(res.data as string)
  //   })
  // })
}
// 清除
function handleClear() {
  dataMap.form = {}
}
</script>

<style lang="scss" scoped>
.showInfo {
  :deep(.van-cell-group) {
    border-radius: 0;
  }
  :deep(.van-cell__title) {
    width: 80px;
    display: block;
    flex: none;
    text-align: right;
    padding-right: 10px;
  }
}
</style>
