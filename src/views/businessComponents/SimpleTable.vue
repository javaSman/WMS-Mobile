<template>
  <div :style="{ background: background }">
    <div class="item" v-for="item in columns" :key="item.prop">
      <div class="label">{{ item.label }}</div>
      <div class="content">{{ showMsg[item.prop] }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    columns: Array<{ label: string; prop: string }>
    showMsg: any
    background?: string
  }>(),
  {
    columns: () => [
      {
        label: '测试标题',
        prop: 'test'
      }
    ],
    showMsg: {
      test: '测试数据'
    },
    background: '#fff'
  }
)
</script>

<style lang="scss" scoped>
.item {
  line-height: 25px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0 5px;
  border: 1px solid #ccc;
  font-size: 12px;
  .label {
    flex: 1;
    text-align: left;
    border-right: 1px solid #ccc;
  }
  .content {
    flex: 4;
    text-align: left;
    padding-left: 5px;
  }
}
</style>
