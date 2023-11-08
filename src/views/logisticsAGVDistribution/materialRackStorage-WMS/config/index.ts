import { FormConfig } from '@/typing'

export const formList: Array<FormConfig> = [
    { type: 'Dropdown', label: '仓库', prop: 'warehouseNo', options: [] },
    { type: 'Input', label: '料架号', prop: 'materialShelfNo' },
    { type: 'Input', label: '待入库区', prop: 'locationNo', disabled: true }
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
