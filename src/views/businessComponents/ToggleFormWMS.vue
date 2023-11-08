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
          <van-checkbox v-model="selectAll" :disabled="isDisAllCheck" shape="square" @click="handleSelectAll">
            全选
          </van-checkbox>
        </van-grid-item>
      </van-grid>
    </van-sticky>

    <!-- 列表 -->
    <TableVue
      ref="table"
      v-model:table-data="list"
      :tableColumn="tableColumn"
      v-model:selection="selectedList"
      :disabled-chk="isDisCheck"
      @click-handler="clickHandler"
      @inputNumHandler="inputNumHandler"
      @inputTextHandler="inputTextHandler"
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
import { PropType, ref, watch, reactive, nextTick, computed, onMounted } from 'vue'
import FormVue from '@/components/Form/index.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { FormConfig, TableColumn } from '@/typing'
import { WMSAPI } from '@/api/generalAPI'
import { showSuccessToast, showConfirmDialog, FieldInstance } from 'vant'
import { GetUserWarehouse, GetBoxInfoByBoxId, GetLocationInfo } from '@/api/system/common'
import Dates from '@/utils/datetime'
import { checkItemToTop, validateTableSelected } from '@/utils/business'
import { v4 as uuidv4 } from 'uuid'
import useStore from '@/store'
import {
  computedTotal,
  getEditableKey,
  validateOriginQtyLimit,
  validateQtyForItem
} from '@/utils/validateOperateForQty'
import deepClone from '@/utils/deepClone'
import dayjs from 'dayjs'
import { _showFailToast } from '@/utils/message'
let emits = defineEmits(['clickHandler', 'update:snrc', 'update:barcode', 'update:chkDisabled'])
let props = defineProps({
  formList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 表单项数组
  showFormList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 需要展开显示的数据字段参数
  viewData: { type: Object as PropType<any>, default: () => ({}) }, // 列表信息总览数据
  tableColumn: { type: Array as PropType<TableColumn[]>, default: () => [] }, // 列表字段参数
  chkDisabled: { type: Boolean, default: () => false }, // 全选按钮的禁用选项
  submit: {
    type: Function,
    default: () => {
      return false
    }
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
  // 当前模式，all：加载接口后全选；one：扫码匹配或手动勾选，需传值scanlKey匹配字段；handler：只能手动勾选；addTo：追加数据,allAntDisable: 全选然后不能再选择了
  mode: { type: String, default: 'one' },
  autoSubmit: { type: Boolean, default: () => false }, // tips: 是否触发自动过账行为,当全选时自动触发过账动作
  computedKey: { type: String as PropType<string | null>, default: () => null }, // 指定一个计数逻辑key，用于处理那些特殊的数量，例如不良数之类的
  isDisableChecked: { type: Boolean, default: () => false }, // 是否禁止选择
  isCheckAndToTop: { type: Boolean, default: () => false }, // 是否选择后置顶操作
  isAllSelectAndSubmit: { type: Boolean, default: () => false }, // 是否全选才能过账
  onlyShowDoNotFillLocation: { type: Boolean, default: () => false } // 箱子回车时只需要提示，不需要填充区域
})

let table = ref<InstanceType<typeof TableVue> | null>(null)
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
let { user } = useStore()
let { account, name } = user.user

const today = new Dates(new Date()).strftime('YYYY-MM-DD')
// 物料描述 字段不统一的情况
let _materialDesc = ''
// 有的页面有条码有的没有，应对过账时传参不统一的情况
let _barcode = ''
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
// 是否能够选择
const isDisCheck = ref(false)
// 保留一份原始对象,用于校验数量的变更
let originTableData: any[] = []
const isDisAllCheck = computed({
  get() {
    return props.chkDisabled
  },
  set(val) {
    emits('update:chkDisabled', val)
  }
})

// tips: 监听一下这个参数，如果这个参数是true，那么是不允许手动进行勾选的,这个业务场景在103PO收货到质检用到了
watch(
  () => props.isDisableChecked,
  (n) => {
    if (n) {
      isDisCheck.value = true
    }
  },
  {
    deep: true,
    immediate: true
  }
)

// 对比选中项长度与数据数组总长度，是否可以勾选全选复选框
watch(
  () => [selectedList.value.length, list.value.length],
  ([val1, val2]) => {
    selectAll.value = val1 === val2 && val1 !== 0
    // tips: 这里要判断一下是否是那种自动触发过账的
    if (val1 > 0 && val2 > 0 && val1 === val2 && props.autoSubmit) {
      handleConfirm()
    }
  }
)
/** 全选和反选 */
const handleSelectAll = () => {
  table.value?.checkboxGroup.toggleAll(selectAll.value)
}

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
let areaInputRef: FieldInstance | null = null
let barcodeInputRef: FieldInstance | null = null
/** 仓库change */
function wareHouseChange(val: string | null) {
  if (!val) return
  boxInputRef?.focus()
}
/** 箱子号回车 */
function boxNoEnter(val: string | null) {
  if (!val) return
  // 调用接口带出区域，如果区域有值，光标跳转到条码，没有跳转到区域
  GetBoxInfoByBoxId(val)
    .then((res: any) => {
      // 判断箱子号是否存在
      if (res.success) {
        // tips: 这里增强行为，针对105良品入库WMS时只需要提示，不需要填充区域的
        if (props.onlyShowDoNotFillLocation && res.locationNo) {
          showSuccessToast({ message: `箱子已绑定${res.locationNo}货位` })
          areaInputRef?.focus()
        } else {
          form.value.locationID = res.locationNo as string
          barcodeInputRef?.focus()
        }
      } else {
        _showFailToast(res.message as string)
        areaInputRef?.focus()
      }
    })
    .catch(() => {
      boxInputRef?.focus()
    })
}
/** 区域回车 */
function areaEnter(val: string | null) {
  if (!val) return
  GetLocationInfo(val)
    .then((res: any) => {
      if (!res.success) {
        _showFailToast(res.message as string)
      }
    })
    .finally(() => {
      barcodeInputRef?.focus()
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
      // tips: 如果这个scanKey是mantnr要拼接前面的0,但是这个拼接的前提是如果是0开头的就不拼接，如果不是就拼接
      if (props.scanlKey === 'matnr' && !/^0/gi.test(val as string)) {
        val = '000000' + val
      }
      let target = list.value.filter((item) => item[props.scanlKey] === val)
      if (target.length > 0) {
        // 每次都是追加，不是覆盖，因为存在连续扫码的情况
        let arrs = [...selectedList.value.map((item: any) => item.uuid), ...target.map((item: any) => item.uuid)]
        // 进行勾选
        table.value?.handleSelect(arrs)
        // tips: 这里有个特殊行为，就是针对这些一条一条扫码匹配的，有些要进行匹配后置顶操作的
        if (props.isCheckAndToTop) {
          list.value = checkItemToTop(list.value, target[0])
        }
        nextTick(() => {
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
    // 2.如果是allDisabled那就是全选然后不能勾选的情况
    if (props.mode === 'allAntDisable') {
      _showFailToast('请清除信息后再扫码！')
    }
  } else {
    // 否则加载接口数据然后全选
    scanLoading.value = true
    // 如果有前置事件，则执行
    if (await props.enterFrontEvent(val, form.value.postDate)) {
      scanLoading.value = true
      return
    } else {
      WMSAPI.get(props.listAPIName, { imBarcode: val, imOclas: props.type })
        .then((res: any) => {
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
            // 处理snrc确认数组 增加uuid为唯一识别符，目前只有【Z31转移到结算仓/样机仓-WMS】使用到了
            let snrc: any[] = []
            let _snrc = (res.snrc as any[]) || []
            _snrc.forEach((item) => {
              item.uuid = uuidv4()
              snrc.push(item)
            })
            emits('update:snrc', snrc)
            emits('update:barcode', val)

            // 赋值表格数据
            list.value = arr
            // 保留一份原始值
            originTableData = deepClone(arr)
            // 存储原始数据
            staticData = JSON.parse(JSON.stringify(arr))
            // 重新组合数据
            props.enterAfterEvent && props.enterAfterEvent(list.value, staticData)

            // 默认将数据全选
            if (props.mode === 'all') {
              let arrs = list.value.map((item) => item.uuid)
              table.value?.handleSelect(arrs)
            }
            // 2.如果是allDisabled那就是全选然后不能勾选的情况
            if (props.mode === 'allAntDisable') {
              let arrs = list.value.map((item) => item.uuid)
              table.value?.handleSelect(arrs)
              isDisCheck.value = true
              emits('update:chkDisabled', true)
            }
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
          form.value.imBarcode = ''
          // 查询结果之后重新聚焦
          barcodeInputRef?.focus()
        })
    }
  }
}

/**
 * @description: 当前操作模式为addTo时条码回车事件
 * @param {*} val 条码值
 */
const barcodeEnterByAddTo = (val: string | number | null) => {
  if (!val) {
    _showFailToast('请输入条码')
    return
  }
  // 1.判断是否重复扫码
  if (list.value.length > 0) {
    let target = list.value.filter((item) => item[props.scanlKey] === val)
    if (target.length > 0) {
      _showFailToast('请勿重复扫码')
      return
    }
  }
  // 2.不重复则调用接口追加数据
  WMSAPI.post(props.listAPIName, { imBarcode: val })
    .then((res) => {
      if (res && res.success) {
        let _data: any = res.data
        form.value = Object.assign({}, form.value, _data.title)
        // 清空输入框
        form.value.imBarcode = ''
        // 增加uuid为唯一识别符
        ;(_data.data as any[]).forEach((item) => {
          item.uuid = uuidv4()
          list.value.push(item)
        })
        // 存储原始数据
        staticData = JSON.parse(JSON.stringify(list.value))

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
      form.value.imBarcode = ''
      // 查询结果之后重新聚焦
      barcodeInputRef?.focus()
    })
}
/** 表格内转出箱子号回车，带出转出区域 */
function boxIDEnter(val: string | null, index: number) {
  if (!val) return
  // 调用接口带出区域，如果区域有值，光标跳转到条码，没有跳转到区域
  GetBoxInfoByBoxId(val)
    .then((res: any) => {
      if (res.success) {
        list.value[index].locationID = res.locationNo as string
      } else {
        _showFailToast(res.message as string)
        table.value?.tableInputRef['locationID_' + index].focus()
      }
    })
    .catch(() => {
      table.value?.tableInputRef['locationID_' + index].focus()
    })
}
/**
 * 表格内输入框回车
 * @param key 输入框的key值
 * @param index 表格数据行索引
 */
function inputTextHandler(key: string, index: number) {
  if (key === 'boxID') boxIDEnter(list.value[index].boxID, index)
}

// 过账
const handleConfirm = async () => {
  const key = getEditableKey(props.tableColumn)
  try {
    // 表单验证
    await formComponent.value?.refForm.validate()
    // 表格必填项验证
    let flag = validateTableSelected(props.tableColumn, selectedList.value)
    if (!flag.isPass) {
      _showFailToast(flag.message)
      return
    }
    await validateQtyForItem(selectedList.value, key)
    await validateOriginQtyLimit(originTableData, list.value, key)
    // 确认是否可以过账
    if (!props.isPass) {
      _showFailToast('序列号未扫描完。')
      return
    }
    if (selectedList.value.length === 0) {
      _showFailToast('请勾选数据')
      return
    }
    if (props.isAllSelectAndSubmit && list.value.length !== selectedList.value.length) {
      _showFailToast('存在未确认项，请确认数据。')
      await Promise.reject()
    } // 过账前确认
    await showConfirmDialog({
      title: '提示',
      message: `本次过账共 ${selectedList.value.length} 条数据,累计数量是: ${computedTotal(
        selectedList.value,
        props.computedKey
      )},是否确认过账？`
    })
    // 开始过账
    loading.value = true
    // 删除uuid,遍历实现
    let _list: any[] = JSON.parse(JSON.stringify(selectedList.value))
    _list.forEach((item) => delete item.uuid)

    let _data = {}

    if (isPostIn.value) {
      _data = getPostInParams(_list)
    } else {
      _data = getOutStockParams(_list)
    }
    // 表单验证完后，若有自定义方法，则执行
    if (await props.submit(_data)) {
      loading.value = false
      return
    }
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
    console.log('这里报错了', e)

    loading.value = false
  }
}

// 获取过账（入库）的参数
const getPostInParams = (_list: any[]) => {
  let { boxID, locationID, warehouseNo } = form.value

  let wmsPostInList: any[] = []
  _list.forEach((item) => {
    let obj = {
      boxID: boxID || item.boxID || '', // 箱子号取值顺序
      materialID: item.matnr || item.idnrk,
      materialDesc: item[_materialDesc],
      quantity: item.erfmg, // 数字类型
      barcode: _barcode ? item[_barcode] : item.objnr || item.barcode,
      oclas: props.type, // 与查询明细的imOclas参数保持一致
      stationID: '', // 不需要传参
      projectID: item.proje,
      batchID: item.prodbatch,
      mark: '', // 不需要传参
      resultMsg: '', // 不需要传参
      locationID: locationID || item.locationID || '', // 区域号取值顺序
      cardNo: account,
      cardName: name,
      poid: item.ebeln,
      poItemNo: item.ebelp,
      proofNumber: item.mblnr,
      ngeln: item.ngeln
    }
    wmsPostInList.push(obj)
  })
  // tips: 这里混入用户名和账号，传入sap列表
  _list = _list.map((item) => ({ ...item, IM_CARDNO: account, IM_CARDNAME: name }))
  // 删除明细中需要扫码/输入的箱子号和区域
  _list.forEach((item) => {
    delete item.boxID
    delete item.locationID
  })
  // tips:在sap列表内也要传入当前登录人的信息
  _list = _list.map((item) => ({
    ...item,
    IM_CARDNO: account,
    IM_CARDNAME: name,
    cpudt: dayjs(new Date()).format('YYYY-MM-DD'),
    cputm: dayjs(new Date()).format('HH:mm:ss')
  }))
  let _data: any = {
    IM_OCLAS: props.type,
    IM_CARDNO: account,
    IM_CARDNAME: name,
    warehouseNo,
    wmsPostInList,
    zxstXmbeStruList: _list
  }

  return _data
}

// 获取过账（退货、出货）的参数
const getOutStockParams = (_list: any[]) => {
  let { warehouseNo, boxID, locationID, targetBoxID } = form.value
  let wmsOutStockList: any[] = []
  _list.forEach((item) => {
    let obj = {
      boxID: boxID || item.boxID || '', // TODO: 页面有才有值，待发现
      receiveBoxID: '', // TODO: 页面有才有值，待发现
      materialID: item.matnr || item.idnrk,
      materialDesc: item[_materialDesc],
      quantity: item.erfmg, // 数字类型
      projectID: item.proje,
      barcode: _barcode ? item[_barcode] : item.objnr || item.barcode,
      batchID: item.prodbatch,
      oclas: props.type, // 与查询明细的imOclas参数保持一致
      locationID: locationID || item.locationID || '', // TODO: 货位，页面有才有值，待发现
      areaId: '', // TODO: 页面有才有值，待发现
      whId: warehouseNo,
      cardNo: account,
      cardName: name,
      poid: item.ebeln,
      poItemNo: item.ebelp,
      proofNumber: item.mblnr,
      werks: item.werks,
      ngeln: item.ngeln,
      targetBoxID: targetBoxID || '', // TODO: 需确认，目标载具编号
      targetLocationID: '' // TODO: 需确认，目标货位
    }
    wmsOutStockList.push(obj)
  })
  // 删除明细中需要扫码/输入的箱子号和区域
  _list.forEach((item) => {
    delete item.boxID
    delete item.locationID
  })
  // tips:spa列表也要混入当前登录人的信息
  _list = _list.map((item) => ({
    ...item,
    IM_CARDNO: account,
    IM_CARDNAME: name,
    cpudt: dayjs(new Date()).format('YYYY-MM-DD'),
    cputm: dayjs(new Date()).format('HH:mm:ss')
  }))
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
    if (item.label === '物料描述') _materialDesc = item.prop
    if (item.label === '条码') _barcode = item.prop
  })
  _formList.value.forEach((item) => {
    if (item.prop === 'warehouseNo') {
      item.change = wareHouseChange
      item.options = wareHouseList.value
    }
    if (item.prop === 'boxID') {
      item.enter = boxNoEnter
      boxInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
    if (item.prop === 'locationID') {
      item.enter = areaEnter
      areaInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
    if (item.prop === 'imBarcode') {
      // 追加模式
      if (props.mode === 'addTo') {
        item.enter = barcodeEnterByAddTo
      } else {
        item.enter = barcodeEnter
      }

      barcodeInputRef = formComponent.value?.formInputRef[item.prop].inputRef
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
  // let inputRef = formComponent.value?.formInputRef[formList.value[3].prop].inputRef
  // inputRef.focus()
}
// 行右键点击方法
const clickHandler = (key: string, data: any, index: number) => {
  emits('clickHandler', key, data, index)
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
  /** 选中项列表 */
  selectedList,
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
