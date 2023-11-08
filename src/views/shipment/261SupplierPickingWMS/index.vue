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
        <van-checkbox v-model="selectAll" shape="square" @click="handleSelectAll">全选</van-checkbox>
      </van-grid-item>
    </van-grid>
  </van-sticky>
  <!-- 列表 -->
  <TableVue
    ref="table"
    v-model:table-data="tableData"
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
  <UserAuth v-model:visible="userAuthVisible" v-model:extra="extraParams" />
</template>

<script lang="ts">
// 261供应商领料-WMS
const cachedName = 'shipment.261SupplierPickingWMS'
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
import { nextTick, onMounted, ref, watch } from 'vue'
import { WMSAPI } from '@/api/generalAPI'
import { showConfirmDialog, showSuccessToast, FieldInstance } from 'vant'
import Dates from '@/utils/datetime'
import { v4 as uuidv4 } from 'uuid'
import Loading from '@/components/Loading'
import { deepClone } from '@/utils'
import { checkItemToTop, validateTableSelected } from '@/utils/business'
import useAuth from './hooks/useAuth'
import { GetBoxInfoByBoxId, GetUserWarehouse } from '@/api/system/common'
import useStore from '@/store'
import { fomrmatShipmentSubmitParams } from '@/utils/formatShipmentBusiness'
import { FormConfig } from '@/typing'
import { _showFailToast } from '@/utils/message'
// import testData from '@/views/testData'

// TODO 两个接口地址变更一次
const passAPIName = 'business/webapi/OutStock'
// 查询表体数据的接口
const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const imOclas = 'XWMS261W'
const today = new Dates(new Date()).strftime('YYYY-MM-DD')
const { userAuthVisible, extraParams } = useAuth()
const tableData = ref<any[]>([])
const { user } = useStore()
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
// 底部过账按钮loading
const loading = ref(false)
// 保留一份原始对象,用于校验数量的变更
let originTableData: any[] = []
// 选中的数据
const selection = ref<any[]>([])
// 是否全选
const selectAll = ref(false)

let boxInputRef: FieldInstance | null = null
let barcodeInputRef: FieldInstance | null = null
let _formList = ref<FormConfig[]>(JSON.parse(JSON.stringify(formList)))
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

/**
 * 箱子号回车
 * @param val 箱子号
 */
const boxIDEnter = (val: string | null) => {
  if (!val) return
  GetBoxInfoByBoxId(val)
    .then((res: any) => {
      // console.log(res)
      // 判断箱子号是否存在
      if (!res.success) {
        _showFailToast(res.message as string)
      }
    })
    .finally(() => {
      barcodeInputRef?.focus()
    })
}

/**
 * @description: 条码确认事件,加载列表数据
 * @param {*} val
 */
const barcodeEnter = (val: string | number | null) => {
  if (!form.value.imBarcode) {
    _showFailToast('请扫条码')
    return
  }

  // 扫码匹配
  if (tableData.value.length > 0) {
    let target = tableData.value.find((item) => item.objnr === val)
    // 不存在列表中时
    if (!target) {
      _showFailToast('没有找到结果，请检查重试或清除结果后重新扫码')
      nextTick(() => {
        form.value.imBarcode = ''
      })
      return
    }
    // 判断是否已经勾选
    let _target = selection.value.find((item) => item.objnr === val)
    if (_target) {
      _showFailToast(`条码${val}已勾选，请勿重复扫码`)
      nextTick(() => {
        form.value.imBarcode = ''
      })
      return
    }
    // 都通过则选中
    let arrs = [...selection.value.map((item: any) => item.uuid), target.uuid]
    table.value?.handleSelect(arrs)
    // tips: 这里需要更改这个被选中的项在数组中的位置，把它置顶
    tableData.value = checkItemToTop(tableData.value, target)
    nextTick(() => {
      form.value.imBarcode = ''
    })
    return
  }
  // 没有明细则调用接口
  Loading.show()
  WMSAPI.get(listAPIName, { imOclas: imOclas, imBarcode: val })
    .then((res) => {
      if (res.success) {
        let _data: any[] = res.data as any[]
        // let _data = testData.data as any[]
        // 混入唯一值，用于勾选数据
        _data.forEach((item) => (item.uuid = uuidv4()))
        tableData.value = _data
        // 深拷贝保留一份副本
        originTableData = deepClone(tableData.value)
      } else {
        _showFailToast(res.message as string)
      }
    })
    .finally(() => {
      Loading.hide()
      nextTick(() => {
        form.value.imBarcode = ''
      })
    })
}

// 获取可编辑项的prop
// 取出tableColumn中类型是Table/Number的项目的prop，因为这个才是可以编辑的项
const getEditableKey = () => {
  let tarItem = tableColumn.find((item) => item.type === 'Table/Number')
  let key = tarItem ? tarItem.prop : 'erfmg'
  return key
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

    let key = getEditableKey()
    if (key && !selection.value.every((item) => Number(item[key]) > 0)) {
      _showFailToast('所提交项中存在数量小于或等于0的项目，请检查')
      return
    }
    // 过账前确认
    await showConfirmDialog({
      title: '提示',
      message: `本次过账共 ${selection.value.length} 条数据,累计拣货数量是: ${computedTotal(
        selection.value
      )},是否确认过账？`
    })
    // 开始过账
    loading.value = true
    // 删除uuid,遍历实现
    let _list: any[] = JSON.parse(JSON.stringify(selection.value))
    _list.forEach((item) => delete item.uuid)
    // tips:混入箱子信息
    _list = _list.map((item) => ({ ...item, wmsTools: form.value.boxID }))
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

    // 表单验证完后，若有自定义方法，则执行
    let res = await WMSAPI.post(passAPIName, _data)

    if (res && res.success) {
      showSuccessToast((res.message as string) || '过账成功')
      // 清空表单和列表
      handleClear()
    } else {
      _showFailToast(res.message as string)
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

// 初始化配置项
function initConfig() {
  tableColumn.forEach((item) => {
    if (item.type === 'Table/NumberInput') {
      let _erfmgRules: any[] = [
        { required: true, message: '请输入数量', trigger: 'onBlur' },
        { validator: validateFunc }
      ]
      item.rules = _erfmgRules
    }
  })
  _formList.value.forEach((item) => {
    if (item.prop === 'boxID') {
      item.enter = (val: string | null) => boxIDEnter(val)
      boxInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
    if (item.prop === 'imBarcode') {
      item.enter = barcodeEnter
      barcodeInputRef = formComponent.value?.formInputRef[item.prop].inputRef
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
  boxInputRef?.focus()
}
// 全选
const handleSelectAll = () => {
  table.value?.checkboxGroup.toggleAll(selectAll.value)
}
// 计算勾选的累计数量
const computedTotal = (arr: any[]) => {
  let key = getEditableKey()
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
// TODO 这部分先写死一个工号获取仓库数据
const getWareHouseListAndUpdate = async () => {
  let res = await GetUserWarehouse()
  if (res.success) {
    _formList.value[0].options = res.datas
  }
}

onMounted(() => {
  initConfig()
})
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
