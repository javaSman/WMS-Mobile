<template>
  <van-sticky :offset-top="46">
    <van-grid direction="horizontal" :column-num="4" :border="false" style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc">
      <van-grid-item>总数：{{ list.length }}</van-grid-item>
      <van-grid-item>已确认：{{ selectedList.length }}</van-grid-item>
      <van-grid-item>剩余数：{{ list.length - selectedList.length }}</van-grid-item>
      <van-grid-item>
        <van-checkbox v-model="checkAll" :disabled="chkDisabled" shape="square" @click="handleSelectAll">全选</van-checkbox>
      </van-grid-item>
    </van-grid>
  </van-sticky>
</template>
<script lang="ts" setup name="SummaryCheck">
import { PropType, computed, watch } from 'vue'
let emits = defineEmits(['update:selectAll', 'handleSelectAll'])
let props = defineProps({
  chkDisabled: { type: Boolean, default: () => false },
  selectAll: { type: Boolean, default: () => true }, // 是否全选
  selectedList: { type: Array as PropType<any[]>, default: () => [] }, // 选中项集合
  list: { type: Array as PropType<any[]>, default: () => [] } // 列表数据
})

let checkAll = computed({
  get: () => props.selectAll,
  set: (val) => emits('update:selectAll', val)
})

// 对比选中项长度与数据数组总长度，是否可以勾选全选复选框
watch(
  () => [props.selectedList.length, props.list.length],
  ([val1, val2]) => {
    checkAll.value = val1 === val2 && val1 !== 0
  }
)

/** 全选和反选 */
const handleSelectAll = () => {
  emits('handleSelectAll')
}
</script>
