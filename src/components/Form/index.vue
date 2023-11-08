<template>
  <van-form ref="refForm" :label-width="labelWidth">
    <van-cell-group :inset="inset">
      <div v-for="item in formListFiter" :key="item.prop">
        <InputVue
          :ref="(el: any) => formInputRef[item.prop] = el"
          v-if="item.type === 'Input' || item.type === 'Textarea'"
          v-model="form[item.prop]"
          :item="item"
          :isEdit="isEdit"
        />
        <NumberVue v-if="item.type === 'Number'" v-model="form[item.prop]" :item="item" :isEdit="isEdit" />
        <SelectVue v-if="item.type === 'Select'" v-model="form[item.prop]" :item="item" :isEdit="isEdit" />
        <CalendarVue v-if="item.type === 'Calendar'" v-model="form[item.prop]" :item="item" :isEdit="isEdit" />
        <CalendarRangeVue v-if="item.type === 'CalendarRange'" v-model="form[item.prop]" :item="item" :isEdit="isEdit" />
        <DropdownVue v-if="item.type === 'Dropdown'" v-model="form[item.prop]" :item="item" :isEdit="isEdit" @change="(val)=>dropdownChange(val,item.prop)"/>
        <van-field v-if="item.type === 'Text'" :name="item.prop" :label="item.label">
          <template #input>
            {{ form[item.prop] }}
          </template>
        </van-field>
      </div>
    </van-cell-group>
  </van-form>
</template>

<script lang="ts" setup name="FormVue">
import { FormConfig } from '@/typing'
import { PropType, computed, ref } from 'vue'
import InputVue from '@/components/Input/Input.vue'
import NumberVue from '@/components/Input/Number.vue'
import SelectVue from '@/components/Select/Select.vue'
import CalendarVue from '@/components/Select/Calendar.vue'
import CalendarRangeVue from '@/components/Select/CalendarRange.vue'
import DropdownVue from '@/components/Select/Dropdown.vue'
import { Form } from 'vant'

let emits = defineEmits(['update:formData', 'onSubmit', 'onDropdown'])
let props = defineProps({
  labelWidth: { type: Number, default: 80 }, // label 的宽度
  inset: { type: Boolean, default: false },
  formData: { type: Object as PropType<any>, default: () => ({}) }, // 要清空的表单对象
  formList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 表单字段参数
  isEdit: { type: Boolean, default: true },
  submit: {
    type: Function,
    default: () => {
      return false
    }
  }
})

let refForm = ref(Form)

let form = computed({
  get: () => props.formData,
  set: (val) => emits('update:formData', val)
})

/** 表单条目-过滤hide隐藏的条目 */
let formListFiter = computed<FormConfig[]>(() => {
  let arr: Array<FormConfig> = []
  arr = props.formList.filter((item: FormConfig) => !item.isHide)
  return arr
})

let formInputRef = ref<any>({})

/** dropdown选择回调，有些特殊业务需要用到 */
const dropdownChange = (val:string, prop:string) => {
  emits('onDropdown', val, prop)
}
defineExpose({
  /**
   * @description Form表单组件实例
   */
  refForm,
  /**
   * @description 所有输入框组件实例
   */
  formInputRef
})
</script>

<style lang="scss" scoped>
:deep(.van-cell) {
  border-radius: 0;
}
</style>
