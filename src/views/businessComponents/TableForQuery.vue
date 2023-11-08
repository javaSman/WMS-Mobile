<template>
  <div class="wrapper" ref="wrapperRef" @scroll="onScroll">
    <div class="background" :style="{ height: `${total_height}px` }" />
    <div class="list" ref="container">
      <van-checkbox-group v-model="selected" ref="checkboxGroup" @change="handleSelect">
        <van-cell-group style="margin-top: 5px" v-for="(_data, index) in runTableData" :key="index">
          <van-field name="switch" v-for="item in tableColumn" :key="item.prop" :label="item.label" label-width="7em">
            <template #input>
              <!-- 第一行：显示复选框 -->
              <div v-if="item.type === 'Table/CheckBox'" style="width: 100%">
                <span>{{ (item.formatter && item.formatter(_data.data, _data.data[item.prop])) || _data.data[item.prop] }}</span>
                <van-checkbox
                  :name="_data.data[uniqueKey]"
                  :disabled="disabledChk || _data.data.disabled"
                  shape="square"
                  style="float: right; padding-top: 2px"
                />
              </div>
              <!-- 右侧按钮 -->
              <div v-else-if="item.type === 'Table/RightBtn'" style="width: 100%">
                <span>{{ _data.data[item.prop] }}</span>
                <van-button
                  square
                  type="primary"
                  size="mini"
                  style="float: right"
                  :icon="item.tableBtnParams?.icon"
                  :loading="item.tableBtnParams?.loading[index]"
                  @click="handleRightBtn(item.prop, _data.data, index)"
                >
                  {{ item.tableBtnParams?.btnText || '配件清单' }}
                </van-button>
              </div>
              <!-- 针对可以输入项自定义设计 -->
              <div v-else-if="item.type === 'Table/Number'">
                <input @input="(event) => inputNum(event, item.prop, index)" class="cutom_input" type="number" v-model="_data[item.prop]" />
                <span>&nbsp;&nbsp; x {{ item.multiple }}</span>
                <span>&nbsp;&nbsp;=&nbsp;&nbsp;</span>
                <span>{{ computedNum(_data.data[item.prop], item.multiple) }}</span>
              </div>
              <!-- 底部清除按钮 -->
              <div v-else-if="item.prop === 'bottom_clean'" class="bottom_btn">
                <van-button type="danger" square size="mini" @click="clearItem(_data.data.uuid)">清除</van-button>
              </div>
              <!-- 自定义插槽 -->
              <slot v-else-if="item.type === 'CustomSlot'" :name="item.slot" :row="_data.data" :item="item" :index="index" />
              <span v-else>{{ (item.formatter && item.formatter(_data.data, _data.data[item.prop])) || _data.data[item.prop] }}</span>
            </template>
          </van-field>
        </van-cell-group>
      </van-checkbox-group>
    </div>
  </div>
</template>

<script lang="ts" setup name="TableVue">
import { onMounted, PropType, ref, watch } from 'vue'
import { TableColumn } from '@/typing'
import { CheckboxGroup } from 'vant'

// Unexpected newline between function name and paren.(eslintfunc-call-spacing)
// 抽离类型注解
type Emit = {
  (e: 'update:checked', val: boolean): void
  (e: 'update:selection', val: any[]): void
  (e: 'update:tableData', data: any[]): void
  /**
   * @description: 行右边的点击方法
   * @param key 当前的行prop
   * @param data 当前行数据
   * @param index 当前行下标
   */
  (e: 'clickHandler', key: string, data: any, index: number): void
  /**
   * @description: 数量的input事件
   * @param index 当前行下标
   */
  (e: 'inputNumHandler', key: string, index: number): void
}
let emits = defineEmits<Emit>()

let props = defineProps({
  tableData: { type: Array as PropType<any[]>, default: () => [] }, // 表格数据
  tableColumn: { type: Array as PropType<TableColumn[]>, default: () => [] }, // 表格字段参数
  selection: { type: Array as PropType<any[]>, default: () => [] }, // 选中项数组
  uniqueKey: { type: String, default: 'uuid' }, // 选中项值字段，tableData 唯一值
  disabledChk: { type: Boolean, default: () => false }, // 禁用所有复选框
  formListLength: { type: Number, default: 2 } // 查询表单的项目数，用于计算可视顶部偏移距离
})

let checkboxGroup = ref(CheckboxGroup)

let selected = ref<string[]>([])
// 总容器实例
const wrapperRef = ref<HTMLElement>()
// 可视容器的实例
const container = ref<HTMLElement>()
// 列表的最大高度
const total_height = ref(0)
// list的最小高度(只有一项的时候)
const min_height = ref(30.8)
// 滚动时表格的内容
const runTableData = ref<any[]>([])
// 一屏幕容纳的最大数量
const maxNum = ref(0)
// 滚动距离缓存
const distance = ref(0)
// 每次滚动的节流标识
const ticking = ref(false)
// 缓冲屏幕的数量
const cache_screens = ref(1)
// 格式化后的原始数据
const orignTableData = ref<any[]>([])

// 监听prop数据，重新构造新数据来适配虚拟滚动
watch(
  () => props.tableData,
  (n) => {
    let total_height_temp = 0
    const list = n.map((data, index) => {
      const height = props.tableColumn.length * 30.8
      const ob = {
        index,
        height,
        top: total_height_temp,
        data
      }
      total_height_temp += height
      return ob
    })
    total_height.value = total_height_temp + 100
    orignTableData.value = list
    getRunData()
  }
)

// 计算列表总高度
watch(
  () => props.tableData.length,
  (n) => {
    // 当前使用的vant的field的高度是30.8一项，那么根据tableColumn的长度即可计算出一个list的高度是多少
    let oneListH = props.tableColumn.length * 30.8
    // 那么总高度就是列表总数据长度*一个list的高度
    total_height.value = oneListH * n
  }
)

onMounted(() => {
  init()
  // getRunData()
})

// 初始化虚拟滚动
const init = () => {
  const containerHeight = parseInt(getComputedStyle(wrapperRef.value as Element).height)
  // 一屏的最大数量
  maxNum.value = Math.ceil(containerHeight / min_height.value)
}

// 当用户滚动时触发的事件
const onScroll = (e: any) => {
  if (ticking.value) {
    return
  }
  ticking.value = true
  requestAnimationFrame(() => {
    ticking.value = false
  })
  const scrollTop = e.target.scrollTop
  distance.value = scrollTop
  getRunData(distance.value)
}

// 动态获取滚动时列表的数据
const getRunData = (distance: number | null = null) => {
  // 滚动的总距离
  const scrollTop = distance || container.value?.scrollTop
  // 起始索引
  let start_index = getStartIndex(scrollTop as number)
  start_index = start_index < 0 ? 0 : start_index
  // 上屏索引
  let upper_start_index = start_index - maxNum.value * cache_screens.value
  upper_start_index = upper_start_index < 0 ? 0 : upper_start_index
  // 调整offset
  container.value!.style.transform = `translate3d(0,${orignTableData.value[upper_start_index].top}px,0)`
  // 中间屏幕的元素
  const mid_list = orignTableData.value.slice(start_index, start_index + maxNum.value)
  // 上屏
  const upper_list = orignTableData.value.slice(upper_start_index, start_index)
  // 下屏元素
  let down_start_index = start_index + maxNum.value
  down_start_index = down_start_index > orignTableData.value.length - 1 ? orignTableData.value.length : down_start_index
  const down_list = orignTableData.value.slice(down_start_index, down_start_index + maxNum.value * cache_screens.value)
  runTableData.value = [...upper_list, ...mid_list, ...down_list]
}

// 获取起点的索引,二分法查找
const getStartIndex = (scrollTop: number) => {
  let start = 0
  let end = orignTableData.value.length - 1
  while (start < end) {
    const mid = Math.floor((start + end) / 2)
    const { top, height } = orignTableData.value[mid]
    if (scrollTop >= top && scrollTop < top + height) {
      start = mid
      break
    } else if (scrollTop >= top + height) {
      start = mid + 1
    } else if (scrollTop < top) {
      end = mid - 1
    }
  }
  return start
}

// 统一的右键点击方法
const handleRightBtn = (key: string, data: any, index: number) => {
  emits('clickHandler', key, data, index)
}

// 勾选方法
const handleSelect = (val: any[]) => {
  let arr: any[] = []
  selected.value = val
  props.tableData.forEach((item) => {
    if (val.includes(item[props.uniqueKey])) arr.push(item)
  })
  emits('update:selection', arr)
}

// 计算当前数量
const computedNum = (num: number, multiple: number | undefined) => {
  return multiple ? num * multiple : num
}
// 清除某一项方法,借助uuid删除某一项
const clearItem = (key: string) => {
  let result = props.tableData.filter((item) => item.uuid !== key)
  // 同时如果清除的是选中的，那么选中的也要删除
  let newSelection = props.selection.filter((item) => item.uuid !== key)
  emits('update:tableData', result)
  emits('update:selection', newSelection)
}
// 校验输入时提示
const inputNum = (e: Event, key: string, index: number) => {
  emits('inputNumHandler', key, index)
}

defineExpose({
  /**
   * @description 复选框组 组件实例
   */
  checkboxGroup,
  /**
   * @description 复选框组 选中项事件
   */
  handleSelect
})
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  overflow-y: scroll;
  height: calc(100vh - 191px);
  .background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: -1;
  }
  .list {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }
}
.cutom_input {
  border: none;
  border-bottom: 1px solid #ccc;
  width: 50%;
}
.bottom_btn {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}
</style>
