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
  <div v-show="show" class="hideenWrapper">
    <HiddenForm v-model:list="hiddenFormList" />
  </div>
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
  <TableVue ref="table" v-model:table-data="tableData" :tableColumn="tableColumn" v-model:selection="selection" />
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
// 262配料退料WMS
const cachedName = 'shipment.262EmbryoReturnWMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import FormVue from '@/components/Form/index.vue'
import HiddenForm from './components/HiddenForm.vue'
import UserAuth from '@/views/businessComponents/UserAuth.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { formList, showFormList, tableColumn } from './config'
import { ref, watch } from 'vue'
import { MISWMSAPI, WMSAPI } from '@/api/generalAPI'
import { showConfirmDialog, showSuccessToast } from 'vant'
import Dates from '@/utils/datetime'
import { ExtraProps } from '@/typing'
import Loading from '@/components/Loading'
import { v4 as uuidv4 } from 'uuid'
import { GetBoxInfoByBoxId } from '@/api/system/common'
import useStore from '@/store'
import { computedTotal, validateAuthAndSelected } from '@/utils/validateOperateForQty'
import { validateTableSelected } from '@/utils/business'
import { fomrmatShipmentSubmitParams } from '@/utils/formatShipmentBusiness'
import { _showFailToast } from '@/utils/message'

// 过账接口
const passAPIName = '/exportGoodsBusiness/doPostSpefic261'
// 查询表头数据的接口
const listAPINameForHeader = '/exportGoodsBusiness/findList261'
// 查询表体数据的接口
const listAPINameForBody = '/divertBusiness/getValidBarcode'
const imOclas = 'XWMS261P'
const today = new Dates(new Date()).strftime('YYYY-MM-DD')
// 输入框实例
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
// 列表实例
let table = ref<InstanceType<typeof TableVue> | null>(null)
// 控制隐藏区域
const show = ref(false)
const { user } = useStore()
// 表单数据
const form = ref<Record<string, any>>({
  postDate: today
})
// 隐藏区域的数据,这个图号也可以扫多份,因此是一个数组来的
const hiddenFormList = ref<any[]>([])
// 底部过账按钮loaidng
const loading = ref(false)
// 列表数据
const tableData = ref<any[]>([])
// 选中的数据
const selection = ref<any[]>([])
// 控制是否鉴权
const userAuthVisible = ref(true)
// 鉴权的额外参数
const extraParams = ref<ExtraProps | null>(null)
// 是否全选
const selectAll = ref(false)

// 对比选中项长度与数据数组总长度，是否可以勾选全选复选框
watch(
  () => [selection.value.length, tableData.value.length],
  ([val1, val2]) => {
    selectAll.value = val1 === val2 && val1 !== 0
  }
)
// 箱子输入确认事件
const boxEnter = async (val: string) => {
  let res = await GetBoxInfoByBoxId(val)
  if (res.success) {
    // TODO 这里获取箱子数据
    // form.value.locationId = res.locationNo
  } else {
    form.value.wmsTools = ''
    formComponent.value?.formInputRef.wmsTools.inputRef.focus()
    _showFailToast({
      message: res.message
    })
  }
}
formList[0].enter = boxEnter

/**
 * @description: 图纸输入框确定,这里如果没有扫条码的时候可以扫多次，如果扫码这里就不能给扫
 * @param {*} val
 */
const blueprintEnter = (val: string | number | null) => {
  let inputRef = formComponent.value?.formInputRef.pictNum.inputRef
  if (!form.value.pictNum) {
    _showFailToast('请扫图纸号')
    return
  }
  Loading.show()
  if (tableData.value.length <= 0) {
    MISWMSAPI.post(listAPINameForHeader, { imBarcode: val })
      .then((res) => {
        let _data: any = res.data
        // 工厂号
        let werks = Number(_data.title.werks)
        // TODO这里不确定是否图号列表的werks都是一致，如果都是一致的那么这里的代码可以正常执行，如果不是这里就要修改业务逻辑
        if (werks === 3888 || werks <= 0) {
          if (hiddenFormList.value.length <= 1) {
            if (!hiddenFormList.value.find((item: any) => item.barcode === _data.title.barcode)) {
              hiddenFormList.value.push(_data.title)
              show.value = true
              form.value.pictNum = ''
              inputRef?.focus()
            } else {
              _showFailToast('当前图纸号已存在，请勿重复添加')
              form.value.pictNum = ''
              inputRef?.focus()
            }
          } else {
            _showFailToast('当工厂是3888或者小于0时只能扫一条图纸号')
          }
        } else {
          if (!hiddenFormList.value.find((item: any) => item.barcode === _data.title.barcode)) {
            hiddenFormList.value.push(_data.title)
            show.value = true
            form.value.pictNum = ''
            inputRef?.focus()
          } else {
            _showFailToast('当前图纸号已存在，请勿重复添加')
            form.value.pictNum = ''
            inputRef?.focus()
          }
        }
      })
      .finally(() => {
        Loading.hide()
      })
  } else {
    _showFailToast('当前所扫图纸号已扫条码号，不允许再扫图纸号，请清空内容后再扫')
  }
}
formList[1].enter = blueprintEnter

/**
 * @description: 条码输入确定
 * @param {*} val
 */
const barcodeEnter = (val: string | number | null) => {
  let inputRef = formComponent.value?.formInputRef.imBarcode.inputRef
  if (!form.value.imBarcode) {
    _showFailToast('请扫条码号')
    return
  }
  Loading.show()
  MISWMSAPI.post(listAPINameForBody, {
    imBarcode: val,
    imOclas: 'XWMS261P',
    cardNo: extraParams.value?.cardno,
    psnName: extraParams.value?.cardname
  })
    .then((res) => {
      let _data: any = res.data
      if (!tableData.value.find((item: any) => item.matnr === _data.matnr)) {
        // 这里还需要判断物料编码的开头情况，如果不是以407或者40301开头的不允许添加并提示报错
        if (_data.matnr.startsWith('407') || _data.matnr.startsWith('40301')) {
          if (hiddenFormList.value.some((item: any) => item.werks !== _data.werks)) {
            _showFailToast('当前所扫条码的工厂与图纸号不符合，不允许添加')
          } else {
            // 符合条件的放入数组之前先混入uuid
            tableData.value.push({ ..._data, uuid: uuidv4() })
            let selectArr = tableData.value.map((item) => item.uuid)
            // 将数据默认勾选上
            table.value?.handleSelect(selectArr)
          }
        } else {
          _showFailToast('不是407或者40301开头的物料不允许添加')
        }
      } else {
        _showFailToast('当前物料号已存在，请勿重复添加')
        form.value.pictNum = ''
        inputRef?.focus()
      }
    })
    .finally(() => {
      Loading.hide()
    })
}
formList[2].enter = barcodeEnter
// 确定过账
const handleConfirm = async () => {
  if (form.value.imBarcode) {
    await formComponent.value?.refForm.validate()
    await validateAuthAndSelected(extraParams.value, selection.value)
    await validateTableSelected(tableColumn, selection.value)
    if (selection.value.length > 1) {
      // 根据selection去映射一份被选中的数据
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
            result.push({
              ...item,
              warehouseNo: form.value.warehouseNo,
              areaId: form.value.areaId,
              werks: form.value.werks,
              locationId: form.value.locationId,
              wmsTools: form.value.wmsTools
            })
          })
          let _list: any[] = JSON.parse(JSON.stringify(result))
          _list.forEach((item) => delete item.uuid)
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
        message: '单个图纸物料请使用胚料发料功能'
      })
    }
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
  extraParams.value = null
  show.value = false
  let inputRef = formComponent.value?.formInputRef.imBarcode.inputRef
  inputRef.focus()
}
// 全选
const handleSelectAll = () => {
  table.value?.checkboxGroup.toggleAll(selectAll.value)
}
</script>
<style scoped lang="scss">
.loading_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.hideenWrapper {
  max-height: 200px;
  overflow-y: auto;
}
</style>
