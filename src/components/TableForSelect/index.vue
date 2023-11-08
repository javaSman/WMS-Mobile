<template>
  <van-form ref="refForm">
    <van-checkbox-group v-model="selected" ref="checkboxGroup" @change="handleSelect">
      <van-cell-group v-for="(_data, index) in tableData" :key="index" class="tableCellGroup">
        <van-field name="switch" v-for="item in tableColumn" :key="item.prop" :label="item.label" label-width="7em" :required="item.rules && item.rules.length > 0">
          <template #input>
            <!-- 第一行：显示复选框 -->
            <div v-if="item.type === 'Table/CheckBox'" style="width: 100%">
              <span>{{ (item.formatter && item.formatter(_data, _data[item.prop])) || _data[item.prop] }}</span>
              <van-checkbox
                :name="_data[uniqueKey]"
                :disabled="disabledChk || _data.disabled"
                shape="square"
                style="float: right; padding-top: 2px"
              />
            </div>
            <!-- 右侧按钮 -->
            <div v-else-if="item.type === 'Table/RightBtn'" style="width: 100%">
              <span>{{ (item.formatter && item.formatter(_data, _data[item.prop])) || _data[item.prop] }}</span>
              <van-button
                square
                type="primary"
                size="mini"
                style="float: right"
                :icon="item.tableBtnParams?.icon"
                :loading="item.tableBtnParams?.loading[index]"
                @click="handleRightBtn(item.prop, _data, index)"
              >
                {{ item.tableBtnParams?.btnText || '配件清单' }}
              </van-button>
            </div>
            <div v-else-if="item.type === 'Table/Input'" style="width: 100%">
              <van-field
                v-model="_data[item.prop]"
                :placeholder="'请输入' + item.label"
                :rules="item.rules"
                clearable
                clear-trigger="always"
                class="table_input"
                @keyup.enter="inputText(item.prop,index)"
              />
            </div>
            <div v-else-if="item.type === 'Table/NumberInput'" style="width: 100%">
              <van-field
                :ref="(el: any) => tableNumberInputRef[item.prop + '_' + index] = el"
                v-model="_data[item.prop]"
                type="number"
                :name="index + '_' + item.prop"
                :placeholder="'请输入' + item.label"
                :rules="item.rules"
                clearable
                clear-trigger="always"
                class="table_input"
                @blur="inputNum(item.prop, index)"
              >
                <template #extra v-if="item.tableNumberParams">
                  {{ _data[(item.tableNumberParams as any).exProp] }}
                </template>
              </van-field>
            </div>
            <!-- 针对可以输入项自定义设计 -->
            <div v-else-if="item.type === 'Table/Number'">
              <van-field
                v-model="_data[item.prop]"
                type="number"
                :name="index + '_' + item.prop"
                :placeholder="'请输入' + item.label"
                :rules="item.rules"
                clearable
                clear-trigger="always"
                class="cutom_input"
                @blur="inputNum(item.prop, index)"
              >
                <template #extra>
                  x {{ item.multiple }} = {{ computedNum(_data[item.prop], item.multiple) + computedUnit(_data.erfme, _data.gmein) }}
                </template>
              </van-field>
            </div>
            <!-- 通知滚动显示 -->
            <div v-else-if="item.type === 'Table/Notice'" style="width: 100%">
              <van-notice-bar scrollable background="#fff" color="#323233">
                {{ (item.formatter && item.formatter(_data, _data[item.prop])) || _data[item.prop] }}
              </van-notice-bar>
            </div>
            <!-- 底部清除按钮 -->
            <div v-else-if="item.prop === 'bottom_clean'" class="bottom_btn">
              <van-button type="danger" square size="mini" @click="clearItem(_data.uuid)">清除</van-button>
            </div>
            <!-- 自定义插槽 -->
            <slot v-else-if="item.type === 'CustomSlot'" :name="item.slot" :row="_data" :item="item" :index="index" />
            <!-- 加这一个是为了那些有授权时，领料人要显示授权人的名字 -->
            <span v-else-if="item.type === 'operateLocal'">{{ user.authUserInfo?.cardname }}</span>
            <span v-else>{{ (item.formatter && item.formatter(_data, _data[item.prop])) || _data[item.prop] }}</span>
          </template>
        </van-field>
      </van-cell-group>
      <van-empty v-if="tableData.length === 0" description="暂无数据"  image-size="100" style="padding: 0" />
    </van-checkbox-group>
  </van-form>
</template>

<script lang="ts" setup name="TableForSelect">
import { PropType, computed, ref } from 'vue'
import { TableColumn } from '@/typing'
import { CheckboxGroup, Form } from 'vant'
import useStore from '@/store'

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
  /**
   * @description: 普通文本的input事件
   * @param index 当前行下标
   */
  (e: 'inputTextHandler', key: string, index: number): void
}
let emits = defineEmits<Emit>()

let props = defineProps({
  tableData: { type: Array as PropType<any[]>, default: () => [] }, // 表格数据
  tableColumn: { type: Array as PropType<TableColumn[]>, default: () => [] }, // 表格字段参数
  selection: { type: Array as PropType<any[]>, default: () => [] }, // 选中项数组
  uniqueKey: { type: String, default: 'uuid' }, // 选中项值字段，tableData 唯一值
  disabledChk: { type: Boolean, default: () => false } // 禁用所有复选框
})

let checkboxGroup = ref(CheckboxGroup)
let refForm = ref(Form)
let tableNumberInputRef = ref<any>({})

// 承接外层selection实现双向绑定
let selected = computed({
  get() {
    return props.selection
  },
  set(val) {
    emits('update:selection', val)
  }
})
const { user } = useStore()
// 统一的右键点击方法
const handleRightBtn = (key: string, data: any, index: number) => {
  emits('clickHandler', key, data, index)
}

// 勾选方法,此时不参与勾选行为，只用来做额外的操作
const handleSelect = (val: any[]) => {
  console.log(val)
  // let arr: any[] = []
  // selected.value = val
  // props.tableData.forEach((item) => {
  //   if (val.includes(item[props.uniqueKey])) arr.push(item)
  // })
  // emits('update:selection', arr)
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
const inputNum = (key: string, index: number) => {
  emits('inputNumHandler', key, index)
}

// 普通输入框事件
const inputText = (key:string, index:number) => {
  emits('inputTextHandler', key, index)
}
// 判断单位
const computedUnit = (val1: string, val2: string) => {
  if (val1) {
    return ` | ${val1}`
  } else if (val2) {
    return ` | ${val2}`
  } else {
    return ''
  }
}

defineExpose({
  /**
   * @description 复选框组 组件实例
   */
  checkboxGroup,
  /**
   * @description 复选框组 选中项事件
   */
  handleSelect,
  /**
   * @description 表单实例
   */
  refForm,
  /**
   * 数字输入框实例
   */
  tableNumberInputRef
})
</script>

<style lang="scss" scoped>
.cutom_input {
  width: 100%;
  padding-left: 0;
  :deep(.van-cell__value) {
    margin-right: 10px;
  }
}
.bottom_btn {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}
.table_input {
  padding-left: 0;
}
:deep(.van-notice-bar) {
  height: 24px;
  padding: 0;
}
</style>
