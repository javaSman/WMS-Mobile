import { FormConfig, TableColumn } from '@/typing'
export const formList: Array<FormConfig> = [
  {
    type: 'Dropdown',
    label: '仓库',
    prop: 'warehouseNo',
    options: [],
    optProps: { label: 'warehouseNo', value: 'warehouseNo' },
    rules: [{ required: true, message: '请选择仓库', trigger: 'onChange' }]
  },
  {
    type: 'Dropdown',
    label: '厂区',
    prop: 'areaId',
    options: [
    ],
    rules: [{ required: true, message: '请选择厂区', trigger: 'onChange' }]
  },
  {
    type: 'Input',
    label: '工厂',
    prop: 'werks'
  },
  {
    type: 'Text',
    label: '仓位',
    prop: 'locationId'
  },
  {
    type: 'Input',
    label: '箱子号',
    prop: 'wmsTools'
  },
  {
    type: 'Input',
    label: '条码',
    prop: 'imBarcode',
    rules: [{ required: true, message: '请输入领料单号', trigger: 'onBlur' }]
  }
]
export const showFormList: Array<FormConfig> = [{ label: '过账日期', prop: 'postDate', type: 'Calendar' }]
export const tableColumn: TableColumn[] = [
  { label: '条码', prop: 'objnr', type: 'Table/CheckBox' },
  { label: '物料编号', prop: 'matnr' },
  { label: '物料描述', prop: 'maktx', type: 'Table/Notice' },
  { label: '库存数量', prop: 'erfmg' },
  { label: '发料数量', prop: 'erfmg', type: 'Table/Number', multiple: 1 }
]
