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

<script lang="ts" setup name="ToggleFormWMSVue">
import { PropType, ref, watch, nextTick } from 'vue'
import FormVue from '@/components/Form/index.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { FormConfig, TableColumn } from '@/typing'
import { WMSAPI } from '@/api/generalAPI'
import { showSuccessToast, showConfirmDialog, FieldInstance } from 'vant'
import { GetBoxInfoByBoxId, GetLocationInfo, GetUserWarehouse } from '@/api/system/common'
import Dates from '@/utils/datetime'
import { validateTableSelected } from '@/utils/business'
import { v4 as uuidv4 } from 'uuid'
import useStore from '@/store'
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
  enterFrontEvent: {
    type: Function,
    default: () => false
  }, // 条码回车事件前执行事件
  enterAfterEvent: {
    type: Function,
    default: undefined
  }, // 条码回车事件后执行事件，用于重新组合数据
  snrc: { type: Array as PropType<any[]>, default: () => [] }, // 确认信息数组
  isPass: { type: Boolean, default: () => true },
  // 1.扫码匹配字段一标识key，此key是用来实现业务的，必须传入；2.追加数据判断是否重复扫码的唯一识别符
  scanlKey: { type: String, default: 'matnr' },
  // 当前模式，all：加载接口后全选；one：扫码匹配或手动勾选，需传值scanlKey匹配字段；handler：只能手动勾选；addTo：追加数据
  mode: { type: String, default: 'one' },
  autoSubmit: { type: Boolean, default: () => false } // tips: 是否触发自动过账行为,当全选时自动触发过账动作
})

let table = ref<InstanceType<typeof TableVue> | null>(null)
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
let { user } = useStore()
let { account, name } = user.user

const today = new Dates(new Date()).strftime('YYYY-MM-DD')
// 物料编号 物料描述 字段不统一的情况
let _materialNo = ''
let _materialDesc = ''
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
// 用于存储列表原始数据
let staticData: any[] = []
// 用于存储仓库列表
let wareHouseList = ref<any[]>([])

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

let boxInputRef: FieldInstance | null = null
let targetBoxIDInputRef: FieldInstance | null = null
let areaInputRef: FieldInstance | null = null
let barcodeInputRef: FieldInstance | null = null
/** 仓库change */
function wareHouseChange(val: string | null) {
  if (!val) return
  targetBoxIDInputRef?.focus()
}
/** 箱子号回车 */
function boxNoEnter(val: string | null, target: string) {
  if (!val) return
  // 调用接口带出区域，如果区域有值，光标跳转到条码，没有跳转到区域
  GetBoxInfoByBoxId(val)
    .then((res: any) => {
      // console.log(res)
      // 如果当前是转出箱子，则跳转到条码
      if (target === 'boxID') boxIDEnter(res)
      // 如果当前时转入箱子（目标载具），则看区域值来定
      else targetBoxIDEnter(res)
    })
    .catch(() => {
      if (target === 'boxID') boxInputRef?.focus()
      else targetBoxIDInputRef?.focus()
    })
}
// 箱子号跳转判断
function boxIDEnter(res: any) {
  if (res.success) {
    barcodeInputRef?.focus()
  } else {
    _showFailToast(res.message as string)
    boxInputRef?.focus()
  }
}
// 目标箱子号回车
function targetBoxIDEnter(res: any) {
  if (res.success) {
    form.value.locationID = res.locationNo as string
    boxInputRef?.focus()
  } else {
    _showFailToast(res.message as string)
    targetBoxIDInputRef?.focus()
  }
}
/** 区域回车 */
function areaEnter(val: string | null) {
  if (!val) return
  GetLocationInfo(val)
    .then((res: any) => {
      // console.log(res)
      if (res.success) {
        boxInputRef?.focus()
      } else {
        _showFailToast(res.message as string)
        areaInputRef?.focus()
      }
    })
    .catch(() => {
      areaInputRef?.focus()
    })
}
/**
 * @description: 条码回车事件，需判断匹配明细的方式
 * @param {*} val 条码值
 */
const barcodeEnter = async (val: string | number | null) => {
  if (!val) {
    _showFailToast('请输入条码')
    return
  }
  // 以list.value的长度作为判断条件，大于0，表面如果页面明细没有被清除，等于0表明页面无信息
  if (list.value.length > 0) {
    // 1.当模式是扫码匹配
    if (props.mode === 'one') {
      // 从结果集中寻找
      let target = list.value.filter((item) => item[props.scanlKey] === val)
      if (target.length > 0) {
        // 每次都是追加，不是覆盖，因为存在连续扫码的情况
        let arrs = [...selectedList.value.map((item: any) => item.uuid), ...target.map((item: any) => item.uuid)]
        // 进行勾选
        table.value?.handleSelect(arrs)
        nextTick(() => {
          // 清空输入框
          form.value.imBarcode = ''
          // 光标重新聚焦
          barcodeInputRef?.focus()
        })
      } else {
        _showFailToast('没有找到结果，请检查重试或清除结果后重新扫码')
      }
    }
    // 2.当模式是手动勾选
    if (props.mode === 'handler') {
      _showFailToast('请手动勾选数据过账或清除信息后再扫码！')
    }
    // 3.当前模式是默认全选
    if (props.mode === 'all') {
      _showFailToast('请清除信息后再扫码！')
    }
    return
  }

  try {
    // 否则加载接口数据然后全选
    scanLoading.value = true
    // 如果有前置事件，则执行
    let enterFront = await props.enterFrontEvent(val, form.value.postDate)
    if (enterFront) {
      scanLoading.value = true
      return
    }
    let res = await WMSAPI.get(props.listAPIName, { imBarcode: val, imOclas: props.type })
    if (res && res.success) {
      let _data = res.data as any[]
      if (_data.length === 0) {
        _showFailToast('暂无数据')
        return
      }
      // TODO: 使用静态测试数据
      // let _data: any[] = testData.data
      if (_data.length > 0) {
        form.value = Object.assign({}, form.value, _data[0])
      }

      let arr: any[] = []
      // 增加uuid为唯一识别符
      _data.forEach((item) => {
        item.uuid = uuidv4()
        arr.push(item)
      })
      // 赋值表格数据
      list.value = arr
      // 存储原始数据
      staticData = JSON.parse(JSON.stringify(arr))
      // 重新组合数据
      props.enterAfterEvent && props.enterAfterEvent(list.value, staticData)

      let arrs = list.value.map((item) => item.uuid)
      // 默认将数据全选
      if (props.mode === 'all') {
        table.value?.handleSelect(arrs)
      }
    } else {
      _showFailToast(res.message as string)
    }
  } catch (e) {
    console.log(e)
  } finally {
    scanLoading.value = false
    form.value.imBarcode = ''
    // 查询结果之后重新聚焦
    barcodeInputRef?.focus()
  }
}

// 过账
const handleConfirm = async () => {
  try {
    // 表单验证
    await formComponent.value?.refForm.validate()
    // 表格必填项验证
    let flag = validateTableSelected(props.tableColumn, selectedList.value)
    if (!flag.isPass) {
      _showFailToast(flag.message)
      return
    }
    // 确认是否可以过账
    if (!props.isPass) {
      _showFailToast('序列号未扫描完。')
      return
    }
    if (selectedList.value.length === 0) {
      _showFailToast('请勾选数据')
      return
    }

    let key = getEditableKey()
    if (key && !selectedList.value.every((item) => Number(item[key]) > 0)) {
      _showFailToast('所提交项中存在数量小于或等于0的项目，请检查')
      return
    }
    // 过账前确认
    await showConfirmDialog({
      title: '提示',
      message: `本次过账共 ${selectedList.value.length} 条数据,累计拣货数量是: ${computedTotal(
        selectedList.value
      )},是否确认过账？`
    })
    // 开始过账
    loading.value = true
    // 删除uuid,遍历实现
    let _list: any[] = JSON.parse(JSON.stringify(selectedList.value))
    _list.forEach((item) => delete item.uuid)

    let _data = getOutStockParams(_list)

    // 表单验证完后，若有自定义方法，则执行
    if (props.submit) {
      props.submit(_data, loading)
    } else {
      let res = await WMSAPI.post(props.passAPIName, _data)

      if (res && res.success) {
        showSuccessToast((res.message as string) || '过账成功')
        // 清空表单和列表
        handleClear()
      } else {
        _showFailToast(res.message as string)
      }
      loading.value = false
    }
  } catch (e) {
    console.log(e)
    loading.value = false
  }
}

// 获取过账（退货、出货）的参数
const getOutStockParams = (_list: any[]) => {
  let { warehouseNo, boxID, locationID, targetBoxID } = form.value

  let wmsOutStockList: any[] = []
  _list.forEach((item) => {
    let obj = {
      boxID: boxID,
      receiveBoxID: '', // TODO: 页面有才有值，待发现
      materialID: item[_materialNo],
      materialDesc: item[_materialDesc],
      quantity: item.erfmg, // 数字类型
      projectID: item.proje,
      barcode: item.barcode,
      batchID: item.prodbatch,
      oclas: props.type, // 与查询明细的imOclas参数保持一致
      locationID: locationID,
      areaId: '', // TODO: 页面有才有值，待发现
      whId: warehouseNo,
      cardNo: account,
      cardName: name,
      poid: item.ebeln,
      poItemNo: item.cardmo,
      proofNumber: item.mblnr,
      werks: item.werks,
      ngeln: item.ngeln,
      targetBoxID: targetBoxID,
      targetLocationID: '' // TODO: 需确认，目标货位
    }
    wmsOutStockList.push(obj)
  })
  // 删除明细中需要扫码/输入的箱子号和区域
  _list.forEach((item) => {
    delete item.boxID
    delete item.locationID
  })

  let _data: any = {
    iM_OCLAS: props.type,
    IM_CARDNO: account,
    IM_CARDNAME: name,
    WarehouseNo: warehouseNo,
    wmsOutStockList,
    TargetWarehouseNo: '', // 目标仓库编号, --不是必填
    zxstXmbeStruList: _list
  }

  return _data
}

// 计算勾选的累计数量
const computedTotal = (arr: any[]) => {
  // let key = getEditableKey()
  let key = 'erfmg'
  return arr.reduce((pre, next) => {
    // eslint-disable-next-line no-prototype-builtins
    if (pre.hasOwnProperty(key)) {
      return Number(pre[key]) + Number(next[key])
    } else {
      return Number(next[key])
    }
  }, 0)
}

// 获取可编辑项的prop
// 取出tableColumn中类型是Table/Number的项目的prop，因为这个才是可以编辑的项
const getEditableKey = () => {
  let tarItem = props.tableColumn.find((item) => item.type === 'Table/Number')
  let key = tarItem?.prop || ''
  return key
}

// 用于存储当前正在编辑的行的索引
let numBlurParams = ref<any>({ key: 'erfmg', index: 0 })
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
    if (item.label === '物料编号') _materialNo = item.prop
    if (item.label === '物料描述') _materialDesc = item.prop
  })
  _formList.value.forEach((item) => {
    if (item.prop === 'warehouseNo') {
      item.change = wareHouseChange
      item.options = wareHouseList.value
    }
    if (item.prop === 'boxID') {
      item.enter = (val: string | null) => boxNoEnter(val, 'boxID')
      boxInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
    if (item.prop === 'locationID') {
      item.enter = areaEnter
      areaInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
    if (item.prop === 'imBarcode') {
      item.enter = barcodeEnter
      barcodeInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
    if (item.prop === 'targetBoxID') {
      item.enter = (val: string | null) => boxNoEnter(val, 'targetBoxID')
      targetBoxIDInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
  })
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
}

initConfig()
</script>

<style lang="scss" scoped>
.loading_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
