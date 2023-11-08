import { FormConfig } from '@/typing'

export const formList: Array<FormConfig> = [
  { type: 'Dropdown', label: '仓库', prop: 'storehouse' },
  { type: 'Input', label: '箱子号', prop: 'boxId' },
  { type: 'Input', label: '码头', prop: 'wharf' },
  { type: 'Dropdown', label: '目标位置', prop: 'stations', options: [] }
]
