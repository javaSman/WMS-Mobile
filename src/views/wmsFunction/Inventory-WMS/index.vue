<template>
  <Table :column="tableColumn" :tableData="list" @clickRow="clickRow" />
  <van-action-bar>
    <van-action-bar-button type="default" text="刷新" @click="handleClear" />
  </van-action-bar>
</template>

<script lang="ts">
// 盘点单-WMS
const cachedName = 'WMSFunction.Inventory-WMS'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import { onMounted, ref, getCurrentInstance, ComponentInternalInstance } from 'vue'
import Table from '../components/Table.vue'
import { tableColumn } from './config'

let _this = getCurrentInstance() as ComponentInternalInstance
let el = _this.appContext.config.globalProperties

// 列表数据
let list = ref<any[]>([])

let clickRow = (row: any) => {
  el?.$router.push({ name: 'WMSFunction.InventoryDetails-WMS', query: { a: row.a } })

  console.log(row)
}
onMounted(() => {
  // list.value = [
  //   { a: '1', b: '2', c: '3' },
  //   { a: '1', b: '2', c: '3' },
  //   { a: '1', b: '2', c: '3' },
  //   { a: '1', b: '2', c: '3' }
  // ]
})
// 清空
function handleClear() {}
</script>
