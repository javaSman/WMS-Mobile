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
      :disabledChk="true"
      v-model:selection="selectedList"
      @inputNumHandler="inputNumHandler"
    />
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
import { PropType, ref, reactive, computed, onMounted } from 'vue'
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
import { GetUserWarehouse, GetBoxDetail, GetBoxInfoByBoxId, GetLocationInfo } from '@/api/system/common'
import { getPostInParams, getOutStockParams, getEditableKey, computedTotal } from '@/utils/wmsFunction'
import { _showFailToast } from '@/utils/message'

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
  snrc: { type: Array as PropType<any[]>, default: () => [] }, // 确认信息数组
  isPass: { type: Boolean, default: () => true },
  // 1.扫码匹配字段一标识key，此key是用来实现业务的，必须传入；2.追加数据判断是否重复扫码的唯一识别符
  scanlKey: { type: String, default: 'matnr' },
  // 当前模式，all：加载接口后全选；one：扫码匹配或手动勾选，需传值scanlKey匹配字段；handler：只能手动勾选；addTo：追加数据
  mode: { type: String, default: 'one' }
})

let table = ref<InstanceType<typeof TableVue> | null>(null) // 表格ref
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
// 如果过账的时PostIn，表示入库，OutStock 表示退货，两边接口参数不一致
const isPostIn = computed<boolean>(() => props.passAPIName.endsWith('/PostIn'))

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

let boxInputRef: FieldInstance | null = null // 箱子号ref
let targetBoxInputRef: FieldInstance | null = null // 目标箱子号ref
let areaInputRef: FieldInstance | null = null // 区域ref

/** 仓库change */
function wareHouseChange(val: string | null) {
  if (!val) return
  boxInputRef?.focus()
}

/** 箱子号回车带出明细
 *  判断是否有明细
 */
function getBoxDetails(val: string | null) {
  if (!val) return
  scanLoading.value = true
  GetBoxDetail(val)
    .then((res: any) => {
      if (res && res.success) {
        let _data = res.materialBarcodeList as any[]
        selectedList.value = []
        if (_data.length === 0) {
          _showFailToast(`箱子号[${val}]下没有明细物料，请重新扫码`)
          form.value.boxID = ''
          boxInputRef?.focus()
          list.value = []
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
        // 默认将数据全选-当前功能需求-查数据后全选
        if (props.mode === 'all') {
          let arrs: any[] = list.value.map((item) => item.uuid)
          table.value?.handleSelect(arrs)
        }
        targetBoxInputRef?.focus() // 当前功能需求-跳转至接收箱子号
      } else {
        _showFailToast(res.message)
      }
    })
    .finally(() => {
      scanLoading.value = false
    })
}

/** 箱子号回车
 *  1、查询箱子是否存在-
 *  2、查询箱子是否有绑定货位-（1）未绑定货位-光标跳转到【货位】；（2）已绑定货位-给货位赋值、光标跳转到【下一输入框】
 */
function boxNoEnter(val: string | null) {
  if (!val) return
  // 调用接口带出区域，如果区域有值，光标跳转到条码，没有跳转到区域
  GetBoxInfoByBoxId(val)
    .then((res: any) => {
      // 判断箱子号是否存在
      if (res.success) {
        // 判断箱子号是否可以带出货位
        if (res.locationNo) {
          form.value.targetLocationID = res.locationNo as string // targetLocationID 字段根据需求
          // 聚焦下一个输入框
        } else {
          areaInputRef?.focus()
        }
      } else {
        _showFailToast(res.message as string)
        if (res.message.includes('没有绑定货位')) {
          areaInputRef?.focus()
        } else {
          targetBoxInputRef?.focus() // targetBoxInputRef 字段根据需求
        }
      }
    })
    .catch(() => {
      targetBoxInputRef?.focus() // targetBoxInputRef 字段根据需求
    })
}

/** 区域回车
 *  查询区域是否存在-（1）存在-光标跳转到【下一输入框】（2）不存在-错误提示
 */
function areaEnter(val: string | null) {
  if (!val) return
  GetLocationInfo(val)
    .then((res: any) => {
      console.log(res)
      if (res.success) {
        // 聚焦下一个输入框
      } else {
        _showFailToast(res.message as string)
        areaInputRef?.focus()
      }
    })
    .catch(() => {
      areaInputRef?.focus()
    })
}

/** 表格选中项-验证 */
let validateTable = () => {
  let flag: boolean = false
  for (let col of props.tableColumn) {
    let rules: any[] = col?.rules ?? []
    if (rules.length > 0) {
      for (let rule of rules) {
        if (rule.required) {
          for (let row of selectedList.value) {
            if ((row[col.prop] ?? '') === '') {
              flag = true
              break
            }
          }
        }
        if (rule.validator !== undefined) {
          for (let row of selectedList.value) {
            let idx = list.value.findIndex((item: any) => row.uuid === item.uuid)
            numBlurParams = ref<any>({ key: col.prop, index: idx })
            if (rule.validator(row[col.prop]) !== true) {
              flag = true
              break
            }
          }
        }
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

    let key = getEditableKey(props.tableColumn)
    if (key && !selectedList.value.every((item) => Number(item[key]) > 0)) {
      _showFailToast('所提交项中存在数量小于或等于0的项目，请检查')
      return
    }
    // 过账前确认
    await showConfirmDialog({
      title: '提示',
      message: `本次过账共 ${selectedList.value.length} 条数据,累计数量是: ${computedTotal(
        selectedList.value,
        props.tableColumn
      )},是否确认过账？`
    })
    // 开始过账
    loading.value = true
    // 处理接口参数

    // 删除uuid,遍历实现
    let _list: any[] = JSON.parse(JSON.stringify(selectedList.value))
    _list.forEach((item) => delete item.uuid)

    let _data = {}
    if (isPostIn.value) {
      _data = getPostInParams(_list, form.value, { account, name }, props.type)
    } else {
      _data = getOutStockParams(_list, form.value, { account, name }, props.type)
    }
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
  } catch (e: any) {
    if (e !== 'cancel') {
      _showFailToast({ message: e[0].message })
    }
  } finally {
    loading.value = false
  }
}

// 用于存储当前正在编辑的行的索引
let numBlurParams = ref<any>({ key: 'newQuantity', index: 0 })

// 校验规则
function validateErfmg(): any {
  let { key, index } = numBlurParams.value
  // 改变后的值
  let x = Number(list.value[index][key])
  // 原始值
  let y = staticData[index][key]
  if (!x || x < 0) return '数量不能小于等于0'
  if (x > y) return '数量不能大于' + y
  else return true
}

// 判断数量，不能大于原数量， 不能小于等于0
function inputNumHandler(key: string, index: number) {
  numBlurParams.value = { key, index }
}

// 初始化配置项
async function initConfig() {
  await getUserWarehouse()
  props.tableColumn.forEach((item) => {
    if (item.type === 'Table/NumberInput') {
      let _erfmgRules: any[] = [
        { required: true, message: '请输入数量', trigger: 'onBlur' },
        { validator: validateErfmg }
      ]
      item.rules = _erfmgRules
    }
  })
  _formList.value.forEach((item) => {
    // 仓库-获取下拉列表
    if (item.prop === 'warehouseNo') {
      item.change = wareHouseChange
      item.options = wareHouseList.value
    }
    // 箱子号-获取箱子明细
    if (item.prop === 'boxNo') {
      item.enter = getBoxDetails
      boxInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
    }
    // 箱子号/接收箱子号-获取区域
    if (item.prop === 'targetBoxID') {
      item.enter = boxNoEnter
      targetBoxInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
    }
    // 区域/货位/接收货位-验证货位值
    if (item.prop === 'targetLocationID') {
      item.enter = areaEnter
      areaInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
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

onMounted(() => {
  initConfig()
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
.form-vue {
  :deep(.van-cell__title) {
    width: 60px !important;
  }
}
</style>
