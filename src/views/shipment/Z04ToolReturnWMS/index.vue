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
  >
    <!-- 针对箱子号一行个性化设计，使其可以调用接口校验并动态赋值修改区域 -->
    <template #wmsTools="inputProps">
      <van-field
        v-model="tableData[inputProps.index][inputProps.item.prop]"
        clearable
        clear-trigger="always"
        @keyup.enter="wmsToolsEnter(inputProps)"
      />
    </template>
    <template #locationId="inputProps">
      <van-field v-model="tableData[inputProps.index][inputProps.item.prop]" clearable clear-trigger="always" />
    </template>
  </TableVue>
  <!-- 底部按钮 -->
  <ActionBarVue
    ref="actionBarVue"
    :loading="loading"
    confirmText="过账"
    @clear="handleClear"
    @confirm="handleConfirm"
  />
</template>

<script lang="ts">
// 202部门退料WMS
const cachedName = 'shipment.Z04ToolReturnWMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import FormVue from '@/components/Form/index.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { formList, showFormList, tableColumn } from './config'
import { ref, watch } from 'vue'
import { WMSAPI } from '@/api/generalAPI'
import { showConfirmDialog, showSuccessToast } from 'vant'
import Dates from '@/utils/datetime'
import { v4 as uuidv4 } from 'uuid'
import Loading from '@/components/Loading'
// import { deepClone } from '@/utils'
import { GetBoxInfoByBoxId, GetUserWarehouse } from '@/api/system/common'
import { FormConfig } from '@/typing'
import useStore from '@/store'
import { fomrmatShipmentSubmitParams } from '@/utils/formatShipmentBusiness'
import { _showFailToast } from '@/utils/message'

const passAPIName = 'business/webapi/PostIn'
// 查询表体数据的借口
const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const imOclas = 'XWMSZ04'
const today = new Dates(new Date()).strftime('YYYY-MM-DD')
const tableData = ref<any[]>([])
// let numBlurParams = ref<any>({ key: 'erfmg', index: 0 })
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
const { user } = useStore()
// 底部过账按钮loading
const loading = ref(false)
// 保留一份原始对象,用于校验数量的变更
// let originTableData: any[] = []
// 选中的数据
const selection = ref<any[]>([])
// 是否全选
const selectAll = ref(false)
let _formList = ref<FormConfig[]>(JSON.parse(JSON.stringify(formList)))

// 对比选中项长度与数据数组总长度，是否可以勾选全选复选框
watch(
  () => [selection.value.length, tableData.value.length],
  ([val1, val2]) => {
    selectAll.value = val1 === val2 && val1 !== 0
  }
)
// 具体校验函数
// const validateFunc = () => {
//   let { key, index } = numBlurParams.value
//   // 改变后的值
//   let x = Number(tableData.value[index][key])
//   // 原始值
//   let y = originTableData[index][key]
//   if (!x || x < 0) return '数量不能小于等于0'
//   if (x > y) return '数量不能大于' + y
//   else return true
// }
// 特殊处理一下数据适配数量编辑的校验
const formateTableColumn: any[] = tableColumn.map((item) => {
  return item
  // if (item.prop === 'erfmg' || item.type === 'Table/Number') {
  //   return {
  //     ...item,
  //     rules: [{ required: true, message: '请输入数量', trigger: 'onBlur' }, { validator: validateFunc }]
  //   }
  // } else {
  //   return item
  // }
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
        // TODO 这里现在是手工勾选了
        let _data: any[] = res.data as any[]
        tableData.value = _data.map((item) => ({ ...item, uuid: uuidv4(), boxID: '', locationID: '' }))
        // 混入唯一值，用于勾选数据
        // TODO 这里额外混入boxID和locationID,因为目前不知道这两个字段从何处来
        // 深拷贝保留一份副本
        // originTableData = deepClone(tableData.value)
        // nextTick(() => {
        //   // 默认勾选数据
        //   let selectArr = tableData.value.map((item) => item.uuid)
        //   table.value?.handleSelect(selectArr)
        // })
      } else {
        _showFailToast(res.message as string)
      }
    })
    .finally(() => {
      Loading.hide()
    })
}
_formList.value[1].enter = barcodeEnter

// 获取可编辑项的prop
// 取出tableColumn中类型是Table/Number的项目的prop，因为这个才是可以编辑的项
const getEditableKey = () => {
  let tarItem = tableColumn.find((item) => item.type === 'Table/Number')
  let key = tarItem ? tarItem.prop : 'erfmg'
  return key
}
// 确定过账
const handleConfirm = () => {
  // // 构造参数,循环混入额外参数
  if (selection.value.length > 0) {
    let key = getEditableKey()
    if (selection.value.every((item) => Number(item[key]) > 0)) {
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
          // 删除uuid,遍历实现
          let _list: any[] = JSON.parse(JSON.stringify(selection.value))
          _list.forEach((item) => {
            // 删除uuid
            delete item.uuid
            // tips: 这里特殊处理一下barcode,需求描述说要将这两个拼接起来给barcode
            item.barcode = item.reqno + item.rspos
          })
          let _data: any = fomrmatShipmentSubmitParams(
            imOclas,
            user.user.account,
            user.user.name,
            form.value.warehouseNo,
            _list,
            'in'
          )
          if (selection.value.length === tableData.value.length) {
            WMSAPI.post(passAPIName, _data)
              .then((res) => {
                if (res && res.success) {
                  showSuccessToast(res.message || '过账成功')
                  // 清空表单和列表
                  handleClear()
                } else {
                  _showFailToast({ message: res.message })
                }
              })
              .finally(() => {
                loading.value = false
              })
          } else {
            _showFailToast({
              message: '必须全部勾选才能过账'
            })
          }
        })
        .catch(() => {
          // on cancel
        })
    } else {
      _showFailToast({
        message: '所提交项中存在数量小于或等于0的项目，请检查'
      })
    }
  } else {
    _showFailToast('请勾选要过账的数据')
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

// boxIDBlur行编辑后获取接口数据
// TODO 这里的接口可能是错的，需要重新弄过，但是可以先用来测试功能
const wmsToolsEnter = async (props: any) => {
  const { row } = props
  let res = await GetBoxInfoByBoxId(row.wmsTools)
  if (res.success) {
    // TODO 这里获取箱子数据
    row.locationId = res.locationNo
  } else {
    _showFailToast({
      message: res.message
    })
  }
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
</script>
<style scoped lang="scss">
.loading_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
