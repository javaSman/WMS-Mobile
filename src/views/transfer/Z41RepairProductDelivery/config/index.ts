import { FormConfig, TableColumn } from '@/typing'
import { formatLgortConnector, formatEbeln, formatMatnr, formatErfmg } from '@/views/dict'

export const formList: Array<FormConfig> = [
  {
    type: 'Input',
    label: '条码',
    prop: 'imBarcode'
    // rules: [{ required: true, message: '请输入条码', trigger: 'onBlur' }]
  }
]
export const showFormList: Array<FormConfig> = [
  { label: '送货单号', prop: 'reqno', type: 'Text' },
  { label: '供应商', prop: 'lifnr', type: 'Text' },
  { label: '过账日期', prop: 'postDate', type: 'Calendar' }
]
export const tableColumn: TableColumn[] = [
  { label: '工厂库位', prop: 'werks', type: 'Table/CheckBox', formatter: formatLgortConnector },
  { label: '采购订单', prop: 'ebeln', formatter: formatEbeln },
  {
    label: '物料编号',
    prop: 'matnr',
    type: 'Table/RightBtn',
    formatter: formatMatnr,
    tableBtnParams: { btnText: '配件清单', loading: [] }
  },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '收货数量', prop: 'erfmg', formatter: formatErfmg }
]
