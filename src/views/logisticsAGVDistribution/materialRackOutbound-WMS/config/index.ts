import { FormConfig, TableColumn } from '@/typing'

export const formList: Array<FormConfig> = [
  { type: 'Input', label: '项目号', prop: 'projectNo' },
  { type: 'Dropdown', label: '批次', prop: 'batchNo', options: [] },
  { type: 'Dropdown', label: '工位号', prop: 'stationNo', options: [] },
  { type: 'Dropdown', label: '仓库', prop: 'warehouseNo', options: [] },
  { type: 'Dropdown', label: '站点', prop: 'agvSite', options: [] }
]

// export const showInfo = [
//   { label: '一般库存', prop: 'x5' },
//   { label: '非限制', prop: 'exLabst' },
//   { label: '质检', prop: 'exInsme' },
//   { label: '在途', prop: 'exUmlme' },
//   { label: '委外库存O', prop: 'exWwqty' },
//   { label: '销售库存E', prop: 'x10' },
//   { label: '非限制', prop: 'exKabst' },
//   { label: '质检', prop: 'exKnsme' }
// ]

export const tableColumn: TableColumn[] = [
  { label: '料架号', prop: 'materialShelfNo', type: 'Table/RadioBox' },
  { label: '箱子号', prop: 'boxId' },
  { label: '料架状态', prop: 'materialShelfStatus' }
]
