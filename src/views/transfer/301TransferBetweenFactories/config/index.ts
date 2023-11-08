import { FormConfig, TableColumn } from '@/typing'
import { formatProdbatch, formatErfmg, formatLgort, formatLgott } from '@/views/dict'

export const formList: Array<FormConfig> = [
  {
    type: 'Input',
    label: '条码',
    prop: 'imBarcode'
    // rules: [{ required: true, message: '请输入条码', trigger: 'onBlur' }]
  },
  { type: 'Text', label: '调拨单号', prop: 'reqno' }
]
export const showFormList: Array<FormConfig> = [
  { label: '过账日期', prop: 'postDate', type: 'Calendar' }
]
export const tableColumn: TableColumn[] = [
  { label: '物料编号', prop: 'matnr', type: 'Table/CheckBox', formatter: formatMatnr },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '项目信息', prop: 'prodbatch', formatter: formatProdbatch},
  { label: '转移数量', prop: 'erfmg', formatter: formatErfmg },
  { label: '来源库位', prop: 'lgort', formatter: formatLgort },
  { label: '目标库位', prop: 'lgott', formatter: formatLgott },
  { label: '备注', prop: 'retext' }
]
export function formatMatnr(data: any, val: any) {
  return `${Number(val)} | ${data.rspos}`
}

