import { FormConfig, TableColumn } from '@/typing'
export const formList: Array<FormConfig> = [
  {
    type: 'Input',
    label: '箱子号',
    prop: 'wmsTools'
  },
  {
    type: 'Input',
    label: '图纸条码号',
    prop: 'pictNum'
  },
  {
    type: 'Input',
    label: '库存条码号',
    prop: 'imBarcode'
  }
]
export const showFormList: Array<FormConfig> = [
  { label: '机加件', prop: 'sjpno', type: 'Text' },
  { label: '条码', prop: 'barcode', type: 'Text' },
  { label: '描述', prop: 'zzdoex', type: 'Text' },
  { label: '过账日期', prop: 'postDate', type: 'Calendar' }
]
export const tableColumn: TableColumn[] = [
  { label: '条码', prop: 'barcode', type: 'Table/CheckBox' },
  { label: '物料编号', prop: 'matnr' },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '领料数量', prop: 'erfmg', type: 'Table/Number'},
  // { label: '工厂库位', prop: 'werks' },
  // { label: '生产订单', prop: 'xchpf' },
  // { label: 'ECN号', prop: 'retext' },
  { label: ' ', prop: 'bottom_clean' }
]

//  【成本中心】数据格式化
export function formatWorkCenter(data: any, val: any) {
  return `${data.kostl} | ${data.ktext}`
}

// 【目标库位】数据格式化：工厂 | 库位
export function formatLgort(data: any, val: any) {
  return `${data.werks} | ${data.lgort}`
}
// 【生产批次/工位】数据格式化：生产批次 / 工位
export function formatCharg(data: any, val: any) {
  return `${data.charg} / ${data.workp}`
}
// 【收货数量】数据格式化：收货数量 * 1 = 收货数量
export function formatErfmg(data: any, val: any) {
  return `${val}  × 1 = ${Number(val)}`
}
