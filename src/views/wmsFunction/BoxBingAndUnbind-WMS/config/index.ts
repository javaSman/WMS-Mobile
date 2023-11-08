import { FormConfig } from '@/typing'

export const formList: Array<FormConfig> = [
  { type: 'Input', label: '箱子号', prop: 'boxNo', rules: [{ required: true, message: '请输入箱子号', trigger: 'onBlur' }] },
  { type: 'Input', label: '区域', prop: 'locationNo', rules: [{ required: true, message: '请输入区域', trigger: 'onBlur' }] }
]
export const showFormList: Array<FormConfig> = [{ label: '过账日期', prop: 'postDate', type: 'Calendar' }]
