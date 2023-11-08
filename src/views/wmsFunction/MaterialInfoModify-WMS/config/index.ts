import { FormConfig, TableColumn } from '@/typing'

export const formList: Array<FormConfig> = [
  // { type: 'Input', label: '物料编号', prop: 'materialNo' },
  { type: 'Input', label: '条码', prop: 'imBarcode' }
]
export const showFormList: Array<FormConfig> = [{ label: '过账日期', prop: 'postDate', type: 'Calendar' }]
export const tableColumn: TableColumn[] = [
  { label: '物料编号', prop: 'materialNo', type: 'Table/CheckBox' },
  { label: '物料描述', prop: 'materialDesc', type: 'Table/Notice' },
  {
    label: '容量',
    prop: 'capacity',
    type: 'Table/NumberInput',
    rules: [{ required: true, message: '请输入容量', trigger: 'onBlur' }]
  },
  { label: '上立体库', prop: 'cube', type: 'CustomSlot', slot: 'checkbox' },
  {
    label: '库存预警数',
    prop: 'safetyQty',
    type: 'Table/NumberInput',
    rules: [{ required: true, message: '请输入库存预警数', trigger: 'onBlur' }]
  },
  {
    label: '单位数量',
    prop: 'unitQty',
    type: 'Table/NumberInput',
    rules: [{ required: true, message: '请输入单位数量', trigger: 'onBlur' }]
  } // 字段待定
]
