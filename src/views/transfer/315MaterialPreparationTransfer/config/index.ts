import { FormConfig, TableColumn } from '@/typing'
import { formatProdbatch, formatErfmg, formatMatnr } from '@/views/dict'

export const formList: Array<FormConfig> = [
  {
    type: 'Input',
    label: '条码',
    prop: 'imBarcode'
    // rules: [{ required: true, message: '请输入条码', trigger: 'onBlur' }]
  }
]
export const showFormList: Array<FormConfig> = [
  { label: '过账日期', prop: 'postDate', type: 'Calendar' }
]
export const tableColumn: TableColumn[] = [
  { label: '条码', prop: 'objnr', type: 'Table/CheckBox' },
  { label: '工厂库位', prop: 'lgort', formatter: formatLgort },
  { label: '物料编号', prop: 'matnr', formatter: formatMatnr },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '生产订单', prop: 'aufnr' },
  { label: '领料数量', prop: 'erfmg', formatter: formatErfmg },
  { label: '生产批', prop: 'prodbatch', formatter: formatProdbatch },
  { label: 'ECN号', prop: 'ngeln' }
]

// 【工厂库位】数据格式化：工厂-库位 | 行号
export function formatLgort(data: any, val: any) {
  return `${data.werks}-${data.lgort} | ${data.rspos}`
}
