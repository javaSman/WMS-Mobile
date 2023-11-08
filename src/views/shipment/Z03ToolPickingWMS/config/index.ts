import { FormConfig, TableColumn } from '@/typing'
import { formatLgort, formatMaterial, formatWorkCenter } from '@/views/dict'
export const formList: Array<FormConfig> = [
  {
    type: 'Input',
    label: '领料单号',
    prop: 'imBarcode'
    // rules: [{ required: true, message: '请输入领料单号', trigger: 'onBlur' }]
  }
]
export const showFormList: Array<FormConfig> = [{ label: '过账日期', prop: 'postDate', type: 'Calendar' }]
export const tableColumn: TableColumn[] = [
  { label: '条码', prop: 'barcode', type: 'Table/CheckBox' },
  { label: '箱子号', prop: 'wmsTools', type: 'CustomSlot', slot: 'wmsTools' },
  { label: '箱子号', prop: 'locationId', type: 'CustomSlot', slot: 'locationId' },
  { label: '工厂库位', prop: 'werks', formatter: (data: any) => formatLgort(data) },
  { label: '成本中心', prop: 'kostl', formatter: (data: any) => formatWorkCenter(data) },
  { label: '物料编号', prop: 'matnr', formatter: (data:any) => formatMaterial(data)},
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '领料数量', prop: 'erfmg' },
  { label: '领料人', prop: 'operator' },
  { label: '备注', prop: 'retext' }
]

