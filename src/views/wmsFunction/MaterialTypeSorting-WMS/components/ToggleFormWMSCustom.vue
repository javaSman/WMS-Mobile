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

<script lang="ts" setup name="PageMaterialTypeSorting-WMS">
import { PropType, ref, reactive, onMounted } from 'vue'
import FormGroup from '../../components/FormGroup.vue'
import SummaryCheck from '../../components/SummaryCheck.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { FormConfig, TableColumn } from '@/typing'
import { WMSAPI } from '@/api/generalAPI'
import { showSuccessToast, showConfirmDialog, FieldInstance } from 'vant'
import Dates from '@/utils/datetime'
import { v4 as uuidv4 } from 'uuid'
import { GetBoxInfoByBoxId } from '@/api/system/common'
import { computedTotal } from '@/utils/wmsFunction'
import { _showFailToast } from '@/utils/message'
// import useStore from '@/store'

let props = defineProps({
  formList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 表单项数组
  showFormList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 需要展开显示的数据字段参数
  viewData: { type: Object as PropType<any>, default: () => ({}) }, // 列表信息总览数据
  tableColumn: { type: Array as PropType<TableColumn[]>, default: () => [] }, // 列表字段参数
  chkDisabled: { type: Boolean, default: () => false },
  submit: { type: Function, default: undefined }, // 过账按钮前执行事件
  passAPIName: { type: String, default: () => '' }, // 过账接口地址
  listAPIName: { type: String, default: () => '' }, // 扫码查询接口地址
  boxIDAPIName: { type: String, default: () => '' }, // 扫码箱子号查询接口地址
  type: { type: String, default: () => '' }, // 页面业务类型
  confirmText: { type: String, default: () => '过账' }, // 底部按钮显示文本
  enterFrontEvent: { type: Function, default: () => false }, // 条码回车事件前执行事件
  enterAfterEvent: { type: Function, default: undefined }, // 条码回车事件后执行事件，用于重新组合数据
  isPass: { type: Boolean, default: () => true },
  // 1.扫码匹配字段一标识key，此key是用来实现业务的，必须传入；2.追加数据判断是否重复扫码的唯一识别符
  scanlKey: { type: String, default: 'matnr' },
  // 当前模式，all：加载接口后全选；one：扫码匹配或手动勾选，需传值scanlKey匹配字段；handler：只能手动勾选；addTo：追加数据
  mode: { type: String, default: 'one' }
})

let table = ref<InstanceType<typeof TableVue> | null>(null)
let refFormGroup = ref<any>({}) // 表单组合ref

// let { user } = useStore()
// let { account, name } = user.user

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

/** 全选和反选 */
const handleSelectAll = () => {
  table.value?.checkboxGroup.toggleAll(selectAll.value)
}

let boxInputRef: FieldInstance | null = null
let barcodeInputRef: FieldInstance | null = null

/** 箱子号回车
 *  1、查询箱子是否存在-（1）存在：光标跳转到【下一输入框】
 */
function boxNoEnter(val: string | null) {
  if (!val) return
  // 调用接口带出区域，如果区域有值，光标跳转到条码，没有跳转到区域
  GetBoxInfoByBoxId(val)
    .then((res: any) => {
      // 判断箱子号是否存在
      if (!res.success && !res.message.includes('没有绑定货位')) {
        _showFailToast(res.message as string)
        boxInputRef?.focus() // boxInputRef 字段根据需求
      } else {
        barcodeInputRef?.focus() // boxInputRef 字段根据需求
      }
    })
    .catch(() => {
      boxInputRef?.focus() // boxInputRef 字段根据需求
    })
}

/**
 * @description: 当前操作模式为addTo时回车事件
 * @param {*} val 值
 */
const enterByAddTo = (val: string | number | null, paramsProp: string, listProp: string, inputProp: string) => {
  // 1.判断是否重复扫码
  if (list.value.length > 0) {
    let target = list.value.filter((item) => item[props.scanlKey] === val)
    if (target.length > 0) {
      _showFailToast('请勿重复扫码')
      return
    }
  }
  let params: any = {}
  params[paramsProp] = [val]
  // 2.不重复则调用接口追加数据
  scanLoading.value = true
  WMSAPI.get(props.listAPIName, params)
    .then((res: any) => {
      if (res && res.success) {
        let _data: any[] = res[listProp]
        // 清空输入框
        form.value[inputProp] = ''
        if (_data === null || _data.length === 0) {
          _showFailToast('暂无数据')
          return
        }
        // 增加uuid为唯一识别符
        _data.forEach((item) => {
          item.uuid = uuidv4()
          list.value.push(item)
        })
        // 存储原始数据
        staticData = JSON.parse(JSON.stringify(list.value))
        staticData.forEach((item: any) => {
          item.newQuantity = item.quantity
        })
        let arrs = list.value.map((item) => item.uuid)
        // 默认勾选数据
        table.value?.handleSelect(arrs)
      } else {
        _showFailToast(res.message as string)
      }
    })
    .catch(() => {
      // 在返回错误后清空页面
      // handleClear()
    })
    .finally(() => {
      scanLoading.value = false
      form.value[inputProp] = ''
      // 查询结果之后重新聚焦
      barcodeInputRef?.focus()
    })
}

/** 当前操作模式为addTo时回车事件-条码 */
let barcodeEnterByAddTo = (val: string | number | null) => {
  if (!val) {
    _showFailToast('请输入条码')
    return
  }
  enterByAddTo(val, 'barcodes', 'barcodeList', 'imBarcode')
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

    // 过账前确认
    await showConfirmDialog({
      title: '提示',
      message: `本次过账共 ${selectedList.value.length} 条数据,累计数量是: ${computedTotal(
        selectedList.value,
        [],
        'quantity'
      )},是否确认过账？`
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
      console.log(_data)
      let res: any = await WMSAPI.post(props.passAPIName, _data)
      if (res && res.success) {
        showSuccessToast(res.message || '过账成功')
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

// 获取过账（物料类型分拣）的参数
const getPassParams = (_list: any[]) => {
  let { boxNo } = form.value
  let barcodes = _list.map((item: any) => {
    return item.barcode
  })
  let _data: any = {
    boxNo: boxNo,
    barcodes: barcodes, // 条码数组
    oclas: '', // 移到类型-无数据
    remark: '', // 备注-无数据
    addResume: true // 后端说传-默认值-true
  }
  return _data
}

// 初始化配置项
async function initConfig() {
  _formList.value.forEach((item) => {
    // 箱子号/接收箱子号-获取区域
    if (item.prop === 'boxNo') {
      boxInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
      item.enter = boxNoEnter
    }
    // 条码
    if (item.prop === 'imBarcode') {
      // 追加模式
      item.enter = barcodeEnterByAddTo
      barcodeInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
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
  boxInputRef?.focus()
}

onMounted(() => {
  initConfig()
  boxInputRef?.focus()
})

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
