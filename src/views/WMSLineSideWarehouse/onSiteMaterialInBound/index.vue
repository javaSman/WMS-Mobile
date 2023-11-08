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
  />

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
// 262胚料退料WMS
const cachedName = 'WMSLineSideWarehouse.onSiteMaterialInBound'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import FormVue from '@/components/Form/index.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { formList, showFormList, tableColumn } from './config'
import { ref, watch, nextTick } from 'vue'
import Dates from '@/utils/datetime'
import { FormConfig } from '@/typing'
import Loading from '@/components/Loading'
import { deepClone } from '@/utils'
import { GetBoxInfoByBoxId, GetUserWarehouse } from '@/api/system/common'
import { restrictedSequentialInput } from '@/utils/restrictedSequentialInput'
import { _showFailToast } from '@/utils/message'
// 查询表体数据的借口
const today = new Dates(new Date()).strftime('YYYY-MM-DD')
const tableData = ref<any[]>([])
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

// 输入箱子号的事件，自动填写区域
const boxEnter = async (val: string | number) => {
  let res = await GetBoxInfoByBoxId(val as string)
  if (res.success) {
    // TODO 这里获取箱子数据
    form.value.locationId = res.locationNo
    // row.locationId = res.locationNo
  } else {
    _showFailToast({
      message: res.message
    })
  }
}
/**
 * @description: 条码确认事件,加载列表数据
 * @param {*} val
 */
const barcodeEnter = (val: string | number) => {
  // 获取输入框的实例
  let inputRef = formComponent.value?.formInputRef.imBarcode.inputRef
  if (!form.value.imBarcode) {
    _showFailToast('请扫条码')
    return
  }
  Loading.show()
  // TODO 这里没有接口暂时使用假数据模拟
  // TODO 这里原型的要求是要按顺序扫码,扫一条添加一条并且勾选
  restrictedSequentialInput('barcode', val, tableData.value, {
    barcode: val,
    matnr: '07079494848',
    maktx: '测试数据',
    productBatch: '233-21',
    erfmg: 1,
    labelQty: 1
  }).then((res) => {
    tableData.value = res
    originTableData = deepClone(tableData.value)
    nextTick(() => {
      // 默认勾选数据
      let selectArr = tableData.value.map((item) => item.uuid)
      table.value?.handleSelect(selectArr)
    })
    Loading.hide()
  })
  // if (tableData.value.length > 0) {
  //   // 取出表格的最后一项和当前输入的判断是否
  //   const prevBarcode = tableData.value[tableData.value.length - 1].barcode
  //   if (Number(val) - Number(prevBarcode) === 1) {
  //     tableData.value.push({
  //       index: tableData.value.length + 1,
  //       barcode: val,
  //       matnr: '07079494848',
  //       maktx: '测试数据',
  //       productBatch: '233-21',
  //       erfmg: 1,
  //       labelQty: 1
  //     })
  //     Loading.hide()
  //   } else {
  //     Loading.hide()
  //     _showFailToast({message: '请按条码顺序输入'})
  //   }
  // } else {
  //   tableData.value.push({
  //     index: 1,
  //     barcode: val,
  //     matnr: '07079494848',
  //     maktx: '测试数据',
  //     productBatch: '233-21',
  //     erfmg: 1,
  //     labelQty: 1
  //   })
  //   Loading.hide()
  // }
  // WMSAPI.get(listAPIName, {
  //   imOclas: imOclas,
  //   imBarcode: val
  // })
  //   .then((res) => {
  //     let _data: any[] = res.data as any[]
  //     // 混入唯一值，用于勾选数据
  //     tableData.value = _data.map((item) => ({ ...item, uuid: uuidv4() }))
  //     // 深拷贝保留一份副本
  //     originTableData = deepClone(tableData.value)
  //     // nextTick(() => {
  //     //   // 默认勾选数据
  //     //   let selectArr = tableData.value.map((item) => item.uuid)
  //     //   table.value?.handleSelect(selectArr)
  //     // })
  //   })
  //   .finally(() => {
  //     Loading.hide()
  //   })
}
_formList.value[1].enter = boxEnter
_formList.value[2].enter = barcodeEnter
// 确定过账
const handleConfirm = () => {
  _showFailToast({ message: '当前没有接口' })
  // if (form.value.imBarcode) {
  //   formComponent.value?.refForm.validate().then(() => {
  //     if (selection.value.length > 0) {
  //       let key = getEditableKey()
  //       if (selection.value.every((item) => Number(item[key]) > 0)) {
  //         showConfirmDialog({
  //           title: '提示',
  //           message: `本次过账共 ${selection.value.length} 条数据,累计数量是: ${computedTotal(selection.value)},是否确认过账？`
  //         })
  //           .then(async () => {
  //             loading.value = true
  //             // 处理接口参数
  //             let _form = Object.assign({}, form.value)
  //             let postDate = _form.postDate
  //             delete _form.postDate
  //             // 删除uuid,遍历实现,同时把箱子和区域信息混入
  //             let result:any[] = []
  //             selection.value.forEach((item:any) => {
  //               result.push({...item, wmsTools: form.value.wmsTools, locationId: form.value.locationId})
  //             })
  //             let _list: any[] = JSON.parse(JSON.stringify(result))
  //             _list.forEach((item) => delete item.uuid)
  //             let _data: any = {
  //               IM_OCLAS: imOclas,
  //               IM_CARDNO: user.user.account,
  //               IM_CARDNAME: user.user.name,
  //               warehouseNo: form.value.warehouseNo,
  //               wmsPostInList: postTransferPramamsForWmsInPostIn(_list, imOclas),
  //               zxstXmbeStruList: _list
  //             }
  //             WMSAPI.post(passAPIName, _data)
  //               .then((res) => {
  //                 if (res && res.success) {
  //                   showSuccessToast(res.msg)
  //                   // 清空表单和列表
  //                   handleClear()
  //                 } else {
  //                   _showFailToast({message: res.message})
  //                 }
  //               })
  //               .finally(() => {
  //                 loading.value = false
  //               })
  //           })
  //           .catch(() => {
  //             // on cancel
  //           })
  //       } else {
  //         _showFailToast({
  //           message: '所提交项中存在数量小于或等于0的项目，请检查'
  //         })
  //       }
  //     } else {
  //       _showFailToast('请勾选要过账的数据')
  //     }
  //   }).catch((e:any) => {
  //     console.log(e)
  //   })
  // } else {
  //   _showFailToast({message: '请输入条码号'})
  // }
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
