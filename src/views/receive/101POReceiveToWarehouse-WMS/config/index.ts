import { FormConfig, TableColumn } from '@/typing'
import { formatCharg, formatLgort, formatErfmgMultiple, formatEbeln, formatMaterial } from '@/views/dict'

export const formList: Array<FormConfig> = [
  {
    type: 'Dropdown',
    label: '仓库',
    prop: 'warehouseNo',
    options: [],
    optProps: { label: 'warehouseNo', value: 'warehouseNo' },
    rules: [{ required: true, message: '请选择仓库', trigger: 'onChange' }]
  },
  { type: 'Input', label: '箱子号', prop: 'boxID', rules: [{ required: true, message: '请输入箱子号', trigger: 'onBlur' }] },
  { type: 'Input', label: '区域', prop: 'locationID', rules: [{ required: true, message: '请输入区域', trigger: 'onBlur' }] },
  { type: 'Input', label: '条码', prop: 'imBarcode' }
]
export const showFormList: Array<FormConfig> = [
  { label: '送货条码', prop: 'delivnum', type: 'Text' },
  { label: '送货单号', prop: 'sgtxt4', type: 'Text' },
  { label: '供应商', prop: 'lifnr', type: 'Text' },
  { label: '采购订单', prop: 'ebeln', type: 'Text' },
  { label: '件数', prop: 'prtmg', type: 'Text' },
  { label: '过账日期', prop: 'postDate', type: 'Calendar' }
]
export const tableColumn: TableColumn[] = [
  { label: '订单行', prop: 'ebelp', formatter: formatEbeln, type: 'Table/CheckBox' },
  { label: '目标库位', prop: 'lgort', formatter: formatLgort },
  { label: '物料编号', prop: 'matnr', formatter: formatMaterial },
  { label: '物料描述', prop: 'txZ01', type: 'Table/Notice' },
  { label: '收货数量', prop: 'erfmg', type: 'Table/NumberInput', formatter: formatErfmgMultiple },
  { label: '生产批/工位', prop: 'charg', formatter: formatCharg },
  { label: 'ECN号', prop: 'zzngeln' }
]
