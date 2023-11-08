<template>
  <div>
    <!-- 表单布局-隐藏字段布局 -->
    <FormGroup
      ref="refFormGroup"
      :showFormList="showFormList"
      :formList="_formList"
      v-model:form="form"
      v-model:show="show"
    />
    <!-- 列表信息总览 -->
    <SummaryCheck
      :chkDisabled="chkDisabled"
      v-model:selectAll="selectAll"
      :selectedList="selectedList"
      :list="list"
      @handleSelectAll="handleSelectAll"
    />
    <!-- 列表 -->
    <TableVue
      ref="table"
      v-model:table-data="list"
      :tableColumn="tableColumn"
      v-model:selection="selectedList"
      @click-handler="clickHandler"
    >
      <template #checkbox="{ item, index }">
        <van-switch v-model="list[index][item.prop]" size="18px" />
        是
      </template>
    </TableVue>
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

<script lang="ts" setup name="ToggleFormWMSVue">
import { PropType, ref, reactive } from 'vue'
import FormGroup from '@/views/wmsFunction/components/FormGroup.vue'
import SummaryCheck from '@/views//wmsFunction/components/SummaryCheck.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { FormConfig, TableColumn } from '@/typing'
import { WMSAPI } from '@/api/generalAPI'
import { showSuccessToast, showConfirmDialog, FieldInstance } from 'vant'
import Dates from '@/utils/datetime'
import { v4 as uuidv4 } from 'uuid'
import useStore from '@/store'
import { GetUserWarehouse } from '@/api/system/common'
import { _showFailToast } from '@/utils/message'

let emits = defineEmits(['clickHandler'])
let props = defineProps({
  formList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 表单项数组
  showFormList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 需要展开显示的数据字段参数
  tableColumn: { type: Array as PropType<TableColumn[]>, default: () => [] }, // 列表字段参数
  chkDisabled: { type: Boolean, default: () => false },
  submit: { type: Function, default: undefined }, // 过账按钮前执行事件
  passAPIName: { type: String, default: () => '' }, // 过账接口地址
  getDetailAPIName: { type: String, default: () => '' }, // 扫码查询接口地址
  type: { type: String, default: () => '' }, // 页面业务类型
  confirmText: { type: String, default: () => '过账' }, // 底部按钮显示文本
  enterAfterEvent: { type: Function, default: undefined }, // 条码回车事件后执行事件，用于重新组合数据
  isPass: { type: Boolean, default: () => true }
})

let table = ref<InstanceType<typeof TableVue> | null>(null)
let refFormGroup = ref<any>({}) // 表单组合ref

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
// 存储额外的参数对象
let exParams = reactive<any>({})
// 扫条码时进行loading
const scanLoading = ref(false)
// 用于存储列表原始数据
let staticData: any[] = []
// 用于存储仓库列表
let wareHouseList = ref<any[]>([])

// 第一个输入框-仓库选择后聚焦
let nextInputRef: FieldInstance | null = null

/** 全选和反选 */
const handleSelectAll = () => {
  table.value?.checkboxGroup.toggleAll(selectAll.value)
}

// TODO: 目前没有权限，先写死用户工号
/** 根据用户工号获取仓库列表 */
async function getUserWarehouse() {
  try {
    let res = await GetUserWarehouse()

    if (res.success) {
      wareHouseList.value = res.datas as any[]
    } else {
      _showFailToast(res.message as string)
    }
  } catch (e) {
    console.log(e)
  }
}

/** 仓库change */
function wareHouseChange(val: string | null) {
  if (!val) return
  nextInputRef?.focus()
}

/** 回车带出明细 */
function getDetailEnter(val: string | null) {
  if (!val) return
  scanLoading.value = true
  WMSAPI.get(props.getDetailAPIName, { locationNo: val })
    .then((res: any) => {
      if (res && res.success) {
        let _data = res.boxList as any[]
        selectedList.value = []
        if (_data.length === 0) {
          _showFailToast(`区域[${val}]下没有明细箱子，请重新扫码`)
          form.value.locationNo = ''
          nextInputRef?.focus()
          list.value = _data
          return
        }
        // 增加uuid为唯一识别符
        _data.forEach((item) => {
          item.uuid = uuidv4()
        })
        // 赋值表格数据
        list.value = _data
        // 存储原始数据
        staticData = JSON.parse(JSON.stringify(_data))
        staticData.forEach((item: any) => {
          item.newQuantity = item.quantity
        })
        // 光标跳转
        nextInputRef?.focus()
      } else {
        _showFailToast(res.message)
      }
    })
    .finally(() => {
      scanLoading.value = false
    })
}

/** 表格选中项-必填项验证 */
let validateTable = () => {
  let flag: boolean = false
  let tableRequired: string[] = props.tableColumn
    .map((item: any) => {
      if (item?.rules?.length > 0) return item.prop
    })
    .filter((item: any) => item !== undefined)
  for (let prop of tableRequired) {
    for (let item of selectedList.value) {
      if ((item[prop] ?? '') === '') {
        flag = true
        break
      }
    }
  }
  return flag
}

// 过账
const handleConfirm = async () => {
  try {
    // 表单验证
    await refFormGroup.value?.formComponent?.refForm.validate()
    // 确认是否可以过账
    if (!props.isPass) {
      _showFailToast('序列号未扫描完。')
      return
    }
    if (selectedList.value.length === 0) {
      _showFailToast('请勾选数据')
      return
    }
    // 表格必填项验证
    // await table.value?.refForm.validate()
    // 表格已选项数据必填项验证
    if (validateTable()) {
      _showFailToast('请将已勾选数据明细填写完整！')
      return
    }

    // 过账前确认
    await showConfirmDialog({
      title: '提示',
      message: `本次过账共 ${selectedList.value.length} 条数据`
    })
    // 开始过账
    loading.value = true

    // 删除uuid,遍历实现
    let _list: any[] = JSON.parse(JSON.stringify(selectedList.value))
    _list.forEach((item) => delete item.uuid)

    let _data = {}

    _data = getPassParams(_list)

    // 表单验证完后，若有自定义方法，则执行
    if (props.submit) {
      props.submit(_data, loading)
    } else {
      let res: any = await WMSAPI.post(props.passAPIName, _data)
      if (res && res.success) {
        showSuccessToast(res.message ?? '操作成功')
        // 清空表单和列表
        handleClear()
      } else {
        _showFailToast(res.message as string)
      }
      loading.value = false
    }
  } finally {
    loading.value = false
  }
}

// 获取过账的参数
const getPassParams = (_list: any[]) => {
  let { locationNo } = form.value
  let boxNos = _list.map((item: any) => {
    return item.boxNo
  })
  let _data: any = {
    locationNo: locationNo, // 区域
    boxNos: boxNos, // 箱子数组
    cardNo: account, // 工号
    cardName: name, // 姓名
    oclas: '', // 移到类型-无数据
    remark: '', // 备注-无数据
    addResume: true // 后端说传-默认值-true
  }
  return _data
}

// 初始化配置项
async function initConfig() {
  await getUserWarehouse()
  _formList.value.forEach((item) => {
    // 仓库-获取下拉列表
    if (item.prop === 'warehouseNo') {
      item.change = wareHouseChange
      item.options = wareHouseList.value
    }
    // 箱子号-获取箱子明细
    if (item.prop === 'locationNo') {
      item.enter = getDetailEnter
      nextInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
    }
  })
}

// 清空
const handleClear = () => {
  // 额外参数
  exParams.value = {}
  // table数据
  list.value = []
  // 选中项集合
  selectedList.value = []
  // 表单
  form.value = {
    postDate: today
  }
}
// 行右键点击方法
const clickHandler = (key: string, data: any, index: number) => {
  emits('clickHandler', key, data, index)
}

// getUserWarehouse()
initConfig()

// 将这个清除方法暴露出去
defineExpose({
  /**
   * @description:清空界面和所选内容方法
   */
  clearHandler: handleClear,
  /**
   * 表单
   */
  form,
  /**
   * 数据列表
   */
  list,
  /**
   * Table 实例
   */
  table
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
