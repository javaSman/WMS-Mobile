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
  { label: '物料编号', prop: 'materialNo', type: 'Table/CheckBox' },
  { label: '物料描述', prop: 'materialDesc', type: 'Table/Notice' },
  { label: '数量', prop: 'quantity' }
]
