<template>
  <!-- 表单布局 -->
  <van-cell-group>
    <van-cell title-class="toggleFormCellTitle" style="padding-left: 0; padding-right: 0; border-radius: 0">
      <template #title v-if="showFormList.length > 0">
        <van-icon :name="show ? 'arrow-down' : 'arrow'" @click="showMore = !showMore" />
      </template>
      <template #value>
        <FormVue ref="formComponent" v-model:formData="formData" :formList="formList" class="form-group" />
      </template>
    </van-cell>
  </van-cell-group>
  <!-- 隐藏字段布局 -->
  <van-cell-group v-show="show" :style="showFormList.length > 0 ? 'padding-left: 20px' : ''">
    <FormVue ref="showFormComponent" v-model:formData="formData" :formList="showFormList" class="form-group" />
  </van-cell-group>
</template>
<script lang="ts" setup name="FormGroup">
import FormVue from '@/components/Form/index.vue'
import { PropType, computed, ref } from 'vue'
import { FormConfig } from '@/typing'
let emits = defineEmits(['update:show', 'update:form'])
let props = defineProps({
  showFormList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 需要展开显示的数据字段参数
  formList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 表单字段参数
  form: { type: Object as PropType<any>, default: () => ({}) }, // 表单对象
  show: { type: Boolean, default: () => true } // 点击左侧箭头是否展开
})

let showMore = computed({
  get: () => props.show,
  set: (val) => emits('update:show', val)
})

let formData = computed({
  get: () => props.form,
  set: (val) => emits('update:form', val)
})

let formComponent = ref<InstanceType<typeof FormVue> | null>(null)

defineExpose({
  formComponent
})
</script>
<style lang="scss" scoped>
.form-group {
  :deep(.van-cell__title) {
    width: 60px !important;
  }
}
</style>
