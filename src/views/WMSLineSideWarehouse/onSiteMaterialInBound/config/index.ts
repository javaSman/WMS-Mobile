import { FormConfig, TableColumn } from '@/typing'
export const formList: Array<FormConfig> = [
  {
    type: 'Dropdown',
    label: '仓库',
    prop: 'warehouseNo',
    options: [],
    optProps: { label: 'warehouseNo', value: 'warehouseNo' },
    rules: [{ required: true, message: '请选择仓库', trigger: 'onChange' }]
  },
  {
    type: 'Input',
    label: '箱子号',
    prop: 'wmsTools'
  },
  {
    type: 'Input',
    label: '条码号',
    prop: 'imBarcode'
  },
  {
    type: 'Input',
    label: '区域',
    prop: 'locationId'
  }
]
export const showFormList: Array<FormConfig> = [
  { label: '过账日期', prop: 'postDate', type: 'Calendar' }
]
export const tableColumn: TableColumn[] = [
  { label: '行号', prop: 'index', type: 'Table/CheckBox' },
  { label: '条码', prop: 'barcode' },
  { label: '物料编号', prop: 'matnr' },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '生产批/工位', prop: 'productBatch' },
  { label: '数量', prop: 'erfmg', type: 'Table/Number', multiple: 1 },
  { label: '标签数量', prop: 'labelQty' }
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
