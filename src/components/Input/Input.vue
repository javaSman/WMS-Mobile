<template>
  <van-field
    v-model="fieldValue"
    :type="type"
    :name="item.label"
    :label="item.label"
    :placeholder="'请输入' + item.label"
    :required="item.rules && item.rules.length > 0"
    :disabled="disabled"
    :rules="item.rules"
    :show-word-limit="Boolean(inputParams?.maxlength)"
    :autosize="inputParams?.autosize"
    :rows="inputParams?.rows"
    :input-align="inputParams?.align"
    :left-icon="inputParams?.leftIcon"
    clearable
    clear-trigger="always"
    @keyup.enter="enter"
    @blur="blur"
    ref="inputRef"
  >
    <template #button v-if="inputParams?.btnLabel">
      <van-button size="small" type="primary" @click="emits(inputParams?.clickFun as any)">{{ inputParams?.btnLabel }}</van-button>
    </template>
  </van-field>
</template>

<script lang="ts" setup name="InputVue">
import { FormConfig, IInputParams } from '@/typing'
import { FieldType, FieldInstance } from 'vant'
import { PropType, computed, ref } from 'vue'

let emits = defineEmits(['update:modelValue', 'blur', 'enter'])
let props = defineProps({
  modelValue: { type: String, default: () => '' }, // 表单的v-model
  item: { type: Object as PropType<FormConfig>, default: () => ({}) },
  isEdit: { type: Boolean, default: () => false }
})
const inputRef = ref<FieldInstance>()

/** 表单值，val */
let fieldValue = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val)
})

let inputParams = computed<IInputParams | undefined>(() => props.item.inputParams)
let type = computed<FieldType>(() => {
  if (props.item.type === 'Textarea') return 'textarea'
  else return 'text'
})
let disabled = computed(() => {
  if (props.item.disabled) return true
  if (props.item.unique && props.isEdit) return true
  else return false
})
// let minHeight = computed<number>(() => {
//   if (inputParams.value && inputParams.value.rows) return 24 * inputParams.value.rows
//   else return 24
// })

function blur(e: Event) {
  fieldValue.value = (e.target as HTMLInputElement).value.trim()
  props.item.blur && props.item.blur(fieldValue.value)
  emits('blur', fieldValue.value)
}

function enter() {
  props.item.enter && props.item.enter(fieldValue.value)
  //! 确认内容后使其失去焦点，配合loading效果使用
  inputRef.value?.blur()
  emits('enter', fieldValue.value)
}

defineExpose({
  /**
   * @description 输入框组件实例
   */
  inputRef
})
</script>
