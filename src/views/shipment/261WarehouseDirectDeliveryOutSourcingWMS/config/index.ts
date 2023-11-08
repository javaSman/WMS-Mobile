import { FormConfig, TableColumn } from '@/typing'
import { formatLgort } from '@/views/dict'
export const formList: Array<FormConfig> = [
  {
    type: 'Dropdown',
    label: '仓库',
    prop: 'warehouseNo',
    options: [],
    optProps: { label: 'warehouseNo', value: 'warehouseNo' },
    rules: [{ required: true, message: '请选择仓库', trigger: 'onChange' }]
  },
  { type: 'Input', label: '来源载具', prop: 'boxID', rules: [{ required: true, message: '请输入来源载具', trigger: 'onBlur' }] },
  { type: 'Input', label: '目标载具', prop: 'targetBoxID', rules: [{ required: true, message: '请输入目标载具', trigger: 'onBlur' }] },
  { type: 'Input', label: '目标区域', prop: 'targetLocationID', rules: [{ required: true, message: '请输入目标区域', trigger: 'onBlur' }] },
  { type: 'Input', label: '领料单号', prop: 'imBarcode' }
]
export const showFormList: Array<FormConfig> = [{ label: '过账日期', prop: 'postDate', type: 'Calendar' }]
export const tableColumn: TableColumn[] = [
  { label: '条码', prop: 'barcode', type: 'Table/CheckBox' },
  { label: '工厂库位', prop: 'werks', formatter: (data: any) => formatLgort(data) },
  { label: '物料编号', prop: 'matnr' },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '领料数量', prop: 'erfmg' },
  { label: '生产批', prop: 'prodbatch' }
]
