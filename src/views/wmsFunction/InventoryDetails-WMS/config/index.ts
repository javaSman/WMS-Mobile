import { FormConfig, TableColumn } from '@/typing'

export const formList: Array<FormConfig> = [
  { type: 'Input', label: '箱子号', prop: 'boxNo', rules: [{ required: true, message: '请输入箱子号', trigger: 'onBlur' }] }
]
export const showFormList: Array<FormConfig> = [{ label: '过账日期', prop: 'postDate', type: 'Calendar' }]
export const tableColumn: TableColumn[] = [
  { label: '箱子号', prop: 'boxNo', type: 'Table/CheckBox' },
  { label: '货位', prop: 'locationNo' },
  { label: '物料编号', prop: 'materialNo' },
  { label: '物料描述', prop: 'materialDesc', type: 'Table/Notice' },
  { label: '数量', prop: 'quantity', type: 'Table/NumberInput', rules: [{ required: true, message: '请输入数量', trigger: 'onBlur' }] }
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
