<template>
  <div>
    <!-- 表单布局 -->
    <van-cell-group>
      <van-cell title-class="toggleFormCellTitle" style="padding-left: 0; padding-right: 0; border-radius: 0">
        <template #title v-if="showFormList.length > 0">
          <van-icon :name="dataMap.show ? 'arrow-down' : 'arrow'" @click="dataMap.show = !dataMap.show" />
        </template>
        <template #value>
          <FormVue ref="formComponent" v-model:formData="dataMap.form" :formList="dataMap.formList" />
        </template>
      </van-cell>
    </van-cell-group>
    <!-- 隐藏字段布局 -->
    <van-cell-group v-show="dataMap.show" :style="showFormList.length > 0 ? 'padding-left: 20px' : ''">
      <FormVue ref="showFormComponent" v-model:formData="dataMap.form" :formList="showFormList" />
    </van-cell-group>
    <!-- 列表信息总览 -->
    <van-sticky :offset-top="46">
      <van-grid
        direction="horizontal"
        :column-num="4"
        :border="false"
        style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc"
      >
        <van-grid-item>总数：{{ dataMap.list.length }}</van-grid-item>
        <van-grid-item>已确认：{{ dataMap.selectedList.length }}</van-grid-item>
        <van-grid-item>剩余数：{{ dataMap.list.length - dataMap.selectedList.length }}</van-grid-item>
        <van-grid-item>
          <van-checkbox
            v-model="dataMap.selectAll"
            :disabled="dataMap.chkDisabled"
            shape="square"
            @click="handleSelectAll"
          >
            全选
          </van-checkbox>
        </van-grid-item>
      </van-grid>
    </van-sticky>

    <!-- 列表 -->
    <TableVue
      ref="table"
      v-model:table-data="dataMap.list"
      :tableColumn="tableColumn"
      v-model:selection="dataMap.selectedList"
      @inputTextHandler="inputTextHandler"
      @clickHandler="handlePartList"
      :disabled-chk="true"
    />
    <!-- 底部按钮 -->
    <ActionBarVue
      ref="actionBarVue"
      :loading="dataMap.loading"
      confirmText="过账"
      @clear="handleClear"
      @confirm="handleConfirm"
    />
    <!-- 调用扫条码时的loading效果，同时阻止用户继续操作 -->
    <van-overlay :show="dataMap.scanLoading">
      <div class="loading_wrapper" @click.stop>
        <van-loading color="#ffffff" type="spinner">数据加载中</van-loading>
      </div>
    </van-overlay>
    <!-- 配件清单对话框 -->
    <TableDialogVue
      v-model:visible="dataMap.visible"
      :tableData="dataMap.partList"
      :tableColumn="dataMap.partListTableColumn"
    />
  </div>
</template>

<script lang="ts" setup name="transfer.crossRegionalReception-WMS">
// 跨区域接收-WMS
import TableDialogVue from '@/views/businessComponents/TableDialog.vue'
import { formList, showFormList, tableColumn } from './config'
import { ref, watch, reactive, onMounted } from 'vue'
import FormVue from '@/components/Form/index.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { WMSAPI } from '@/api/generalAPI'
import { showSuccessToast, showConfirmDialog, FieldInstance } from 'vant'
import Dates from '@/utils/datetime'
import { validateTableSelected } from '@/utils/business'
import { v4 as uuidv4 } from 'uuid'
import useStore from '@/store'
import { GetUserWarehouse, GetBoxInfoByBoxId } from '@/api/system/common'
import { fomrmatShipmentSubmitParams } from '@/utils/formatShipmentBusiness'
// import testData from '@/views/testData'
import { getPartList, partListTableColumn } from '@/views/mixins/PartList'
import { ITableBtnParams, TableColumn } from '@/typing'
import { _showFailToast } from '@/utils/message'
const passAPIName = 'business/webapi/OutStock'
const listAPIName = 'business/webapi/ZxwmsXmbeCommonListMrp'
const imOclas = 'XWMSLFSTA'

let table = ref<InstanceType<typeof TableVue> | null>(null)
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)
let { user } = useStore()
const today = new Dates(new Date()).strftime('YYYY-MM-DD')

let dataMap = reactive({
  formList,
  showFormList,
  tableColumn,
  form: {
    postDate: today
  } as any,
  show: false, // 点击左侧箭头是否展开
  selectAll: false, // 是否全选
  selectedList: [] as any[], // 选中项集合
  list: [] as any[], // 列表数据
  outBoxIDList: [] as any[], // 箱子号物料集合
  loading: false, // 过账按钮loading
  wareHouseList: [] as any[], // 用于存储仓库列表
  chkDisabled: true, // 是否禁用复选框
  scanLoading: false,
  partList: [] as any[],
  partListTableColumn: JSON.parse(JSON.stringify(partListTableColumn)),
  visible: false
})

let targetBoxIDInputRef: FieldInstance | null = null
let areaInputRef: FieldInstance | null = null
let barcodeInputRef: FieldInstance | null = null

// 对比选中项长度与数据数组总长度，是否可以勾选全选复选框
watch(
  () => [dataMap.selectedList.length, dataMap.list.length],
  ([val1, val2]) => {
    dataMap.selectAll = val1 === val2 && val1 !== 0
  }
)
/** 全选和反选 */
const handleSelectAll = () => {
  table.value?.checkboxGroup.toggleAll(dataMap.selectAll)
}

/** 根据用户工号获取仓库列表 */
async function getUserWarehouse() {
  try {
    let res = await GetUserWarehouse()
    if (res.success) {
      dataMap.wareHouseList = res.datas as any[]
    } else {
      _showFailToast(res.message as string)
    }
  } catch (e) {
    console.log(e)
  }
}

/** 仓库change */
function wareHouseChange(val: string | null) {
  if (!val) return
  targetBoxIDInputRef?.focus()
}

/** 转入箱子号回车，带出转入区域 */
function targetBoxIDEnter(val: string | null) {
  if (!val) return
  // 调用接口带出区域，如果区域有值，光标跳转到条码，没有跳转到区域
  GetBoxInfoByBoxId(val)
    .then((res: any) => {
      // console.log(res)
      if (res.success) {
        dataMap.form.targetLocationID = res.locationNo as string
        // 跳转到转出箱子
        barcodeInputRef?.focus()
      } else {
        _showFailToast(res.message as string)
        areaInputRef?.focus()
      }
    })
    .catch(() => {
      areaInputRef?.focus()
    })
}

/** 区域回车 */
function areaEnter(val: string | null) {
  if (!val) return
  barcodeInputRef?.focus()
}

/** 表格内转出箱子号回车，带出转出区域 */
function boxIDEnter(val: string | null, index: number) {
  if (!val) return
  // 调用接口带出区域，如果区域有值，光标跳转到条码，没有跳转到区域
  GetBoxInfoByBoxId(val)
    .then((res: any) => {
      // console.log(res)
      if (res.success) {
        dataMap.list[index].locationID = res.locationNo as string
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
 * @description: 条码回车事件，匹配勾选
 * @param {*} val 条码值
 */
function barcodeEnter(val: string | null) {
  if (!val) {
    _showFailToast('请输入条码')
    return
  }
  // 页面有明细，不允许再次扫码
  if (dataMap.list.length > 0) {
    _showFailToast('请清空页面或过账后再扫码')
    return
  }

  dataMap.scanLoading = true
  WMSAPI.get(listAPIName, { imBarcode: val, imOclas })
    .then((res) => {
      if (res && res.success) {
        let _data = res.data as any[]
        if (_data.length === 0) {
          _showFailToast('暂无数据')
          return
        }
        // TODO: 使用静态测试数据
        // let _data: any[] = testData.data
        if (_data.length > 0) {
          dataMap.form = Object.assign({}, dataMap.form, _data[0])
        }

        let arr: any[] = []
        // 增加uuid为唯一识别符
        _data.forEach((item) => {
          item.uuid = uuidv4()
          arr.push(item)
        })
        // 赋值表格数据
        dataMap.list = arr
        let arrs = dataMap.list.map((item) => item.uuid)
        // 全选
        table.value?.handleSelect(arrs)
      } else {
        _showFailToast(res.message as string)
      }
    })
    .catch(() => {
      // 在返回错误后清空页面
      handleClear()
    })
    .finally(() => {
      dataMap.scanLoading = false
      dataMap.form.imBarcode = ''
      // 查询结果之后重新聚焦
      barcodeInputRef?.focus()
    })
}

function inputTextHandler(key: string, index: number) {
  if (key === 'boxID') boxIDEnter(dataMap.list[index].boxID, index)
}

// 过账
async function handleConfirm() {
  try {
    // 表单验证
    await formComponent.value?.refForm.validate()
    // 是否有勾选数据
    if (dataMap.selectedList.length === 0) {
      _showFailToast('请勾选数据')
      return
    }
    // 表格必填项验证
    let flag = validateTableSelected(dataMap.tableColumn, dataMap.selectedList)
    if (!flag.isPass) {
      _showFailToast(flag.message)
      return
    }
    // tips:增加必须全选才能过账的限制
    if (dataMap.list.length !== dataMap.selectedList.length) {
      _showFailToast('存在未确认项，请确认数据。')
      await Promise.reject()
    }
    // 过账前确认
    await showConfirmDialog({
      title: '提示',
      message: `本次过账共 ${dataMap.selectedList.length} 条数据,累计数量是: ${computedTotal(
        dataMap.selectedList
      )},是否确认过账？`
    })
    // 开始过账
    dataMap.loading = true

    // 删除uuid,遍历实现
    let _list: any[] = JSON.parse(JSON.stringify(dataMap.selectedList))
    _list.forEach((item) => delete item.uuid)
    // tips:混入箱子信息
    _list = _list.map((item) => ({
      ...item,
      targetBoxID: dataMap.form.targetBoxID,
      targetLocationID: dataMap.form.targetLocationID
    }))

    // 组合参数
    let _data: any = fomrmatShipmentSubmitParams(
      imOclas,
      user.user.account,
      user.user.name,
      dataMap.form.warehouseNo,
      _list,
      'out'
    )

    // 调用接口
    let res = await WMSAPI.post(passAPIName, _data)

    if (res && res.success) {
      showSuccessToast(res.message || '过账成功')
      // 清空表单和列表
      handleClear()
    } else {
      _showFailToast(res.message as string)
    }
  } finally {
    dataMap.loading = false
  }
}

// 计算勾选的累计数量
const computedTotal = (arr: any[]) => {
  const key = 'erfmg'
  return arr.reduce((pre, next) => {
    // eslint-disable-next-line no-prototype-builtins
    if (pre.hasOwnProperty(key)) {
      return Number(pre[key]) + Number(next[key])
    } else {
      return Number(next[key])
    }
  }, 0)
}

// 清空
const handleClear = () => {
  // table数据
  dataMap.list = []
  // 转出箱子列表
  dataMap.outBoxIDList = []
  // 选中项集合
  dataMap.selectedList = []
  // 表单
  dataMap.form = {
    postDate: today
  }
}

// 初始化配置项
async function initConfig() {
  await getUserWarehouse()
  dataMap.formList.forEach((item) => {
    if (item.prop === 'warehouseNo') {
      item.change = wareHouseChange
      item.options = dataMap.wareHouseList
    }
    if (item.prop === 'targetLocationID') {
      item.enter = areaEnter
      areaInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
    if (item.prop === 'imBarcode') {
      item.enter = barcodeEnter
      barcodeInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
    if (item.prop === 'targetBoxID') {
      item.enter = (val: string | null) => targetBoxIDEnter(val)
      targetBoxIDInputRef = formComponent.value?.formInputRef[item.prop].inputRef
    }
  })
}

onMounted(() => {
  initConfig()
})
// 按钮-配件清单
function handlePartList(key: string, data: any, index: number) {
  let tableBtnParams = (dataMap.tableColumn[6] as TableColumn).tableBtnParams as ITableBtnParams
  getPartList(key, data, index, dataMap, tableBtnParams)
}
</script>

<style lang="scss" scoped>
.loading_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
