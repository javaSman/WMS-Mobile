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
// 262配料退料
const cachedName = 'shipment.262EmbryoReturn'
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
import { reactive, ref, watch } from 'vue'
import { MISWMSAPI } from '@/api/generalAPI'
import { showConfirmDialog, showSuccessToast } from 'vant'
import Dates from '@/utils/datetime'
import { v4 as uuidv4 } from 'uuid'
import { ExtraProps } from '@/typing'
import Loading from '@/components/Loading'
import { _showFailToast } from '@/utils/message'

const passAPIName = '/exportGoodsBusiness/doPostSpefic261A'
// 查询表头数据的接口
const listAPINameForHeader = '/exportGoodsBusiness/findList261A'
// 查询表体数据的接口
const listAPINameForBody = '/divertBusiness/getValidBarcode'
const today = new Dates(new Date()).strftime('YYYY-MM-DD')
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
// 存储额外的参数对象
let exParams = reactive<any>({})

// 对比选中项长度与数据数组总长度，是否可以勾选全选复选框
watch(
  () => [selection.value.length, tableData.value.length],
  ([val1, val2]) => {
    selectAll.value = val1 === val2 && val1 !== 0
  }
)

/**
 * @description: 条码确认方法，第一步是先加载表头数据，第二次扫码是加载表体数据，同时勾选全部内容
 * @description: 判断加载头部数据还是表体数据，判断机加件是否有值,没有值就加载表头、有就加载表体
 * @param {*} val
 */
const barcodeEnter = (val: string | number | null) => {
  if (!form.value.imBarcode) {
    _showFailToast('请扫条码')
    return
  }
  Loading.show()
  MISWMSAPI.post(
    !computedFormValue() ? listAPINameForHeader : listAPINameForBody,
    !computedFormValue()
      ? { imBarcode: val }
      : {
          imBarcode: val,
          imOclas: 'XWMS261P',
          cardNo: extraParams.value?.cardno,
          psnName: extraParams.value?.cardname
        }
  )
    .then((res) => {
      let _data: any = res.data
      // 如果表头没数据那么久赋值
      if (!computedFormValue()) {
        // form.value.sjpno = _data.title.sjpno
        // form.value.barcode = _data.title.barcode
        // form.value.zzdoex = _data.title.zzdoex
        // 直接将表头内容混入，因为后面加载表体数据还需要用到里面的几个参数，同时要修改bwart的值是261，这个是固定值
        Object.assign(form.value, _data.title)
        // 同时展开隐藏部分内容
        show.value = true
        // 清空输入项并聚焦
        form.value.imBarcode = ''
        let inputRef = formComponent.value?.formInputRef.imBarcode.inputRef
        inputRef.focus()
      } else {
        // 这里的返回值是一个对象，并且要混入上一次加载表头的的数据
        let result = Object.assign(_data, {
          aufnr: form.value.aufnr,
          barcode: form.value.barcode,
          workp: form.value.workp,
          ngeln: form.value.ngeln,
          bwart: '261'
        })
        // 这里还需要判断物料编码的开头情况，如果不是以407或者40301开头的不允许添加并提示报错
        if (result.matnr.startsWith('407') || result.matnr.startsWith('40301')) {
          // 混入一个uuid标识用来勾选数据
          let resultArr = [result].map((item) => ({ ...item, uuid: uuidv4() }))
          // 放入表体
          tableData.value = resultArr
          let selectArr = resultArr.map((item) => item.uuid)
          // 将数据默认勾选上
          table.value?.handleSelect(selectArr)
        } else {
          _showFailToast('不是407或者40301开头的物料不允许添加')
        }
      }
    })
    .finally(() => {
      Loading.hide()
    })
}
formList[0].enter = barcodeEnter
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
            let postDate = _form.postDate
            delete _form.postDate
            // 删除uuid,遍历实现
            let _list: any[] = JSON.parse(JSON.stringify(selection.value))
            _list.forEach((item) => delete item.uuid)
            let _data: any = {
              postDate,
              title: _form,
              data: _list
            }
            // 增加额外的参数
            if (exParams.wmsTools) _data.wmsTools = exParams.wmsTools // 卡板编号
            if (exParams.whid) _data.whid = exParams.whid // 仓库ID
            if (exParams.boxId) _data.boxId = exParams.boxId // 卡板编号
            MISWMSAPI.post(passAPIName, _data)
              .then((res) => {
                if (res && res.success) {
                  showSuccessToast(res.msg)
                  // 清空表单和列表
                  handleClear()
                } else {
                  _showFailToast(res.data as string)
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
// 判断表单中是否存在一项是有值的，如果有代表是要加载表体的，否则是要加载表头数据的
const computedFormValue = () => {
  if (form.value.sjpno || form.value.barcode || form.value.zzdoex) {
    return true
  } else {
    return false
  }
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
