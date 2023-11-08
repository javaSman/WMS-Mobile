<template>
  <div>
    <!-- 表单布局-隐藏字段布局 -->
    <FormGroup ref="refFormGroup" :formList="_formList" v-model:form="form" v-model:show="show" />
    <!-- 列表 -->
    <TableVue ref="table" v-model:table-data="list" :tableColumn="tableColumn" @click-handler="clickHandler" />
    <!-- 底部按钮 -->
    <ActionBarVue
      ref="actionBarVue"
      :loading="loading"
      :confirmText="confirmText"
      @clear="handleClear"
      @confirm="getDetailEnter"
    />
    <!-- 调用扫条码时的loading效果，同时阻止用户继续操作 -->
    <van-overlay :show="scanLoading">
      <div class="loading_wrapper" @click.stop>
        <van-loading color="#ffffff" type="spinner">数据加载中</van-loading>
      </div>
    </van-overlay>
    <van-dialog v-model:show="dialogShow" class="tableDialogVue">
      <TableVue ref="table" :tableData="curDetailsList" :tableColumn="detailsTableColumn" class="dlg-table" />
      <template #footer>
        <van-button square size="small" style="float: right" @click="dialogShow = false">确定</van-button>
      </template>
    </van-dialog>
  </div>
</template>

<script lang="ts" setup name="ToggleFormWMSVue">
import { PropType, ref, reactive, onMounted } from 'vue'
import FormGroup from '@/views/wmsFunction/components/FormGroup.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { FormConfig, TableColumn } from '@/typing'
import { WMSAPI } from '@/api/generalAPI'
import { FieldInstance } from 'vant'
import { v4 as uuidv4 } from 'uuid'
import { detailsTableColumn } from '../config/index'
import { _showFailToast } from '@/utils/message'
// import useStore from '@/store'

// let emits = defineEmits(['clickHandler'])
let props = defineProps({
  formList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 表单项数组
  showFormList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 需要展开显示的数据字段参数
  tableColumn: { type: Array as PropType<TableColumn[]>, default: () => [] }, // 列表字段参数
  chkDisabled: { type: Boolean, default: () => false },
  submit: { type: Function, default: undefined }, // 过账按钮前执行事件
  passAPIName: { type: String, default: () => '' }, // 过账接口地址
  getDetailAPIName: { type: String, default: () => '' }, // 扫码查询接口地址
  type: { type: String, default: () => '' }, // 页面业务类型
  confirmText: { type: String, default: () => '过账' }, // 底部按钮显示文本
  enterAfterEvent: { type: Function, default: undefined }, // 条码回车事件后执行事件，用于重新组合数据
  isPass: { type: Boolean, default: () => true }
})

let table = ref<InstanceType<typeof TableVue> | null>(null)
let refFormGroup = ref<any>({}) // 表单组合ref

// let { user } = useStore()
// let { account, name } = user.user

// 表单对象，初始化过账日期
let form = ref<any>({})
// 点击左侧箭头是否展开
let show = ref(false)
let dialogShow = ref(false)

// 表单项数组，因需要二次赋值，但是子组件深度监听都监听不到props.formList的改变，computed是异步会有数据延迟，只好是用ref
let _formList = ref<FormConfig[]>(JSON.parse(JSON.stringify(props.formList)))

// 列表数据
let list = ref<any[]>([])
// 明细列表数据
let detailsList = ref<any[]>([])
// 当前明细列表数据
let curDetailsList = ref<any[]>([])

// 过账按钮loading
let loading = ref(false)
// 存储额外的参数对象
let exParams = reactive<any>({})
// 扫条码时进行loading
const scanLoading = ref(false)

let materialInputRef: FieldInstance | null = null
let projectInputRef: FieldInstance | null = null
let stationInputRef: FieldInstance | null = null

/** 回车带出明细 */
const getDetailEnter = () => {
  let { materialNo, projectBatch, stationNo } = form.value
  if ((materialNo ?? '') === '' && (projectBatch ?? '') === '' && (stationNo ?? '') === '') {
    _showFailToast('请输入至少一个查询条件!')
    return
  }
  let splitArr = (projectBatch ?? '') === '' ? [] : projectBatch.split('-')
  if (splitArr.length !== 2 && splitArr.length !== 0) {
    _showFailToast('请正确输入项目号-批次号!')
    return
  }
  let data = { materialNo, stationNo, projectNo: splitArr[0], batch: splitArr[1], type: 1 }
  scanLoading.value = true
  WMSAPI.get(props.getDetailAPIName, data)
    .then((res: any) => {
      if (res && res.success) {
        let _data: any[] = res.locationList ?? []
        if (_data.length === 0) {
          _showFailToast(`暂无明细`)
        }
        // 增加uuid为唯一识别符
        _data.forEach((item, index) => {
          item.index = index + 1
          item.uuid = uuidv4()
        })
        // 赋值表格数据
        list.value = _data
        detailsList.value = res.barcodeList as any[]
      } else {
        _showFailToast(res.message)
      }
    })
    .finally(() => {
      scanLoading.value = false
    })
}

// 行右键点击方法-查看明细
const clickHandler = (key: string, data: any) => {
  dialogShow.value = true
  curDetailsList.value = detailsList.value.filter((item) => item.locationNo === data.locationNo)
  curDetailsList.value.forEach((item, index) => {
    item.index = index + 1
    item.uuid = uuidv4()
  })
}

// 初始化配置项
async function initConfig() {
  _formList.value.forEach((item) => {
    // 箱子号-获取箱子明细
    if (item.prop === 'materialNo') {
      item.enter = () => {
        materialInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
        projectInputRef?.focus()
        // item.enter = getDetailEnter
      }
    }
    if (item.prop === 'projectBatch') {
      projectInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
      stationInputRef?.focus()
      // item.enter = getDetailEnter
    }
    if (item.prop === 'stationNo') {
      stationInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
      item.enter = getDetailEnter
    }
  })
}

// 清空
const handleClear = () => {
  // 额外参数
  exParams.value = {}
  // table数据
  list.value = []
  // 选中项集合
  // 表单
  form.value = {}
}

// getUserWarehouse()
onMounted(() => {
  initConfig()
  materialInputRef?.focus()
})

// 将这个清除方法暴露出去
defineExpose({
  /**
   * @description:清空界面和所选内容方法
   */
  clearHandler: handleClear,
  /**
   * 表单
   */
  form,
  /**
   * 数据列表
   */
  list,
  /**
   * Table 实例
   */
  table
})
</script>

<style lang="scss" scoped>
.loading_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.dlg-table {
  margin: 0 10px 10px;
  :deep(.tableCellGroup) {
    border: 1px solid #ddd;
  }
}
</style>
