<template>
  <!-- 表单布局 -->
  <van-cell-group>
    <van-cell title-class="toggleFormCellTitle" style="padding-left: 0; padding-right: 0; border-radius: 0">
      <template #title v-if="showFormList.length > 0">
        <van-icon :name="show ? 'arrow-down' : 'arrow'" @click="show = !show" />
      </template>
      <template #value>
        <FormVue ref="formComponent" v-model:formData="form" :formList="formList" />
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
  />
  <!-- 底部按钮 -->
  <ActionBarVue
    ref="actionBarVue"
    :loading="loading"
    confirmText="过账"
    @clear="handleClear"
    @confirm="handleConfirm"
  />
  <!-- 调用扫条码时的loading效果，同时阻止用户继续操作 -->
  <van-overlay :show="scanLoading">
    <div class="loading_wrapper" @click.stop>
      <van-loading color="#ffffff" type="spinner">数据加载中</van-loading>
    </div>
  </van-overlay>
  <UserAuth v-model:visible="userAuthVisible" v-model:extra="extraParams" />
</template>

<script lang="ts">
// 261发料-胚料发料WMS
const cachedName = 'shipment.261EmbryoIssuanceWMS'
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
import { ref, watch } from 'vue'
import { WMSAPI } from '@/api/generalAPI'
import { showConfirmDialog, showSuccessToast } from 'vant'
import Dates from '@/utils/datetime'
import { v4 as uuidv4 } from 'uuid'
import { GetBoxInfoByBoxId, getmaterialBarcodeInfo } from '@/api/system/common'
import Loading from '@/components/Loading'
import deepClone from '@/utils/deepClone'
import useAuth from './hooks/useAuth'
import useStore from '@/store'
import { fomrmatShipmentSubmitParams } from '@/utils/formatShipmentBusiness'
import { _showFailToast } from '@/utils/message'

const passAPIName = 'business/webapi/OutStock'
// 查询表体数据的接口
const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const imOclas = 'XWMS261P'
const today = new Dates(new Date()).strftime('YYYY-MM-DD')
// 输入框实例
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
// 列表实例
let table = ref<InstanceType<typeof TableVue> | null>(null)
const { userAuthVisible, extraParams } = useAuth()
// 控制隐藏区域
const show = ref(false)
// 表单数据
const form = ref<Record<string, any>>({
  postDate: today
})
let numBlurParams = ref<any>({ key: 'erfmg', index: 0 })
// 条码扫码loading
const scanLoading = ref(false)
// 底部过账按钮loaidng
const loading = ref(false)
// 列表数据
const tableData = ref<any[]>([])
// 选中的数据
const selection = ref<any[]>([])
// 保留一份原始对象,用于校验数量的变更
let originTableData: any[] = []
// 是否全选
const selectAll = ref(false)

const { user } = useStore()
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
const boxEnter = async (val: string | number | null) => {
  let res = await GetBoxInfoByBoxId(val as string)
  if (res.success) {
    // TODO 这里获取箱子数据
    console.log(res)
  } else {
    form.value.wmsTools = ''
    formComponent.value?.formInputRef.wmsTools.inputRef.focus()
    _showFailToast({
      message: res.message
    })
  }
}
/**
 * @description: 条码确认方法，第一步是先加载表头数据，第二次扫码是加载表体数据，同时勾选全部内容
 * @description: 判断加载头部数据还是表体数据，判断机加件是否有值,没有值就加载表头、有就加载表体
 * @param {*} val
 */
const barcodeEnter = async (val: string | number | null) => {
  if (!form.value.imBarcode) {
    _showFailToast('请扫条码')
    return
  }
  // 如果列表没有说明要调用根据条码获取条码信息的接口
  if (!form.value.materialNo) {
    // 第一步先根据条码去加载条码信息
    let res = await getmaterialBarcodeInfo(val)
    if (res.success) {
      // TODO 这里加载的是一个数组来的，推测是因为接口可以传入多个条码，这里只能扫一个条码
      if (res.barcodeList.length > 0) {
        form.value = res.barcodeList[0]
      }
    }
  } else {
    // 否则调用spa接口获取列表信息
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
        } else {
          _showFailToast({ message: res.message })
        }
      })
      .finally(() => {
        Loading.hide()
      })
  }
  // 第二步根据单号去获取sap数据
}
formList[0].enter = boxEnter
formList[1].enter = barcodeEnter
// 获取可编辑项的prop
// 取出tableColumn中类型是Table/Number的项目的prop，因为这个才是可以编辑的项
const getEditableKey = () => {
  let tarItem = tableColumn.find((item) => item.type === 'Table/Number')
  let key = tarItem ? tarItem.prop : 'erfmg'
  return key
}
// 确定过账
const handleConfirm = () => {
  // 构造参数,循环混入额外参数
  if (extraParams.value) {
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
            _list.forEach((item) => delete item.uuid)
            // tips:混入箱子信息
            _list = _list.map((item) => ({ ...item, wmsTools: form.value.wmsTools }))
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
</script>
<style scoped lang="scss">
.loading_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
