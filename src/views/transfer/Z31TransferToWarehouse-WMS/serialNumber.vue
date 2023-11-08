<template>
  <van-dialog v-model:show="show" :title="title" class="tableDialogVue">
    <!-- 列表信息总览 -->
    <van-sticky :offset-top="0">
      <van-grid
        direction="horizontal"
        :column-num="3"
        :border="false"
        style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc"
      >
        <van-grid-item>总数：{{ list.length }}</van-grid-item>
        <van-grid-item>已扫描：{{ dataMap.tableList.length }}</van-grid-item>
        <van-grid-item>剩余数：{{ list.length - dataMap.tableList.length }}</van-grid-item>
      </van-grid>
    </van-sticky>
    <FormVue ref="formComponent" v-model:formData="dataMap.form" :formList="dataMap.formList" />
    <div class="SN_tableList">
      <TableVue ref="table" :tableData="dataMap.tableList" :tableColumn="dataMap.tableColumn" :disabledChk="true" />
    </div>
    <template #footer>
      <van-button square type="primary" size="normal" style="float: right; width: 40%" @click="handleConfirmIsPass">
        确定
      </van-button>
    </template>
  </van-dialog>
</template>

<script lang="ts" setup name="SerialNumberDialogVue">
import TableVue from '@/components/Table/index.vue'
import FormVue from '@/components/Form/index.vue'
import { PropType, reactive, computed, ref } from 'vue'
import { SNFormList, SNTableColumn } from './config'
import { _showFailToast } from '@/utils/message'

let emits = defineEmits(['update:visible', 'update:isPass'])
let props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  barcode: { type: String, default: '' },
  list: { type: Array as PropType<any[]>, default: () => [] }, // 确认信息数组
  isPass: { type: Boolean, default: false } // 确认是否可以过账，默认为true，条件为list全部选中为true，否则为false
})
let dataMap = reactive({
  form: {} as any,
  formList: SNFormList,
  tableList: [] as any[],
  tableColumn: SNTableColumn
})

let table = ref<InstanceType<typeof TableVue> | null>(null)

let show = computed({
  get: () => props.visible,
  set: (val) => emits('update:visible', val)
})

dataMap.formList[0].enter = handelScanBarcode
function handelScanBarcode(val: string | null) {
  if (!val) {
    _showFailToast('请扫描序列号!')
    return
  }
  // 判断该条码在数据中是否存在
  let target = props.list.find((item) => item.equnr === val)
  if (!target) {
    _showFailToast(`条码${props.barcode}中不存在序列号${val}`)
    dataMap.form.imBarcode = ''
    return
  }
  // 判断是否已经扫码过
  let _target = dataMap.tableList.find((item) => item.equnr === val)
  if (_target) {
    _showFailToast(`序列号${val}已存在，请勿重复扫码!`)
    dataMap.form.imBarcode = ''
    return
  }
  // 不存在
  dataMap.tableList.push(target)
  // 清除输入框
  dataMap.form = {}
}

// 确定是否可以过账
function handleConfirmIsPass() {
  if (props.list.length === dataMap.tableList.length) {
    emits('update:isPass', true)
  } else {
    emits('update:isPass', false)
  }
  show.value = false
}
</script>

<style lang="scss" scoped>
.SN_tableList {
  height: calc(50vh - 93px);
  overflow: auto;
  overflow-x: hidden;
}
</style>
