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
    prop: 'boxID',
    rules: [{ required: true, message: '请输入箱子号', trigger: 'onBlur' }]
  },
  {
    type: 'Input',
    label: '区域',
    prop: 'locationID',
    rules: [{ required: true, message: '请输入区域', trigger: 'onBlur' }]
  },
  { type: 'Input', label: '条码', prop: 'imBarcode' }
]

export const showFormList: Array<FormConfig> = [{ label: '过账日期', prop: 'postDate', type: 'Calendar' }]

export const tableColumn: TableColumn[] = [
  { label: '条码', prop: 'barcode', type: 'Table/CheckBox' },
  { label: '物料编号', prop: 'materialNo' },
  { label: '物料描述', prop: 'materialDesc', type: 'Table/Notice' },
  { label: '生产批/工位', prop: 'batchStation', formatter: formatChargWMS },
  { label: '在库数量', prop: 'menge' },
  { label: '标签数量', prop: 'quantity' },
  {
    label: '数量',
    prop: 'newQuantity',
    type: 'Table/NumberInput',
    rules: [{ required: true, message: '请输入数量', trigger: 'onBlur' }]
  }
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
