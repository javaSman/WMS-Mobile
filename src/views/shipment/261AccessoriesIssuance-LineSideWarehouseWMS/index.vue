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
    :tableColumn="formateTableColumn"
    v-model:selection="selection"
    @input-num-handler="inputNumHandler"
    @clickHandler="handlePartList"
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
  <!-- 配件清单对话框 -->
  <TableDialogVue
    v-model:visible="dataMap.visible"
    :tableData="dataMap.partList"
    :tableColumn="dataMap.partListTableColumn"
  />
</template>

<script lang="ts">
// 262胚料退料WMS
const cachedName = 'shipment.261AccessoriesIssuance-LineSideWarehouseWMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import TableDialogVue from '@/views/businessComponents/TableDialog.vue'
import FormVue from '@/components/Form/index.vue'
import UserAuth from '@/views/businessComponents/UserAuth.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { formList, showFormList, tableColumn } from './config'
import { ref, watch, reactive, nextTick } from 'vue'
import { WMSAPI } from '@/api/generalAPI'
import { showConfirmDialog, showSuccessToast } from 'vant'
import Dates from '@/utils/datetime'
import { v4 as uuidv4 } from 'uuid'
import { FormConfig, ITableBtnParams, TableColumn } from '@/typing'
import Loading from '@/components/Loading'
import { deepClone } from '@/utils'
import useAuth from './hooks/useAuth'
import { GetBoxInfoByBoxId, GetUserWarehouse } from '@/api/system/common'
import useStore from '@/store'
import { getPartList, partListTableColumn } from '@/views/mixins/PartList'
import { validateAuthAndSelected } from '@/utils/validateOperateForQty'
import { validateTableSelected } from '@/utils/business'
import { fomrmatShipmentSubmitParams } from '@/utils/formatShipmentBusiness'
import { _showFailToast } from '@/utils/message'
const passAPIName = 'business/webapi/PostIn'
// 查询表体数据的借口
const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const imOclas = 'XWMS261D'
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
let _formList = ref<FormConfig[]>(JSON.parse(JSON.stringify(formList)))
// 底部过账按钮loading
const loading = ref(false)
// 保留一份原始对象,用于校验数量的变更
let originTableData: any[] = []
// 选中的数据
const selection = ref<any[]>([])
// 是否全选
const selectAll = ref(false)

let dataMap = reactive({
  tableColumn,
  partList: [] as any[],
  partListTableColumn: JSON.parse(JSON.stringify(partListTableColumn)),
  visible: false
})
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
/**
 * @description: 条码确认事件,加载列表数据
 * @param {*} val
 */
const barcodeEnter = (val: string | number | null) => {
  if (!form.value.imBarcode) {
    _showFailToast('请扫条码')
    return
  }
  Loading.show()
  WMSAPI.get(listAPIName, {
    imOclas: imOclas,
    imBarcode: val
  })
    .then((res) => {
      if (res.success) {
        let _data: any[] = res.data as any[]
        // 混入唯一值，用于勾选数据
        tableData.value = _data.map((item) => ({ ...item, uuid: uuidv4() }))
        // 深拷贝保留一份副本
        originTableData = deepClone(tableData.value)
        nextTick(() => {
          // 默认勾选数据
          let selectArr = tableData.value.map((item) => item.uuid)
          table.value?.handleSelect(selectArr)
        })
      } else {
        _showFailToast({ message: res.message as string })
      }
    })
    .finally(() => {
      Loading.hide()
    })
}
// 箱子输入确认事件
const boxEnter = async (val: string) => {
  let res = await GetBoxInfoByBoxId(val)
  if (res.success) {
    // 成功就自动聚焦到条码
    formComponent.value?.formInputRef?.imBarcode.inputRef.focus()
  } else {
    form.value.wmsTools = ''
    let inputRef = formComponent.value?.formInputRef?.wmsTools.inputRef
    inputRef.focus()
    _showFailToast({
      message: res.message
    })
  }
}
_formList.value[2].enter = barcodeEnter
_formList.value[1].enter = boxEnter
// 获取可编辑项的prop
// 取出tableColumn中类型是Table/Number的项目的prop，因为这个才是可以编辑的项
const getEditableKey = () => {
  let tarItem = tableColumn.find((item) => item.type === 'Table/Number')
  let key = tarItem ? tarItem.prop : 'erfmg'
  return key
}
// 确定过账
const handleConfirm = async () => {
  let key = getEditableKey()
  await formComponent.value?.refForm.validate()
  await validateAuthAndSelected(extraParams.value, selection.value)
  await validateTableSelected(tableColumn, selection.value)
  if (form.value.imBarcode) {
    showConfirmDialog({
      title: '提示',
      message: `本次过账共 ${selection.value.length} 条数据,累计数量是: ${computedTotal(
        selection.value
      )},是否确认过账？`
    })
      .then(async () => {
        loading.value = true
        // 处理接口参数
        let _form = Object.assign({}, form.value)
        delete _form.postDate
        // 删除uuid,遍历实现,同时把箱子和区域信息混入
        let result: any[] = []
        selection.value.forEach((item: any) => {
          result.push({ ...item, wmsTools: form.value.wmsTools, locationId: form.value.locationId })
        })
        let _list: any[] = JSON.parse(JSON.stringify(result))
        _list.forEach((item) => delete item.uuid)
        let _data: any = fomrmatShipmentSubmitParams(
          imOclas,
          user.user.account,
          user.user.name,
          form.value.warehouseNo,
          _list,
          'in',
          extraParams.value
        )
        WMSAPI.post(passAPIName, _data)
          .then((res) => {
            if (res && res.success) {
              showSuccessToast(res.msg)
              // 清空表单和列表
              handleClear()
            } else {
              _showFailToast({ message: res.message as string })
            }
          })
          .finally(() => {
            loading.value = false
          })
      })
      .catch(() => {
        // on cancel
      })
  } else {
    _showFailToast({ message: '请输入条码号' })
  }
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

getWareHouseListAndUpdate()
// 按钮-配件清单
function handlePartList(key: string, data: any, index: number) {
  let tableBtnParams = (dataMap.tableColumn[2] as TableColumn).tableBtnParams as ITableBtnParams
  getPartList(key, data, index, dataMap, tableBtnParams)
}
</script>
<style scoped lang="scss">
.loading_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
