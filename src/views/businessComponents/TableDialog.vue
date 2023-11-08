<template>
  <van-dialog v-model:show="show" :title="title" class="tableDialogVue">
    <TableVue ref="table" :tableData="tableData" :tableColumn="tableColumn" />
    <template #footer>
      <span style="line-height: 44px">总计{{ tableData.length }}个</span>
      <van-button square type="primary" size="normal" style="float: right; width: 40%" @click="show = false">确定</van-button>
    </template>
  </van-dialog>
</template>

<script lang="ts" setup name="TableDialogVue">
import { computed, PropType } from 'vue'
import { TableColumn } from '@/typing'
import TableVue from '@/components/Table/index.vue'

let emits = defineEmits(['update:visible'])
let props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '配件清单' },
  tableColumn: { type: Array as PropType<TableColumn[]>, default: () => [] }, // 列表字段参数
  tableData: { type: Array as PropType<any[]>, default: () => [] } // 清单列表数据
})

let show = computed({
  get: () => props.visible,
  set: (val) => emits('update:visible', val)
})
</script>
