import { FormConfig, TableColumn } from '@/typing'
import { formatLgort, formatEbeln, formatMatnr } from '@/views/dict'

export const formList: Array<FormConfig> = [
  {
    type: 'Input',
    label: '条码',
    prop: 'imBarcode'
    // rules: [{ required: true, message: '请输入条码', trigger: 'onBlur' }]
  }
]
export const showFormList: Array<FormConfig> = [
  { label: '退货单号', prop: 'x1', type: 'Text' },
  { label: '供应商', prop: 'lifnr', type: 'Text' },
  { label: '过账日期', prop: 'postDate', type: 'Calendar' }
]
export const tableColumn: TableColumn[] = [
  { label: '订单行', prop: 'ebeln', type: 'Table/CheckBox', formatter: formatEbeln },
  { label: '条码', prop: 'barcode' },
  { label: '目标库位', prop: 'lgort', formatter: formatLgort },
  { label: '物料编号', prop: 'matnr', formatter: formatMatnr },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '收货数量', prop: 'erfmg', type: 'Table/Number', multiple: 1 },
  { label: '生产批/工位', prop: 'prodbatch', formatter: (data: any, val: any) => formatCharg(data, val) },
  { label: '备注', prop: 'retext' }
]

// 【生产批/工位】数据格式化：生产批 / 工位
export function formatCharg(data: any, val: any) {
  return `${data.prodbatch || 1} / ${data.workp}`
}
