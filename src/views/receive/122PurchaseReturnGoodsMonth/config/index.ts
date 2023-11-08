import { FormConfig, TableColumn } from '@/typing'
import { formatEbeln, formatProdbatch, formatLgort } from '@/views/dict'

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
  { label: '采购订单', prop: 'ebeln', type: 'Text' },
  { label: '过账日期', prop: 'postDate', type: 'Calendar' }
]
export const tableColumn: TableColumn[] = [
  { label: '订单行', prop: 'rspos', type: 'Table/CheckBox' },
  { label: 'PO#', prop: 'ebeln', formatter: formatEbeln },
  { label: '生产批/工位', prop: 'prodbatch', formatter: formatProdbatch },
  { label: '工厂库位', prop: 'lgort', formatter: formatLgort },
  { label: '物料编号', prop: 'matnr' },
  { label: '物料描述', prop: 'txz01', type: 'Table/Notice' },
  { label: '退货原因', prop: 'grtxt', formatter: (data: any, val: any) => formatGrtxt(data, val) },
  { label: '退货数量', prop: 'erfmg' }
]

// 【退货原因】
export function formatGrtxt(data: any, val: any) {
  return `${data.grtxt} | ${data.grund}`
}
