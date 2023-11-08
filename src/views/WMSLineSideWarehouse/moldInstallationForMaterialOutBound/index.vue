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
  <TableForSelect
    ref="table"
    v-model:table-data="tableData"
    :tableColumn="formateTableColumn"
    v-model:selection="selection"
    unique-key="index"
    @input-num-handler="inputNumHandler"
    @input-text-handler="inputTextHandler"
  >
    <template #batch="scope">
      <van-field
        v-model="scope.row.batch"
        is-link
        placeholder="请选择"
        :border="false"
        @blur="() => batchEnterHandler(scope)"
        @keyup.enter="() => batchEnterHandler(scope)"
      />
    </template>
    <template #stationNo="scope">
      <van-field
        v-model="scope.row.stationNo"
        is-link
        placeholder="请选择"
        :border="false"
        @blur="() => stationEnterHandler(scope)"
        @keyup.enter="() => stationEnterHandler(scope)"
      />
    </template>
  </TableForSelect>

  <!-- 底部按钮 -->
  <ActionBarVue
    ref="actionBarVue"
    :loading="loading"
    confirmText="过账"
    @clear="handleClear"
    @confirm="handleConfirm"
  />
  <UserAuth v-model:visible="userAuthVisible" v-model:extra="extraParams" />
  <van-popup :close-on-click-overlay="false" v-model:show="showPickerOfBatch" round position="bottom">
    <van-picker
      :columns="batchPopColumn"
      @confirm="(val) => confirHandler(val, 'batch')"
      @cancel="(val) => cancelHandler(val, 'batch')"
    />
  </van-popup>
  <van-popup :close-on-click-overlay="false" v-model:show="showPickerOfStation" round position="bottom">
    <van-picker
      :columns="stationPopColumn"
      @confirm="(val) => confirHandler(val, 'station')"
      @cancel="(val) => cancelHandler(val, 'station')"
    />
  </van-popup>
</template>

<script lang="ts">
// 模装现场物料出库
const cachedName = 'WMSLineSideWarehouse.moldInstallationForMaterialOutBound'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import FormVue from '@/components/Form/index.vue'
import UserAuth from '@/views/businessComponents/UserAuth.vue'
import TableForSelect from '@/components/TableForSelect/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { formList, showFormList, tableColumn } from './config'
import { ref, watch } from 'vue'
import { WMSAPI } from '@/api/generalAPI'
import { showConfirmDialog, showSuccessToast } from 'vant'
import Dates from '@/utils/datetime'
import { FormConfig } from '@/typing'
import Loading from '@/components/Loading'
import { GetUserWarehouse, getmaterialBarcodeInfo } from '@/api/system/common'
import useStore from '@/store'
import useAuth from './hooks/useAuth'
import useField from './hooks/useField'
import { fomrmatShipmentSubmitParams } from '@/utils/formatShipmentBusiness'
import { _showFailToast } from '@/utils/message'
// 过账接口
const passAPIName = 'business/webapi/OutStock'
const imOclas = 'XWMS261P'
const today = new Dates(new Date()).strftime('YYYY-MM-DD')
const tableData = ref<any[]>([])
const { user } = useStore()
const { userAuthVisible, extraParams } = useAuth()
let numBlurParams = ref<any>({ key: 'erfmg', index: 0 })
// 输入框实例
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
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
const {
  batchPopColumn,
  stationPopColumn,
  showPickerOfBatch,
  showPickerOfStation,
  batchEnterHandler,
  stationEnterHandler,
  onComfirmOfStation,
  onConfirmOfBatch,
  projectEnterHandler,
  onCancelOfBatch,
  onCancelOfStation
} = useField()
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
const barcodeEnter = async (val: string | number) => {
  if (!form.value.imBarcode) {
    _showFailToast('请扫条码')
    return
  }
  Loading.show()
  let res = await getmaterialBarcodeInfo(val)
  if (res.success) {
    // Tips 这里额外混入俩个数组用来存放表格每项中产生的生产批和工位选择数据,过账时要剔除这部分数据
    let _data = (res as any).barcodeList.map((item: any, index: number) => ({
      ...item,
      index: index + 1,
      erfmg: item.quantity,
      batchPopColumn: [],
      stationPopColumn: []
    }))
    originTableData = [..._data]
    if (_data.length > 0) {
      tableData.value = _data
    }
    Loading.hide()
  }
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
  if (form.value.imBarcode) {
    formComponent.value?.refForm
      .validate()
      .then(() => {
        if (selection.value.length > 0) {
          let key = getEditableKey()
          // 根据selection去映射一份被选中的数据
          const _selection = tableData.value.filter((item) => selection.value.includes(item.index))
          if (_selection.every((item) => Number(item[key]) > 0)) {
            showConfirmDialog({
              title: '提示',
              message: `本次过账共 ${selection.value.length} 条数据,累计数量是: ${computedTotal(
                _selection
              )},是否确认过账？`
            })
              .then(async () => {
                loading.value = true
                // 处理接口参数
                let _form = Object.assign({}, form.value)
                delete _form.postDate
                // tips 遍历删除index和每项额外混入的数据源
                let result: any[] = []
                _selection.forEach((item: any) => {
                  result.push({ ...item })
                })
                let _list: any[] = JSON.parse(JSON.stringify(result))
                _list.forEach((item) => {
                  delete item.index
                  delete item.batchPopColumn
                  delete item.stationPopColumn
                })
                // 组合参数
                let _data: any = fomrmatShipmentSubmitParams(
                  imOclas,
                  user.user.account,
                  user.user.name,
                  form.value.warehouseNo,
                  _list,
                  'out',
                  extraParams.value
                )
                WMSAPI.post(passAPIName, _data)
                  .then((res) => {
                    if (res && res.success) {
                      showSuccessToast(res.msg)
                      // 清空表单和列表
                      handleClear()
                    } else {
                      _showFailToast({ message: res.message })
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
            _showFailToast({
              message: '所提交项中存在数量小于或等于0的项目，请检查'
            })
          }
        } else {
          _showFailToast('请勾选要过账的数据')
        }
      })
      .catch((e: any) => {
        console.log(e)
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
  selection.value = tableData.value.map((item: any) => item.index)
}
// 计算勾选的累计数量
const computedTotal = (arr: any[]) => {
  console.log(arr)

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

// 文本输入框回调事件
const inputTextHandler = (key: string, index: number) => {
  if (key === 'projectNo') {
    projectEnterHandler(tableData.value[index].projectNo, index, tableData.value)
  }
}

// 弹出层选择事件
const confirHandler = (
  val: { selectedIndexes: number[]; selectedOptions: any[]; selectedValues: string[] },
  key: string
) => {
  if (key === 'batch') {
    onConfirmOfBatch(val.selectedValues[0], tableData.value)
  } else {
    onComfirmOfStation(val.selectedValues[0], tableData.value)
  }
}
// 弹出层取消事件
const cancelHandler = (
  val: { selectedIndexes: number[]; selectedOptions: any[]; selectedValues: string[] },
  key: string
) => {
  if (key === 'batch') {
    onCancelOfBatch(val.selectedValues[0], tableData.value)
  } else {
    onCancelOfStation(val.selectedValues[0], tableData.value)
  }
}
// 得到仓库数据，更新仓库列表
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
