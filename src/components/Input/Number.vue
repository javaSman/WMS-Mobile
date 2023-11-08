<template>
  <van-field :name="item.label" :label="item.label" :required="item.rules && item.rules.length > 0">
    <template #input>
      <van-stepper
        v-model="fieldValue"
        :max="numberParams?.max"
        :min="numberParams?.min || ''"
        :step="numberParams?.step"
        :decimal-length="numberParams?.precision"
        :disabled="disabled"
        :integer="!numberParams?.precision || numberParams?.precision === 0"
        :default-value="''"
        long-press
        @change="change"
        @blur="blur"
        @keyup.enter="enter"
      />
    </template>
  </van-field>
  <!-- TODO: default-value 有个初始值，暂时没办法去掉 -->
</template>

<script lang="ts" setup name="NumberVue">
import { FormConfig, INumberParams } from '@/typing'
import { PropType, computed } from 'vue'

let emits = defineEmits(['update:modelValue', 'onSubmit', 'blur', 'change', 'enter'])
let props = defineProps({
  modelValue: { type: [Number, String], default: () => '' }, // 表单的v-model
  item: { type: Object as PropType<FormConfig>, default: () => ({}) },
  isEdit: { type: Boolean, default: () => false }
})

/** 表单值，val */
let fieldValue = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val)
})

let numberParams = computed<INumberParams | undefined>(() => props.item.numberParams)

let disabled = computed(() => {
  if (props.item.disabled) return true
  if (props.item.unique && props.isEdit) return true
  else return false
})

function blur(e: Event) {
  fieldValue.value = Number((e.target as HTMLInputElement).value.trim())
  props.item.blur && props.item.blur(fieldValue.value)
  emits('blur', fieldValue.value)
}

function enter() {
  fieldValue.value = Number(fieldValue.value)
  props.item.enter && props.item.enter(fieldValue.value)
  emits('enter', fieldValue.value)
}

function change(val: number | null) {
  props.item.enter && props.item.enter(val)
  emits('change', val)
}
</script>

<style lang="scss" scoped>
:deep(.van-stepper) {
  width: 100%;
  border: 1px solid #eee;
  border-radius: 5px;
}
:deep(.van-stepper__input) {
  width: calc(100% - 60px);
  background-color: transparent;
}
</style>
