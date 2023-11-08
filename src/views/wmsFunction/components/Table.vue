<template>
  <div class="vant-table">
    <table cellspacing="0" style="width: 100%" class="table">
      <!-- <caption v-if="navShow" class="table-nav-bar">
        <div class="title">
          {{ tableTitle }}
        </div>
      </caption> -->
      <thead>
        <tr>
          <th v-for="(item, index) in column" :key="index" class="th">{{ item.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in tableData" :key="index" class="list-tr" @click="clickRow(item)">
          <td v-for="(context, i) in column" :key="i">{{ item[context.prop] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script lang="ts">
const cachedName = 'VantTable'
export default {
  name: cachedName
}
</script>
<script lang="ts" setup>
import { PropType } from 'vue'
let emits = defineEmits(['clickRow'])
let props = defineProps({
  tableTitle: { type: String, default: '' }, // 表头标题
  column: { type: Array as PropType<any[]>, default: () => [] }, // 表格字段列配置
  tableData: { type: Array as PropType<any[]>, default: () => [] }, // 表格数据
  navShow: { type: Boolean, default: false } // 是否显示表格头标题
})

let clickRow = (row: any) => {
  emits('clickRow', row)
}
</script>

<style scoped lang="scss">
// 表头样式
// .table-nav-bar {
//   background-color: unset;
//   color: #fff;
//   height: 40px;
//   line-height: 40px;
//   font-size: 16px;
//   max-width: 100%; // 标题的最大宽度
// }

// 标题加横线-------
// .title {
//   width: 200px;
//   height: 40px;
//   line-height: 40px;
//   text-align: center;
//   position: relative;
// }
// .title::after,
// .title::before {
//   position: absolute;
//   width: 35px;
//   height: 1px;
//   background: #fff;
//   content: '';
//   top: 20px;
// }
// .title::after {
//   left: 0;
// }
// .title::before {
//   right: 0;
// }

// -------标题加横线
table tbody {
  // height: 520px;
  display: block;
  overflow-y: scroll;
  // width: 100%;
}
table thead,
tbody tr {
  display: table;
  table-layout: fixed;
  width: 98%;
  // width: 100%;
}

table thead {
}

// 表格样式
.vant-table {
  text-align: left;
  // text-align: center;
  padding: 10px 10px 0px 10px;
  height: 630px;
  overflow: auto;
}
.vant-table {
  .table {
    border-radius: 0.185185rem;
    // border: 0px #000;
    // border-bottom-style: solid;
    border-collapse: collapse;
    .th,
    .list-tr {
      font-size: 10px; // 最小12号|待优化
      line-height: 30px;
      letter-spacing: 0px; // 文字间距
    }
    .th {
      background-color: unset;
      // text-align: center;
      color: unset;
      // border: 1px #000;
      // border-top-style: solid;
      height: 25px;
    }
    tbody tr {
      background-color: #fff;
      border: 1px solid #000;
      margin: 10px 0;
    }
    // tr:nth-child(even) {
    //   background-color: rgb(255 255 255 / 19%); // 设置表格行颜色
    // }
    // tr:nth-child(odd) {
    //   background-color: rgb(255 255 255 / 35%); // 设置表格行颜色
    // }
  }
}
</style>
