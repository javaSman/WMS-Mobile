import { FormConfig, TableColumn } from '@/typing'
export const formList: Array<FormConfig> = [
  {
    type: 'Input',
    label: '箱子号',
    prop: 'boxID',
    rules: [{ required: true, message: '请输入箱子号', trigger: 'onBlur' }]
  },
  { type: 'Input', label: '条码', prop: 'imBarcode' }
]
export const showFormList: Array<FormConfig> = [{ label: '过账日期', prop: 'postDate', type: 'Calendar' }]
export const tableColumn: TableColumn[] = [
  { label: '条码', prop: 'barcode', type: 'Table/CheckBox' },
  { label: '物料编号', prop: 'materialNo' },
  { label: '物料描述', prop: 'materialDesc', type: 'Table/Notice' },
  { label: '生产批/工位', prop: 'batchStation', formatter: formatChargWMS },
  { label: '数量', prop: 'quantity' }
]

/**
 * 格式化生产批/工位
 * @param data 整条数据
 * @returns 生产批 / 工位
 */
export function formatChargWMS(data: any) {
  if (!data.batch && !data.stationNo) return ''
  return `${data.batch || ''} / ${data.stationNo || ''}`
}
