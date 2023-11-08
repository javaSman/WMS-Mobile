import { FormConfig } from '@/typing'
import { Box } from '@/views/dict'

export const formList: Array<FormConfig> = [
  { type: 'Input', label: '卡板', prop: 'boxNo'},
  { type: 'Input', label: '当前卡板状态', prop: 'dqstatus', disabled: true },
  { type: 'Dropdown', label: '更新载具装载状态', prop: 'status', options: Box }
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
