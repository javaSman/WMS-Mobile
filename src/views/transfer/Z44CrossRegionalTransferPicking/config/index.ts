import { FormConfig, TableColumn } from '@/typing'
import { formatLgortConnector, formatErfmg, formatProdbatch, formatMatnr } from '@/views/dict'
import { formatVstel, formatWerkt } from './../../Z43CrossRegionalTransferReceipt/config'

export const formList: Array<FormConfig> = [
  {
    type: 'Input',
    label: '条码',
    prop: 'imBarcode'
    // rules: [{ required: true, message: '请输入条码', trigger: 'onBlur' }]
  },
  { label: '单号', prop: 'reqno', type: 'Text' }
]
export const showFormList: Array<FormConfig> = [
  { label: '过账日期', prop: 'postDate', type: 'Calendar' }
]
export const tableColumn: TableColumn[] = [
  { label: '工厂库位', prop: 'lgort', type: 'Table/CheckBox', formatter: formatLgortConnector },
  { label: '调入区域', prop: 'vstel', formatter: formatVstel },
  { label: '生产批', prop: 'prodbatch', formatter: formatProdbatch },
  { label: '物料编号', prop: 'matnr', type: 'Table/RightBtn', formatter: formatMatnr, tableBtnParams: { btnText: '配件清单', loading: [] } },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '数量', prop: 'erfmg', formatter: formatErfmg },
  { label: '生产订单', prop: 'aufnr' },
  { label: '调出批次', prop: 'chart' },
  { label: '调出区域', prop: 'lfart' },
  { label: '调出库位', prop: 'werkt', formatter: formatWerkt }
]

