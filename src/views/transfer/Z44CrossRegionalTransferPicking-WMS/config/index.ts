import { FormConfig, TableColumn } from '@/typing'
import { formatLgortConnector, formatErfmg, formatProdbatch, formatMatnr } from '@/views/dict'
import { formatVstel, formatWerkt } from './../../Z43CrossRegionalTransferReceipt/config'

export const formList: Array<FormConfig> = [
  {
    type: 'Dropdown',
    label: '仓库',
    prop: 'warehouseNo',
    options: [],
    optProps: { label: 'warehouseNo', value: 'warehouseNo' },
    rules: [{ required: true, message: '请选择仓库', trigger: 'onChange' }]
  },
  { type: 'Input', label: '转入箱子', prop: 'targetBoxID', rules: [{ required: true, message: '请输入转入箱子', trigger: 'onBlur' }] },
  { type: 'Input', label: '转入区域', prop: 'targetLocationID', rules: [{ required: true, message: '请输入转入区域', trigger: 'onBlur' }] },
  { type: 'Input', label: '条码', prop: 'imBarcode' }
]
export const showFormList: Array<FormConfig> = [
  { label: '单号', prop: 'reqno', type: 'Text' },
  { label: '过账日期', prop: 'postDate', type: 'Calendar' }
]
export const tableColumn: TableColumn[] = [
  { label: '单号', prop: 'reqno', type: 'Table/CheckBox' },
  { label: '工厂库位', prop: 'lgort', formatter: formatLgortConnector },
  { label: '转出箱子', prop: 'boxID', type: 'Table/Input', rules: [{ required: true, message: '请输入转出箱子', trigger: 'onBlur' }] },
  { label: '转出区域', prop: 'locationId', type: 'Table/Input', rules: [{ required: true, message: '请输入转出区域', trigger: 'onBlur' }] },
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
