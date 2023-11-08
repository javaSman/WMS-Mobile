<template>
  <van-field
    v-model="fieldValue"
    readonly
    :name="item.prop"
    :label="item.label"
    :placeholder="'请选择' + item.label"
    :rules="item.rules"
    :required="item.rules && item.rules.length > 0"
    @click="showPicker = true"
  >
    <template #input>
      <van-dropdown-menu>
        <van-dropdown-item ref="dropdownItem" v-model="fieldValue" :options="optionsEx"  @change="handleChange" />
      </van-dropdown-menu>
    </template>
  </van-field>
</template>

<script lang="ts" setup name="DropdownVue">
import { FormConfig, IDictObj } from '@/typing'
import { PropType, computed, ref } from 'vue'
import { DropdownItemInstance } from 'vant'

let emits = defineEmits(['update:modelValue', 'change'])
let props = defineProps({
  modelValue: { type: [String, Number], default: () => '' }, // 表单的v-model
  item: { type: Object as PropType<FormConfig>, default: () => ({}) },
  isEdit: { type: Boolean, default: () => false }
})

let dropdownItem = ref<DropdownItemInstance | null>()
let showPicker = ref<boolean>(false)
let label = ref()

/** 表单值，val */
let fieldValue = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val)
})

let customFieldName = computed(() => {
  let opt: IDictObj | undefined = props.item.optProps
  if (!opt) return { text: 'text', value: 'value' }
  else return { text: opt.label, value: opt.value }
})

let optionsEx = computed(() => {
  let _ex: any[] = []
  props.item.options?.forEach(item => {
    _ex.push({ text: item[customFieldName.value.text], value: item[customFieldName.value.value]})
  })
  return _ex
})

function handleChange(val: string | number | null) {
  props.item.change && props.item.change(val)
  let selected = optionsEx.value.filter(item => item[customFieldName.value.value] === val)
  label.value = selected[0] ? selected[0][customFieldName.value.value] : ''
  emits('change', val)
}

defineExpose({
  dropdownItem
})
</script>

<style lang="scss" scoped>
:deep(.van-dropdown-menu) {
  width: 100%;
}
:deep(.van-dropdown-menu__bar) {
  height: 24px;
  background: transparent;
  box-shadow: none;
}
:deep(.van-dropdown-menu__item) {
  justify-content: right;
}
:deep(.van-cell__value){
  min-width: 20%
}
</style>
