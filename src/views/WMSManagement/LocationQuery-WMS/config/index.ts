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
  { type: 'Input', label: '区域', prop: 'locationNo', rules: [{ required: true, message: '请输入区域', trigger: 'onBlur' }] }
]
export const showFormList: Array<FormConfig> = [{ label: '过账日期', prop: 'postDate', type: 'Calendar' }]
export const tableColumn: TableColumn[] = [
  { label: '箱子号', prop: 'boxNo' },
  { label: '是否解绑', prop: '', type: 'Table/CheckBox' }
]
