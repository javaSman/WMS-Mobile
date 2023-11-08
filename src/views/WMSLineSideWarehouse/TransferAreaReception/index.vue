<template>
  <!-- 表单布局 -->
  <van-cell-group>
    <van-cell title-class="toggleFormCellTitle" style="padding-left: 0; padding-right: 0; border-radius: 0">
      <template #title v-if="showFormList.length > 0">
        <van-icon :name="show ? 'arrow-down' : 'arrow'" @click="show = !show" />
      </template>
      <template #value>
        <FormVue ref="formComponent" v-model:formData="form" :formList="_formList" />
      </template>
    </van-cell>
  </van-cell-group>
  <!-- 隐藏字段布局 -->
  <van-cell-group v-show="show" :style="showFormList.length > 0 ? 'padding-left: 20px' : ''">
    <FormVue ref="showFormComponent" v-model:formData="form" :formList="showFormList" />
  </van-cell-group>
  <!-- 列表信息总览 -->
  <van-sticky :offset-top="46">
    <van-grid
      direction="horizontal"
      :column-num="4"
      :border="false"
      style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc"
    >
      <van-grid-item>总数：{{ tableData.length }}</van-grid-item>
      <van-grid-item>已确认：{{ selection.length }}</van-grid-item>
      <van-grid-item>剩余数：{{ tableData.length - selection.length }}</van-grid-item>
      <van-grid-item>
        <van-checkbox :disabled="disableCheck" v-model="selectAll" shape="square" @click="handleSelectAll">
          全选
        </van-checkbox>
      </van-grid-item>
    </van-grid>
  </van-sticky>
  <!-- 列表 -->
  <TableVue
    ref="table"
    v-model:table-data="tableData"
    :tableColumn="formateTableColumn"
    v-model:selection="selection"
    uniqueKey="boxNo"
    @input-num-handler="inputNumHandler"
    :disabledChk="disableCheck"
  />

  <!-- 底部按钮 -->
  <ActionBarVue
    ref="actionBarVue"
    :loading="loading"
    confirmText="过账"
    @clear="handleClear"
    @confirm="handleConfirm"
  />
  <UserAuth v-model:visible="userAuthVisible" v-model:extra="extraParams" />
</template>

<script lang="ts">
// 转运区接收
const cachedName = 'WMSLineSideWarehouse.TransferAreaReception'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import FormVue from '@/components/Form/index.vue'
import UserAuth from '@/views/businessComponents/UserAuth.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { formList, showFormList, tableColumn } from './config'
import { ref, watch } from 'vue'
import { showConfirmDialog, showSuccessToast } from 'vant'
import Dates from '@/utils/datetime'
import { FormConfig } from '@/typing'
import Loading from '@/components/Loading'
import useAuth from './hooks/useAuth'
import { GetBoxDetail, GetUserWarehouse } from '@/api/system/common'
import { nextTick } from 'vue'
import { WMSAPI } from '@/api/generalAPI'
import { _showFailToast } from '@/utils/message'
const today = new Dates(new Date()).strftime('YYYY-MM-DD')
const { userAuthVisible, extraParams } = useAuth()
const tableData = ref<any[]>([])
let numBlurParams = ref<any>({ key: 'erfmg', index: 0 })
// 输入框实例
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
// 列表实例
let table = ref<InstanceType<typeof TableVue> | null>(null)
// 控制隐藏区域
const show = ref(false)
// 表单数据
const form = ref<Record<string, any>>({
  postDate: today
})
let _formList = ref<FormConfig[]>(JSON.parse(JSON.stringify(formList)))
// 底部过账按钮loading
const loading = ref(false)
// 保留一份原始对象,用于校验数量的变更
let originTableData: any[] = []
// 选中的数据
const selection = ref<any[]>([])
// 是否全选
const selectAll = ref(false)
// 是否禁用选择
const disableCheck = ref(false)
// 对比选中项长度与数据数组总长度，是否可以勾选全选复选框
watch(
  () => [selection.value.length, tableData.value.length],
  ([val1, val2]) => {
    selectAll.value = val1 === val2 && val1 !== 0
  }
)

// 具体校验函数
const validateFunc = () => {
  let { key, index } = numBlurParams.value
  // 改变后的值
  let x = Number(tableData.value[index][key])
  // 原始值
  let y = originTableData[index][key]
  if (!x || x < 0) return '数量不能小于等于0'
  if (x > y) return '数量不能大于' + y
  else return true
}
// 特殊处理一下数据适配数量编辑的校验
const formateTableColumn: any[] = tableColumn.map((item) => {
  if (item.prop === 'erfmg' || item.type === 'Table/Number') {
    return {
      ...item,
      rules: [{ required: true, message: '请输入数量', trigger: 'onBlur' }, { validator: validateFunc }]
    }
  } else {
    return item
  }
})
// 箱子输入确认事件,这里根据箱子号加载对应的物料明细
const boxEnter = async (val: string) => {
  Loading.show()
  let res = await GetBoxDetail(val)
  if (res.success) {
    Loading.hide()
    // form.value.locationId = res.box.locationNo
    tableData.value = res.materialBarcodeList
    // 默认全部选中
    nextTick(() => {
      table.value?.handleSelect(tableData.value.map((item) => item.boxNo))
      // tips 选中之后就禁用选择
      disableCheck.value = true
    })
  } else {
    Loading.hide()
    _showFailToast({
      message: res.message as string
    })
  }
}
_formList.value[1].enter = boxEnter

// 确定过账
const handleConfirm = () => {
  formComponent.value?.refForm.validate().then(async () => {
    if (form.value.wmsTools && form.value.locationId) {
      showConfirmDialog({
        title: '提示',
        message: `确定过账吗？`
      })
        .then(async () => {
          loading.value = true
          let res = await WMSAPI.post('business/webapi/BoxBindOrUnbindingArea', {
            cardNo: extraParams.value?.cardno,
            cardName: extraParams.value?.cardname,
            boxNo: form.value.wmsTools,
            locationNo: form.value.locationId,
            type: 1
          })
          if (res.success) {
            showSuccessToast({ message: res.message })
            handleClear()
          } else {
            _showFailToast({ message: res.message as string })
          }
        })
        .catch(() => {
          // on cancel
        })
        .finally(() => {
          loading.value = false
        })
    } else {
      _showFailToast({ message: '卡板/箱子号和区域不能为空' })
    }
  })
}
// 清除按钮
const handleClear = () => {
  tableData.value = []
  selectAll.value = false
  selection.value = []
  form.value = {
    postDate: today
  }
  show.value = false
  let inputRef = formComponent.value?.formInputRef.imBarcode.inputRef
  inputRef.focus()
}
// 全选
const handleSelectAll = () => {
  table.value?.checkboxGroup.toggleAll(selectAll.value)
}

// 数量输入框的回调事件
const inputNumHandler = (key: string, index: number) => {
  console.log(key, index)
}
// 得到仓库数据，更新仓库列表
// TODO 这部分先写死一个工号获取仓库数据
const getWareHouseListAndUpdate = async () => {
  let res = await GetUserWarehouse()
  if (res.success) {
    _formList.value[0].options = res.datas
  }
}

getWareHouseListAndUpdate()
</script>
<style scoped lang="scss">
.loading_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
