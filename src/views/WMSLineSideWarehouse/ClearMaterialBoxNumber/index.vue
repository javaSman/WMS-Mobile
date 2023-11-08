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
      <van-grid-item>总数：{{ list.length }}</van-grid-item>
      <van-grid-item>已确认：{{ selection.length }}</van-grid-item>
      <van-grid-item>剩余数：{{ list.length - selection.length }}</van-grid-item>
      <van-grid-item>
        <van-checkbox v-model="selectAll" shape="square" @click="handleSelectAll">全选</van-checkbox>
      </van-grid-item>
    </van-grid>
  </van-sticky>
  <!-- 列表 -->
  <TableVue
    ref="table"
    v-model:table-data="list"
    :tableColumn="tableColumn"
    v-model:selection="selection"
    @input-num-handler="inputNumHandler"
  />

  <!-- 底部按钮 -->
  <ActionBarVue
    ref="actionBarVue"
    :loading="loading"
    confirmText="过账"
    @clear="handleClear"
    @confirm="handleConfirm"
  />
</template>

<script lang="ts" setup name="WMSLineSideWarehouse.clearMaterialBoxNumber">
// 物料箱号清除
import FormVue from '@/components/Form/index.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { formList, showFormList, tableColumn } from './config'
import { ref, watch, onMounted, nextTick } from 'vue'
import { WMSAPI } from '@/api/generalAPI'
import { showConfirmDialog, showSuccessToast, FieldInstance } from 'vant'
import Dates from '@/utils/datetime'
import { v4 as uuidv4 } from 'uuid'
import { FormConfig } from '@/typing'
import Loading from '@/components/Loading'
import { GetUserWarehouse, GetBoxDetail } from '@/api/system/common'
import { _showFailToast } from '@/utils/message'
// import testData2 from '@/views/testData2'

const passAPIName = 'business/webapi/MaterialUnBindBox'

const today = new Dates(new Date()).strftime('YYYY-MM-DD')
const list = ref<any[]>([])
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
// 选中的数据
const selection = ref<any[]>([])
// 是否全选
const selectAll = ref(false)
// 仓库列表
const wareHouseList = ref<any[]>([])

let boxInputRef: FieldInstance | null = null
let barcodeInputRef: FieldInstance | null = null

// 监听选择长度和表长度判断勾选情况
watch(
  () => [selection.value.length, list.value.length],
  ([val1, val2]) => {
    selectAll.value = val1 === val2 && val1 !== 0
    // 全选时触发过账
    if (selectAll.value) handleConfirm()
  }
)

// 箱子号回车，带出明细
const boxIDEnter = async (val: string | null) => {
  if (!val) return
  Loading.show()
  GetBoxDetail(val)
    .then((res: any) => {
      if (res.success) {
        // 储存目标向子号物料
        let _data = res.materialBarcodeList as any[]
        // let _data = testData2.data as any[]
        if (_data.length === 0) {
          _showFailToast(`箱子${val}暂无明细`)
          boxInputRef?.focus()
          return
        }
        _data.forEach((item) => {
          item.uuid = uuidv4()
        })
        list.value = _data
        // 跳转到接收区域
        barcodeInputRef?.focus()
      } else {
        _showFailToast(res.message)
        boxInputRef?.focus()
      }
    })
    .finally(() => {
      Loading.hide()
    })
}
/**
 * @description: 条码扫码勾选
 * @param {*} val
 */
const barcodeEnter = (val: string | null) => {
  if (!val) return
  let target = list.value.find((item) => item.barcode === val)
  // 如果值不存在
  if (!target) {
    _showFailToast(`箱子${form.value.wmsTools}中不存在条码${val}`)
    nextTick(() => {
      form.value.imBarcode = ''
    })
    return
  }
  // 如果值已勾选
  let arrs = selection.value.map((item) => item.uuid)
  if (arrs.includes(target.uuid)) {
    _showFailToast(`条码${val}已勾选，请勿重复扫码`)
    nextTick(() => {
      form.value.imBarcode = ''
    })
    return
  }
  // 新码，勾选
  let selected = [...selection.value.map((item: any) => item.uuid), target.uuid]
  table.value?.handleSelect(selected)
  nextTick(() => {
    form.value.imBarcode = ''
  })
}

// 确定过账
const handleConfirm = async () => {
  try {
    // 表单验证
    await formComponent.value?.refForm.validate()
    // 是否有勾选数据
    if (selection.value.length === 0) {
      _showFailToast('请勾选数据')
      return
    }
    // 过账前确认
    await showConfirmDialog({
      title: '提示',
      message: `本次过账共 ${selection.value.length} 条数据,累计数量是: ${computedTotal(
        selection.value
      )},是否确认过账？`
    })
    // 开始过账
    Loading.show()
    // 删除uuid,遍历实现
    let _list: any[] = JSON.parse(JSON.stringify(selection.value))
    _list.forEach((item) => delete item.uuid)
    // // tips:混入箱子信息
    // _list = _list.map((item) => ({ ...item, wmsTools: form.value.wmsTools }))
    // 组合参数
    let _data = {
      barcodes: _list.map((item) => item.barcode),
      boxNo: form.value.wmsTools,
      oclas: '',
      remark: '',
      addResume: true
    }
    // 调用接口
    let res = await WMSAPI.post(passAPIName, _data)

    if (res && res.success) {
      showSuccessToast(res.message || '过账成功')
      // 清空表单和列表
      handleClear()
    } else {
      _showFailToast(res.message as string)
    }
  } catch (e) {
    //
  } finally {
    Loading.hide()
  }
}
// 清除按钮
const handleClear = () => {
  list.value = []
  selectAll.value = false
  selection.value = []
  form.value = {
    postDate: today
  }
  show.value = false
}
// 全选
const handleSelectAll = () => {
  table.value?.checkboxGroup.toggleAll(selectAll.value)
}
// 计算勾选的累计数量
const computedTotal = (arr: any[]) => {
  let key = 'quantity'
  return arr.reduce((pre, next) => {
    // eslint-disable-next-line no-prototype-builtins
    if (pre.hasOwnProperty(key)) {
      return Number(pre[key]) + Number(next[key])
    } else {
      return Number(next[key])
    }
  }, 0)
}

// 数量输入框的回调事件
const inputNumHandler = (key: string, index: number) => {
  console.log(key, index)
}
// 得到仓库数据，更新仓库列表
const getWareHouseListAndUpdate = async () => {
  let res = await GetUserWarehouse()
  if (res.success) {
    wareHouseList.value = res.datas
  }
}
/** 仓库change */
function wareHouseChange(val: string | null) {
  if (!val) return
  boxInputRef?.focus()
}

// 初始化配置项
async function initConfig() {
  try {
    await getWareHouseListAndUpdate()
    _formList.value.forEach((item) => {
      if (item.prop === 'warehouseNo') {
        item.change = wareHouseChange
        item.options = wareHouseList.value
      }
      if (item.prop === 'wmsTools') {
        item.enter = (val: string | null) => boxIDEnter(val)
        boxInputRef = formComponent.value?.formInputRef[item.prop].inputRef
      }
      if (item.prop === 'imBarcode') {
        item.enter = (val: string | null) => barcodeEnter(val)
        barcodeInputRef = formComponent.value?.formInputRef[item.prop].inputRef
      }
    })
  } catch (e) {
    console.log(e)
  }
}

onMounted(() => {
  initConfig()
})
</script>
<style scoped lang="scss">
.loading_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
