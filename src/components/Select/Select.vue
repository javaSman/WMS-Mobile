<template>
  <van-field
    v-model="label"
    readonly
    :name="item.prop"
    :label="item.label"
    :placeholder="'请选择' + item.label"
    :required="item.rules && item.rules.length > 0"
    is-link
    @click="showPicker = true"
  />
  <van-popup v-model:show="showPicker" position="bottom">
    <van-picker v-model="selected" :columns="item.options" :columns-field-names="customFieldName" @confirm="confirm" @cancel="showPicker = false" />
  </van-popup>
</template>

<script lang="ts" setup name="SelectVue">
import { FormConfig, IDictObj } from '@/typing'
import { PickerConfirmEventParams } from 'vant'
import { PropType, computed, ref } from 'vue'

let emits = defineEmits(['update:modelValue', 'blur', 'enter'])
let props = defineProps({
  modelValue: { type: [String, Number], default: () => null }, // 表单的v-model
  item: { type: Object as PropType<FormConfig>, default: () => ({}) },
  isEdit: { type: Boolean, default: () => false }
})

let showPicker = ref<boolean>(false)
let label = ref()

/** 表单值，val */
let fieldValue = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val)
})

let selected = computed({
  get: () => (props.modelValue ? [props.modelValue] : []),
  set: (val) => val
})

let customFieldName = computed(() => {
  let opt: IDictObj | undefined = props.item.optProps
  if (!opt) return { text: 'text', value: 'value' }
  else return { text: opt.label, value: opt.value }
})

function confirm({ selectedValues, selectedOptions, selectedIndexes }: PickerConfirmEventParams) {
  // console.log(selectedValues, selectedOptions, selectedIndexes)
  showPicker.value = false
  label.value = (selectedOptions[0] as any)[customFieldName.value.text]
  fieldValue.value = selectedValues[0]
  props.item.change && props.item.change(selectedValues[0])
}
</script>
