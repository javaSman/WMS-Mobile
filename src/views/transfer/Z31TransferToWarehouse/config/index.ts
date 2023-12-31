import { FormConfig, TableColumn } from '@/typing'
import { formatErfmg, formatMatnr, formatLgortConnector } from '@/views/dict'

export const formList: Array<FormConfig> = [
  {
    type: 'Input',
    label: '条码',
    prop: 'imBarcode'
    // rules: [{ required: true, message: '请输入条码', trigger: 'onBlur' }]
  }
]
export const showFormList: Array<FormConfig> = [
  { label: '出库单号', prop: 'reqno', type: 'Text' },
  { label: '过账日期', prop: 'postDate', type: 'Calendar' }
]
export const tableColumn: TableColumn[] = [
  { label: '工厂库位', prop: 'lgort', type: 'Table/CheckBox', formatter: formatLgortConnector },
  { label: '物料编号', prop: 'matnr', formatter: formatMatnr },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '销售订单', prop: 'kdauf' },
  { label: '交货单号', prop: 'vbelv', formatter: formatVbelv },
  { label: '出库数量', prop: 'erfmg', formatter: formatErfmg },
  { label: '生产批', prop: 'prodbatch' },
  { label: '批次号码', prop: 'charg' },
  {
    label: '领料人',
    prop: 'operator',
    type: 'Table/RightBtn',
    tableBtnParams: { btnText: '序列号', loading: [], icon: 'scan' }
  }
]

// 【交货单号】数据格式化vbelv posnv
export function formatVbelv(data: any, val: any) {
  return `${data.vbelv}-${data.posnv}`
}

export const SNFormList: Array<FormConfig> = [{ label: '条码', prop: 'equnr', type: 'Input' }]
export const SNTableColumn: TableColumn[] = [
  { label: '序列号', prop: 'equnr' },
  { label: '项目/生产批', prop: 'proje', formatter: formatterProje },
  { label: '物料编号', prop: 'matnr' }
]

function formatterProje(data: any) {
  return `${data.proje}/${data.equnr}`
}
