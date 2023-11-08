import { FormConfig, TableColumn } from '@/typing'
// import { formatProdbatch, formatErfmg, formatMatnr } from '@/views/dict'

export const formList: Array<FormConfig> = [
  { type: 'Input', label: '卡板/箱号', prop: 'boxID' },
  { type: 'Input', label: '条码', prop: 'imBarcode' }
]
export const showFormList: Array<FormConfig> = [{ label: '过账日期', prop: 'postDate', type: 'Calendar' }]
export const tableColumn: TableColumn[] = [
  { label: '条码', prop: 'barcode', type: 'Table/CheckBox' },
  { label: '物料编号', prop: 'materialNo' },
  { label: '物料描述', prop: 'materialDesc', type: 'Table/Notice' },
  { label: '项目', prop: 'projectNo' },
  { label: '工位', prop: 'stationNo' },
  { label: '批次', prop: 'batch' },
  { label: '数量', prop: 'quantity' }
]
