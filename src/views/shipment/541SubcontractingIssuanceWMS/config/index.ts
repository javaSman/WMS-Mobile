import { FormConfig, TableColumn } from '@/typing'
export const formList: Array<FormConfig> = [
  {
    type: 'Input',
    label: '领料单号',
    prop: 'imBarcode'
    // rules: [{ required: true, message: '请输入领料单号', trigger: 'onBlur' }]
  }
]
export const showFormList: Array<FormConfig> = [
  { label: '卡板/箱子号', prop: 'delivnum', type: 'Text' },
  { label: '过账日期', prop: 'postDate', type: 'Calendar' }
]
export const tableColumn: TableColumn[] = [
  { label: '条码', prop: 'barcode', type: 'Table/CheckBox' },
  { label: '箱子号', prop: 'wmsTools', type: 'CustomSlot', slot: 'wmsTools' },
  { label: '区域', prop: 'locationId', type: 'CustomSlot', slot: 'locationId' },
  { label: '工厂库位', prop: 'werks', formatter: (data: any, val) => formatLgort(data, val) },
  { label: '成本中心', prop: 'kostl', formatter: (data: any, val) => formatWorkCenter(data, val) },
  { label: '物料编号', prop: 'matnr' },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '退料人', prop: 'operator' },
  { label: '发料数量', prop: 'erfmg', type: 'Table/Number', multiple: 1 }
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
