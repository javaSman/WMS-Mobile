import { FormConfig, TableColumn } from '@/typing'
import { formatCharg, formatLgort, formatErfmgMultiple } from '@/views/dict'

export const formList: Array<FormConfig> = [
  {
    type: 'Input',
    label: '条码',
    prop: 'imBarcode'
    // rules: [{ required: true, message: '请输入条码', trigger: 'onBlur' }]
  }
]
export const showFormList: Array<FormConfig> = [
  { label: '送货条码', prop: 'delivnum', type: 'Text' },
  { label: '送货单号', prop: 'sgtxt4', type: 'Text' },
  { label: '供应商', prop: 'lifnrNam', type: 'Text' },
  { label: '采购订单', prop: 'ebeln', type: 'Text' },
  { label: '件数', prop: 'prtmg', type: 'Text' },
  { label: '过账日期', prop: 'postDate', type: 'Calendar' }
]
export const tableColumn: TableColumn[] = [
  { label: '订单行', prop: 'posnr', type: 'Table/CheckBox' },
  { label: '条码', prop: 'objnr' },
  { label: '采购订单', prop: 'ebeln' },
  { label: '目标库位', prop: 'lgort', formatter: formatLgort },
  { label: '物料编号', prop: 'matnr' },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '收货数量', prop: 'erfmg', formatter: formatErfmgMultiple },
  { label: '生产批/工位', prop: 'charg', formatter: formatCharg },
  { label: 'ECN号', prop: 'ngeln' }
]
