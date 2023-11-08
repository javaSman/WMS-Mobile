<template>
  <van-field
    v-model="label"
    is-link
    readonly
    :name="item.prop"
    :label="item.label"
    :placeholder="'请选择' + item.label"
    :required="item.rules && item.rules.length > 0"
    @click="showCalendar = true"
  />
  <van-calendar
    v-model="selected"
    v-model:show="showCalendar"
    type="range"
    :show-confirm="false"
    :min-date="calendar?.minDate"
    :max-date="calendar?.maxDate"
    @confirm="confirm"
  />
</template>

<script lang="ts" setup name="CalendarVue">
import { FormConfig, ICalendarParams } from '@/typing'
import { PropType, computed, ref } from 'vue'
import Dates from '@/utils/datetime'

let emits = defineEmits(['update:modelValue', 'blur', 'enter'])
let props = defineProps({
  modelValue: { type: Array as PropType<string[]>, default: () => null }, // 表单的v-model
  item: { type: Object as PropType<FormConfig>, default: () => ({}) },
  isEdit: { type: Boolean, default: () => false }
})

let showCalendar = ref<boolean>(false)

/** 表单值，val */
let fieldValue = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val)
})
// 显示字样
let label = computed({
  get: () => {
    if (props.modelValue && props.modelValue.length > 0) {
      let [_start, _end] = props.modelValue
      return `${_start} 至 ${_end}`
    } else return ''
  },
  set: (val) => val
})
// 选中值的转换
let selected = computed({
  get: () => {
    if (props.modelValue && props.modelValue.length > 0) {
      let [_start, _end] = props.modelValue
      return [new Date(_start), new Date(_end)]
    } else return []
  },
  set: (val) => val
})

let calendar = computed<ICalendarParams | undefined>(() => props.item.calendarParams)

function confirm(value: Date[]) {
  if (value && value.length > 0) {
    let _start = new Dates(value[0]).strftime('YYYY-MM-DD')
    let _end = new Dates(value[1]).strftime('YYYY-MM-DD')
    fieldValue.value = [_start, _end]
    label.value = `${_start} 至 ${_end}`
  }

  showCalendar.value = false
  props.item.change && props.item.change(fieldValue.value)
}
</script>
