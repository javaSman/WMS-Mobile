import { FormConfig, TableColumn } from '@/typing'
export const formList: Array<FormConfig> = [
  {
    type: 'Input',
    label: '条码',
    prop: 'barcode',
    rules: [{ required: true, message: '请输入条码', trigger: 'onBlur' }]
  },
  {
    type: 'Text',
    label: '项目生产工位',
    prop: 'projectNum'
  }
]
export const showFormList: Array<FormConfig> = []
export const tableColumn: TableColumn[] = [
  { label: '物料编号', prop: 'idnrk' },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' }
]
