import { FormConfig, TableColumn } from '@/typing'
export const formList: Array<FormConfig> = [
  {
    type: 'Input',
    label: '项目号',
    prop: 'projectNum',
    rules: [{ required: true, message: '请输入项目号', trigger: 'onBlur' }]
  },
  {
    type: 'Input',
    label: '条码',
    prop: 'barcode',
    rules: [{ required: true, message: '请输入条码', trigger: 'onBlur' }]
  }
]
export const showFormList: Array<FormConfig> = []
export const tableColumn: TableColumn[] = [
  { label: '项目号', prop: 'proje' },
  { label: '工位', prop: 'workp' },
  { label: '物料编号', prop: 'matnr' },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '组件', prop: 'idnrk' },
  { label: '优先级', prop: 'prilv' },
  { label: '数量', prop: 'menge' }
]
