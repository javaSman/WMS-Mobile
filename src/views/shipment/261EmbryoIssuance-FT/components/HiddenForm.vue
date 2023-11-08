<template>
  <div class="wrapper" v-for="(item, i) in list" :key="i">
    <div class="row">
      <span class="label">机加件</span>
      <span class="content">{{ item.sjpno }}</span>
      <span style="color: red" class="operate" @click="deleteItem(i)">删除</span>
    </div>
    <div class="row">
      <span class="label">条码</span>
      <span class="content">{{ item.barcode }}</span>
    </div>
    <div class="row">
      <span class="label">描述</span>
      <span class="content">{{ item.zzdoex }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { showConfirmDialog } from 'vant'
const emits = defineEmits<{(e: 'update:list', val: any[]): void
}>()
const props = withDefaults(
  defineProps<{
    list: any[]
  }>(),
  {
    list: () => []
  }
)
// 删除某一项
const deleteItem = (i: number) => {
  showConfirmDialog({
    title: '提示',
    message: '确认删除当前项目？'
  })
    .then(() => {
      let target = props.list.filter((_, index) => index !== i)
      emits('update:list', target)
    })
    .catch(() => {
      // on cancel
    })
}
</script>

<style scoped lang="scss">
.wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  background-color: #fff;
  font-size: 13px;
  margin-bottom: 5px;
  .row {
    width: 100%;
    line-height: 25px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    position: relative;
    border-bottom: 1px solid #eeecec;
    .operate {
      position: absolute;
      right: 10px;
    }
    .label {
      padding-right: 5px;
      width: 100px;
      padding-left: 20px;
    }
  }
}
</style>
