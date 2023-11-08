import { FormConfig, TableColumn } from '@/typing'
import { formatProdbatch, formatErfmg, formatMatnr, formatLgort } from '@/views/dict'

export const formList: Array<FormConfig> = [
  { type: 'Input', label: '转入箱子', prop: 'targetBoxID', rules: [{ required: true, message: '请输入转入箱子', trigger: 'onBlur' }] },
  { type: 'Input', label: '区域', prop: 'locationID', rules: [{ required: true, message: '请输入区域', trigger: 'onBlur' }] },
  { type: 'Input', label: '转出箱子', prop: 'boxID', rules: [{ required: true, message: '请输入转出箱子', trigger: 'onBlur' }] },
  { type: 'Input', label: '领料单号', prop: 'imBarcode' }
]
export const showFormList: Array<FormConfig> = [
  { label: '过账日期', prop: 'postDate', type: 'Calendar' }
]
export const tableColumn: TableColumn[] = [
  { label: '制单号', prop: 'reqno', type: 'Table/CheckBox' },
  { label: '转入条码', prop: 'objnr' },
  { label: '工厂库位', prop: 'lgort', formatter: formatLgort },
  { label: '物料编号', prop: 'idnrk', formatter: formatMatnr },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '生产订单', prop: 'aufnr' },
  { label: '领料数量', prop: 'erfmg', formatter: formatErfmg },
  { label: '生产批', prop: 'prodbatch', formatter: formatProdbatch },
  { label: 'ECN号', prop: 'ngeln' }
]
