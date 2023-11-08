<template>
  <div>
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
        <van-grid-item>已确认：{{ selectedList.length }}</van-grid-item>
        <van-grid-item>剩余数：{{ list.length - selectedList.length }}</van-grid-item>
        <van-grid-item>
          <van-checkbox v-model="selectAll" :disabled="props.chkDisabled" shape="square" @click="handleSelectAll">
            全选
          </van-checkbox>
        </van-grid-item>
      </van-grid>
    </van-sticky>

    <!-- 列表 -->
    <TableVue ref="table" v-model:table-data="list" :tableColumn="tableColumn" v-model:selection="selectedList" />
    <!-- 底部按钮 -->
    <ActionBarVue
      ref="actionBarVue"
      :loading="loading"
      :confirmText="confirmText"
      @clear="handleClear"
      @confirm="handleConfirm"
    />
    <!-- 调用扫条码时的loading效果，同时阻止用户继续操作 -->
    <van-overlay :show="scanLoading">
      <div class="loading_wrapper" @click.stop>
        <van-loading color="#ffffff" type="spinner">数据加载中</van-loading>
      </div>
    </van-overlay>
  </div>
</template>

<script lang="ts" setup name="ToggleFormMachinedWarehousingWMSVue">
import { PropType, ref, watch, onMounted } from 'vue'
import FormVue from '@/components/Form/index.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { FormConfig, TableColumn } from '@/typing'
import { WMSAPI } from '@/api/generalAPI'
import { showSuccessToast, showConfirmDialog, FieldInstance } from 'vant'
import Dates from '@/utils/datetime'
import { v4 as uuidv4 } from 'uuid'
import useStore from '@/store'
import { GetBoxDetail } from '@/api/system/common'
import { _showFailToast } from '@/utils/message'

let props = defineProps({
  formList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 表单项数组
  showFormList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 需要展开显示的数据字段参数
  viewData: { type: Object as PropType<any>, default: () => ({}) }, // 列表信息总览数据
  tableColumn: { type: Array as PropType<TableColumn[]>, default: () => [] }, // 列表字段参数
  chkDisabled: { type: Boolean, default: () => false },
  submit: {
    type: Function,
    default: undefined
  }, // 过账按钮前执行事件
  passAPIName: { type: String, default: () => '' }, // 过账接口地址
  listAPIName: { type: String, default: () => '' }, // 扫码查询接口地址
  type: { type: String, default: () => '' }, // 页面业务类型
  confirmText: { type: String, default: () => '过账' }, // 底部按钮显示文本
  isPass: { type: Boolean, default: () => true },
  // 1.扫码匹配字段一标识key，此key是用来实现业务的，必须传入；2.追加数据判断是否重复扫码的唯一识别符
  scanlKey: { type: String, default: 'barcode' }
})

let table = ref<InstanceType<typeof TableVue> | null>(null)
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
let { user } = useStore()
let { account, name } = user.user

const today = new Dates(new Date()).strftime('YYYY-MM-DD')
// 表单对象，初始化过账日期
let form = ref<any>({
  postDate: today
})
// 点击左侧箭头是否展开
let show = ref(false)
// 是否全选
let selectAll = ref(false)
// 选中项集合
let selectedList = ref<any[]>([])
// 表单项数组，因需要二次赋值，但是子组件深度监听都监听不到props.formList的改变，computed是异步会有数据延迟，只好是用ref
let _formList = ref<FormConfig[]>(JSON.parse(JSON.stringify(props.formList)))

// 列表数据
let list = ref<any[]>([])
// 过账按钮loading
let loading = ref(false)
// 扫条码时进行loading
const scanLoading = ref(false)

let boxInputRef: FieldInstance | null = null
let barcodeInputRef: FieldInstance | null = null

// 对比选中项长度与数据数组总长度，是否可以勾选全选复选框
watch(
  () => [selectedList.value.length, list.value.length],
  ([val1, val2]) => {
    selectAll.value = val1 === val2 && val1 !== 0
  }
)
/** 全选和反选 */
const handleSelectAll = () => {
  table.value?.checkboxGroup.toggleAll(selectAll.value)
}
/** 箱子号回车带出明细 */
function boxIDEnter(val: string | null) {
  if (!val) return
  scanLoading.value = true
  GetBoxDetail(val)
    .then((res: any) => {
      // console.log(res)
      if (res.success) {
        let _data = res.materialBarcodeList as any[]
        if (_data.length === 0) {
          _showFailToast(`箱子号[${val}]下没有明细物料，请重新扫码`)
          form.value.boxID = ''
          boxInputRef?.focus()
          return
        }
        // 增加uuid为唯一识别符
        _data.forEach((item) => {
          item.uuid = uuidv4()
        })
        list.value = _data
        // 光标跳转
        barcodeInputRef?.focus()
      } else {
        _showFailToast(res.message)
      }
    })
    .finally(() => {
      scanLoading.value = false
    })
}
/** 条码回车勾选明细 */
async function barcodeEnter(val: string | null) {
  if (!val) return
  if (list.value.length === 0) {
    _showFailToast('请先输入/扫码箱子号')
    return
  }

  try {
    let res = await WMSAPI.post(props.listAPIName, { imBarcode: val, imOclas: props.type })
    // 业务报错
    if (!res.success) {
      _showFailToast(res.message as string)
      return
    }
    // 无数据
    let _data = res.data as any[]
    if (_data.length === 0) {
      _showFailToast(`查无此[${val}]条码`)
      return
    }
    // 匹配勾选
    let target = list.value.find((item) => item[props.scanlKey] === val)
    if (target) {
      table.value?.handleSelect([target.uuid])
    } else {
      _showFailToast(`箱子[${form.value.boxID}]中无此[${val}]条码`)
    }
  } catch (e) {
    // console.log(e)
  } finally {
    barcodeInputRef?.focus()
    form.value.imBarcode = ''
  }
}
// 过账
async function handleConfirm() {
  try {
    // 表单验证
    await formComponent.value?.refForm.validate()
    // 确认是否可以过账
    if (selectedList.value.length === 0) {
      _showFailToast('请勾选数据')
      return
    }
    // 过账前确认
    await showConfirmDialog({
      title: '提示',
      message: `确认过账吗？`
    })
    // 开始过账
    loading.value = true
    // 删除uuid,遍历实现
    let _list: any[] = JSON.parse(JSON.stringify(selectedList.value))
    _list.forEach((item) => delete item.uuid)
    // 组合数据
    let _data = getOutStockParams(_list)
    // 过账
    let res = await WMSAPI.post(props.passAPIName, _data)
    if (res && res.success) {
      showSuccessToast(res.message || '过账成功')
      // 清空表单和列表
      handleClear()
    } else {
      _showFailToast(res.message as string)
    }
    loading.value = false
  } catch (e) {
    // console.log(e)
    loading.value = false
  }
}

// 获取过账（退货、出货）的参数
function getOutStockParams(_list: any[]) {
  let { boxID } = form.value

  let wmsOutStockList: any[] = []
  _list.forEach((item) => {
    let obj = {
      boxID,
      receiveBoxID: '',
      materialID: item.materialNo,
      materialDesc: item.materialDesc,
      quantity: item.quantity, // 数字类型
      projectID: item.projectNo,
      barcode: item.barcode,
      batchID: item.batch,
      oclas: props.type,
      locationID: item.locationNo,
      areaId: item.areaNo,
      whId: item.warehouseNo,
      cardNo: account,
      cardName: name,
      poid: '',
      poItemNo: '',
      proofNumber: '',
      werks: '',
      ngeln: '',
      targetBoxID: '',
      targetLocationID: ''
    }
    wmsOutStockList.push(obj)
  })

  let _data: any = {
    iM_OCLAS: props.type,
    IM_CARDNO: account,
    IM_CARDNAME: name,
    WarehouseNo: '',
    wmsOutStockList,
    TargetWarehouseNo: '',
    zxstXmbeStruList: _list
  }

  return _data
}
// 清空
const handleClear = () => {
  // table数据
  list.value = []
  // 选中项集合
  selectedList.value = []
  // 表单
  form.value = {
    postDate: today
  }
  boxInputRef?.focus()
}
// 初始化配置项
function initConfig() {
  _formList.value.forEach((item) => {
    if (item.prop === 'boxID') {
      item.enter = boxIDEnter
      boxInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
    if (item.prop === 'imBarcode') {
      item.enter = barcodeEnter
      barcodeInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
  })
  boxInputRef?.focus()
}

onMounted(() => {
  initConfig()
})
</script>

<style lang="scss" scoped>
.loading_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
