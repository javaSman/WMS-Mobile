<template>
  <div>
    <!-- 表单布局 -->
    <div class="sticky_fix">
      <van-cell-group>
        <van-cell title-class="toggleFormCellTitle" style="padding-left: 0; padding-right: 0; border-radius: 0">
          <template #title v-if="showFormList.length > 0">
            <van-icon :name="show ? 'arrow-down' : 'arrow'" @click="show = !show" />
          </template>
          <template #value>
            <FormVue ref="formComponent" v-model:formData="form" :formList="formList" />
            <!-- 隐藏字段布局 -->
            <FormVue v-if="show" ref="showFormComponent" v-model:formData="form" :formList="showFormList" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    <!-- 列表 -->
    <TableForQuery ref="table" :tableData="list" :tableColumn="tableColumn" :form-list-length="formList.length" />
    <!-- 底部按钮 -->
    <ActionBarVue ref="actionBarVue" :loading="loading" :confirmText="confirmText" @clear="handleClear" @confirm="handleConfirm" />
  </div>
</template>

<script lang="ts" setup name="QueryToggleFormVue">
import { PropType, computed, ref } from 'vue'
import FormVue from '@/components/Form/index.vue'
import TableVue from '@/components/Table/index.vue'
import TableForQuery from './TableForQuery.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { FormConfig, TableColumn } from '@/typing'

let emits = defineEmits(['confirm', 'update:formData', 'update:tableData'])
let props = defineProps({
  formList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 表单项数组
  showFormList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 需要展开显示的数据字段参数
  tableColumn: { type: Array as PropType<TableColumn[]>, default: () => [] }, // 列表字段参数
  confirmText: { type: String, default: () => '查询' }, // 底部按钮显示文本
  formData: { type: Object as PropType<any>, default: () => ({}) }, // 表单数据
  tableData: { type: Array as PropType<any[]>, default: () => [] } // 表格数据
})

let table = ref<InstanceType<typeof TableVue> | null>(null)
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)

// 表单对象，初始化过账日期
let form = computed({
  get: () => props.formData,
  set: (val) => emits('update:formData', val)
})
// 点击左侧箭头是否展开
let show = ref(false)
// 表单项数组
let formList = computed({
  get: () => props.formList,
  set: (val) => val
})
// 列表数据
let list = computed({
  get: () => props.tableData,
  set: (val) => emits('update:tableData', val)
})
// 过账按钮loading
let loading = ref(false)

// 查询
function handleConfirm() {
  emits('confirm')
}
// 清空
function handleClear() {
  // table数据
  list.value = []
  // 表单
  form.value = {}
}
</script>

<style scoped lang="scss">
.sticky_fix {
  position: sticky;
  top: 0;
  z-index: 99999;
}
</style>
