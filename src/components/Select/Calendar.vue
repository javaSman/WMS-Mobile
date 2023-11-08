<template>
  <van-field
    v-model="fieldValue"
    is-link
    readonly
    :name="item.prop"
    :label="item.label"
    :placeholder="'请选择' + item.label"
    :rules="item.rules"
    :required="item.rules && item.rules.length > 0"
    input-align="right"
    @click="showCalendar = true"
  />
  <van-calendar v-model:show="showCalendar" :show-confirm="false" :min-date="calendar?.minDate" :max-date="calendar?.maxDate" @confirm="confirm" />
</template>

<script lang="ts" setup name="CalendarVue">
import { FormConfig, ICalendarParams } from '@/typing'
import { PropType, computed, ref } from 'vue'
import Dates from '@/utils/datetime'

let emits = defineEmits(['update:modelValue', 'blur', 'enter'])
let props = defineProps({
  modelValue: { type: String, default: () => null }, // 表单的v-model
  item: { type: Object as PropType<FormConfig>, default: () => ({}) },
  isEdit: { type: Boolean, default: () => false }
})

let showCalendar = ref<boolean>(false)

/** 表单值，val */
let fieldValue = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val)
})

let calendar = computed<ICalendarParams | undefined>(() => props.item.calendarParams)

function confirm(value: Date) {
  let times = new Dates(value)
  fieldValue.value = times.strftime('YYYY-MM-DD')
  // console.log(fieldValue.value)
  showCalendar.value = false
  props.item.change && props.item.change(fieldValue.value)
}
</script>

<style scoped lang="scss">
:deep(.van-cell__value){
  min-width: 55%
}
</style>
