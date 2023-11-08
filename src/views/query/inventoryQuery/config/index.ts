import { FormConfig } from '@/typing'

export const formList: Array<FormConfig> = [
  { type: 'Input', label: '条码', prop: 'objnr', rules: [{ required: true, message: '请输入条码', trigger: 'onBlur' }] },
  { type: 'Input', label: '物料编号', prop: 'matnr', rules: [{ required: true, message: '请输入物料编号', trigger: 'onBlur' }] },
  {
    type: 'Dropdown',
    label: '工厂库位',
    prop: 'x2',
    options: [],
    rules: [{ required: true, message: '请选择工厂库位', trigger: 'onChange' }]
  },
  { type: 'Text', label: '物料描述', prop: 'maktx' },
  { type: 'Text', label: '总数', prop: 'exTtqty' }
]

export const showInfo = [
  { label: '一般库存', prop: 'x5' },
  { label: '非限制', prop: 'exLabst' },
  { label: '质检', prop: 'exInsme' },
  { label: '在途', prop: 'exUmlme' },
  { label: '委外库存O', prop: 'exWwqty' },
  { label: '销售库存E', prop: 'x10' },
  { label: '非限制', prop: 'exKabst' },
  { label: '质检', prop: 'exKnsme' }
]
