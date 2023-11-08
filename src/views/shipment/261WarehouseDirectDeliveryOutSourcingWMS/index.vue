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
        <van-checkbox :disabled="isDisableChecked" v-model="selectAll" shape="square" @click="handleSelectAll">
          全选
        </van-checkbox>
      </van-grid-item>
    </van-grid>
  </van-sticky>
  <!-- 列表 -->
  <Table
    ref="table"
    v-model:table-data="tableData"
    :tableColumn="tableColumn"
    v-model:selection="selection"
    @input-num-handler="inputNumHandler"
    :disabledChk="isDisableChecked"
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
  <!-- 调用扫条码时的loading效果，同时阻止用户继续操作 -->
  <van-overlay :show="scanLoading">
    <div class="loading_wrapper" @click.stop>
      <van-loading color="#ffffff" type="spinner">数据加载中</van-loading>
    </div>
  </van-overlay>
</template>

<script lang="ts">
// 261发料-仓库直发-外购件WMS
const cachedName = 'shipment.261WarehouseDirectDeliveryOutSourcingWMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import FormVue from '@/components/Form/index.vue'
import UserAuth from '@/views/businessComponents/UserAuth.vue'
import Table from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { formList, showFormList, tableColumn } from './config'
import { nextTick, ref, watch, onMounted } from 'vue'
import { WMSAPI } from '@/api/generalAPI'
import { FieldInstance, showConfirmDialog, showSuccessToast } from 'vant'
import Dates from '@/utils/datetime'
import { v4 as uuidv4 } from 'uuid'
import Loading from '@/components/Loading'
import { checkItemToTop, validateTableSelected } from '@/utils/business'
import useAuth from './hooks/useAuth'
import useStore from '@/store'
import { GetBoxDetail, GetBoxInfoByBoxId, GetLocationInfo, GetUserWarehouse } from '@/api/system/common'
import { fomrmatShipmentSubmitParams } from '@/utils/formatShipmentBusiness'
import { FormConfig } from '@/typing'
import { computedTotal } from '@/utils/validateOperateForQty'
import { _showFailToast } from '@/utils/message'
import { deepClone } from '@/utils'
// import testData2 from '@/views/testData2'
// import testData from '@/views/testData'

const passAPIName = 'business/webapi/OutStock'
// 查询表体数据的接口
const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const imOclas = 'XWMS261D'
const today = new Dates(new Date()).strftime('YYYY-MM-DD')
const { userAuthVisible, extraParams } = useAuth()
const tableData = ref<any[]>([])
const barcodeList = ref<string[]>([]) // 储存被扫码过的领料单号
let numBlurParams = ref<any>({ key: 'erfmg', index: 0 })
// 输入框实例
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
// 列表实例
let table = ref<InstanceType<typeof Table> | null>(null)
// 控制隐藏区域
const show = ref(false)
// 表单数据
const form = ref<Record<string, any>>({
  postDate: today
})
const { user } = useStore()
// 底部过账按钮loading
const loading = ref(false)
// 扫条码时进行loading
const scanLoading = ref(false)
// 保留一份原始对象,用于校验数量的变更
let staticData: any[] = []
// 选中的数据
const selection = ref<any[]>([]) // 箱子号带出的明细的勾选项
const selectionList = ref<any[]>([]) // 领料单号带出的明细的勾选项
const boxMaterialList = ref<any[]>([]) // 来源载具带出来的条码列表
// 是否全选
const selectAll = ref(false)
// 是否禁止勾选,需要校验之后才能勾选
const isDisableChecked = ref(true)

let boxInputRef: FieldInstance | null = null
let targetBoxIDInputRef: FieldInstance | null = null
let targetLocationIDInputRef: FieldInstance | null = null
let barcodeInputRef: FieldInstance | null = null

let _formList = ref<FormConfig[]>(JSON.parse(JSON.stringify(formList)))
// 对比选中项长度与数据数组总长度，是否可以勾选全选复选框
watch(
  () => [selection.value.length, tableData.value.length],
  ([val1, val2]) => {
    selectAll.value = val1 === val2 && val1 !== 0
  }
)

/**
 * @description: 来源载具回车，带出明细
 * @param {*} val
 */
const boxIDEnter = (val: string | null) => {
  if (!val) return
  Loading.show()
  GetBoxDetail(val)
    .then((res) => {
      if (res.success) {
        let _data = res.materialBarcodeList as any[]
        // let _data = testData2.data as any[]
        if (_data.length === 0) {
          _showFailToast(`箱子${val}暂无明细`)
          boxInputRef?.focus()
          form.value.boxID = ''
          return
        }
        // tips:保留这个条码列表，稍后扫码领料单号的列表比对，如果合适就显示出那项并勾选
        boxMaterialList.value = _data
        // 混入唯一值，用于勾选数据
        // _data.forEach((item) => (item.uuid = uuidv4()))
        // tableData.value = _data
        // // 深拷贝保留一份副本
        // staticData = deepClone(tableData.value)
        // 光标跳转到目标载具
        targetBoxIDInputRef?.focus()
      } else {
        _showFailToast(res.message)
        boxInputRef?.focus()
        form.value.boxID = ''
      }
    })
    .catch((e) => {
      boxInputRef?.focus()
    })
    .finally(() => {
      Loading.hide()
    })
}

/**
 * 目标载具回车，带出目标区域
 * @param val 目标载具
 */
function targetBoxIDEnter(val: string | null) {
  if (!val) return
  GetBoxInfoByBoxId(val).then((res: any) => {
    // console.log(res)
    // 判断箱子号是否存在
    if (res.success) {
      form.value.targetLocationID = res.locationNo as string
      barcodeInputRef?.focus()
    } else {
      _showFailToast(res.message as string)
      targetLocationIDInputRef?.focus()
    }
  })
}

/**
 * 验证目标区域是否存在
 * @param val 目标区域
 */
function targetLocationIDEnter(val: string | null) {
  if (!val) return
  GetLocationInfo(val)
    .then((res) => {
      // console.log(res)
      if (res.success) {
        barcodeInputRef?.focus()
      } else {
        _showFailToast(res.message)
        targetLocationIDInputRef?.focus()
      }
    })
    .catch(() => {
      targetLocationIDInputRef?.focus()
    })
}

/**
 * 扫码领料单号，储存明细，与箱子号内的明细相使用条码匹配
 * @param val 领料单号
 */
const barcodeEnter = async (val: string | null) => {
  if (!val) return
  // 判断是否已经扫码箱子号
  if (boxMaterialList.value.length === 0 || !form.value.boxID) {
    _showFailToast(`请先扫码来源载具`)
    barcodeInputRef?.focus()
    nextTick(() => {
      form.value.imBarcode = ''
    })
    return
  }
  // 判断是否已经扫码过
  if (barcodeList.value.includes(val)) {
    _showFailToast(`领料单号${val}已扫码完成，请勿重复扫码`)
    barcodeInputRef?.focus()
    nextTick(() => {
      form.value.imBarcode = ''
    })
    return
  } else {
    barcodeList.value.push(val)
  }
  try {
    scanLoading.value = true
    let res = await WMSAPI.get(listAPIName, { imBarcode: val, imOclas })
    if (!res.success) {
      _showFailToast(res.message as string)
      return
    }
    let _data = res.data as any[]
    // let _data = testData.data as any[]
    if (_data.length === 0) {
      _showFailToast(`领料单号${val}暂无明细`)
      return
    }
    // tips:混入uuid
    _data = _data.map((item) => ({ ...item, uuid: uuidv4() }))
    // 根据条码值，查找匹配校验
    // tips:取出这个箱子的所有条码，然后和下面的领料单带出来的列表比对
    let materialBarcodeList = boxMaterialList.value.map((item) => item.barcode)
    // tips:这个可能会匹配多个的情况，所以得使用filter
    let target = _data.filter((item) => materialBarcodeList.includes(item.objnr))
    if (target.length > 0) {
      // tips:保留数据，用追加模式，因为有可能多次扫码
      tableData.value.push(...target)
      staticData.push(...deepClone(target))
      let arrs = [...selection.value.map((item: any) => item.uuid), ...target.map((item) => item.uuid)]
      table.value?.handleSelect(arrs)
      // tips:扫描项置顶操作
      tableData.value = checkItemToTop(tableData.value, target)
    }
  } catch (e) {
    // console.log(e)
  } finally {
    scanLoading.value = false
    barcodeInputRef?.focus()
    nextTick(() => {
      form.value.imBarcode = ''
    })
  }
  // =============已下是扫码匹配的代码，先保留==============
  // // 查找明细中是否存在
  // let target = tableData.value.find((item) => item.barcode === val)
  // if (!target) {
  //   _showFailToast(`来源载具${form.value.boxID}中不存在条码${val}`)
  //   nextTick(() => {
  //     form.value.imBarcode = ''
  //   })
  //   return
  // }
  // // 判断是否已经勾选
  // let _target = selection.value.find((item) => item.barcode === val)
  // if (_target) {
  //   _showFailToast(`条码${val}已勾选，请勿重复扫码`)
  //   nextTick(() => {
  //     form.value.imBarcode = ''
  //   })
  //   return
  // }
  // // 都通过则选中
  // let arrs = [...selection.value, target.uuid]
  // table.value?.handleSelect(arrs)
  // nextTick(() => {
  //   form.value.imBarcode = ''
  // })
}

// 确定过账
const handleConfirm = async () => {
  try {
    // 表单验证
    await formComponent.value?.refForm.validate()
    // 表格必填项验证
    let flag = validateTableSelected(tableColumn, selection.value)
    if (!flag.isPass) {
      _showFailToast(flag.message)
      return
    }
    if (selection.value.length === 0) {
      _showFailToast('请勾选数据')
      return
    }

    if (!selection.value.every((item) => Number(item.erfmg) > 0)) {
      _showFailToast('所提交项中存在数量小于或等于0的项目，请检查')
      return
    }
    // 过账前确认
    await showConfirmDialog({
      title: '提示',
      message: `本次过账共 ${selection.value.length} 条数据,累计拣货数量是: ${computedTotal(
        selection.value,
        'erfmg'
      )},是否确认过账？`
    })
    // 开始过账
    loading.value = true
    // 删除uuid,遍历实现
    let _list: any[] = JSON.parse(JSON.stringify(selection.value))
    _list.forEach((item) => delete item.uuid)
    // tips: 混入箱子和区域信息
    _list = _list.map((item) => ({
      ...item,
      boxID: form.value.boxID,
      targetBoxID: form.value.targetBoxID,
      targetLocationID: form.value.targetLocationID
    }))
    let _data: any = fomrmatShipmentSubmitParams(
      imOclas,
      user.user.account,
      user.user.name,
      form.value.warehouseNo,
      _list,
      'out',
      extraParams.value,
      null,
      'objnr',
      'maktx'
    )
    let res = await WMSAPI.post(passAPIName, _data)
    if (res && res.success) {
      showSuccessToast(res.message as string)
      // 清空表单和列表
      handleClear()
    } else {
      _showFailToast(res.message as string)
    }
    loading.value = false
  } catch (e) {
    console.log(e)
    loading.value = false
  }
}

// 清除按钮
const handleClear = () => {
  tableData.value = []
  tableData.value = []
  barcodeList.value = []
  selectAll.value = false
  selection.value = []
  selectionList.value = []
  form.value = {
    postDate: today
  }
  show.value = false

  boxInputRef?.focus()
}
// 全选
const handleSelectAll = () => {
  table.value?.checkboxGroup.toggleAll(selectAll.value)
}

// 数量输入框的回调事件
const inputNumHandler = (key: string, index: number) => {
  console.log(key, index)
}

// 初始化配置项
async function initConfig() {
  tableColumn.forEach((item) => {
    if (item.type === 'Table/Number') {
      let _erfmgRules: any[] = [
        { required: true, message: '请输入数量', trigger: 'onBlur' },
        { validator: validateErfmg }
      ]

      item.rules = _erfmgRules
    }
  })
  _formList.value.forEach((item) => {
    if (item.prop === 'boxID') {
      item.enter = boxIDEnter
      boxInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
    if (item.prop === 'targetBoxID') {
      item.enter = targetBoxIDEnter
      targetBoxIDInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
    if (item.prop === 'targetLocationID') {
      item.enter = targetLocationIDEnter
      targetLocationIDInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
    if (item.prop === 'imBarcode') {
      item.enter = barcodeEnter
      barcodeInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
  })
}

// 校验规则
function validateErfmg(): any {
  let { key, index } = numBlurParams.value
  // 改变后的值
  let x = Number(tableData.value[index][key])
  // 原始值
  let y = staticData[index][key]
  console.log(y, x)

  if (!x || x < 0) return '数量不能小于等于0'
  if (x > y) return '数量不能大于' + y
  else return true
}

onMounted(() => {
  initConfig()
})
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
