import { IForm, IFormExpand, ISelectCombogridParams, TableButton, ISelectTreeDefaultProps, ILayout, RuleConfig } from './page'
import { IUpload } from './upload'
export type BtnType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
export type StyleType = 'round' | 'plain' | 'circle'

export interface FormConfig {
  label: string
  prop: string
  type: string
  unique?: boolean // 编辑不能修改
  tip?: string
  isHide?: boolean
  rules: RuleConfig[]
  blur?: (val: string | number | null) => void // input blur
  enter?: (val: string | number | null) => void // input 回车
  /** 自定义插槽名称，type = 'CustomSlotForm' 时用 */
  slot?: string
}
export interface TableColumn extends IFormExpand, IForm {
  label: string
  prop: string
  type?: string
  align?: string
  sortAble?: boolean // TODO:这里应该全部小写
  showTootip?: boolean
  show?: boolean
  className?: string // 好像没用到
  required?: boolean
  fixed?: 'right' | 'left' | boolean

  options?: any[] // 字典选项，radio

  /** 自定义插槽名称，type = 'CustomSlot' 时用 */
  slot?: string

  title0?: string // popconfirm
  title1?: string // popconfirm
  confirmEvent?: string // popconfirm

  formatter?: (row: any, val: any) => void

  button?: Array<TableButton>

  /** Table中数字框，是否使用行中字段的最小值,row[useRowMin] */
  useRowMin?: string
  /** Table中数字框，是否使用行中字段的最大值,row[useRowMax] */
  useRowMax?: string
  /** 数字输入框,选择*/
  change?: (i: number, val: string | number, obj?: any) => void
  clearable?: boolean // input select
}
/** 表格行按钮 */
export interface TableBtn {
  permission: Array<string>
  btnItem: Array<TableBtnItem>
  width?: string
  label?: string
  fixed?: string
  // clickFunReverse?: string
}
export interface TableBtnItem {
  btnLabel: string
  btnType?: BtnType
  clickFun: string
  permission: Array<string>
  isHide: Array<boolean> // 按钮列是否隐藏按钮
  btnLoding?: Array<boolean>
  drop?: boolean // drop 是否下拉
  list?: Array<any> // drop
}
export interface Crud {
  add?: Array<string>
  edit?: Array<string>
  del?: Array<string>
  view?: Array<string>
  import?: Array<string>
  download?: Array<string>
  upload?: Array<string>
  audit?: Array<string>
  print?: Array<string>
  downloadTemplate?: Array<string>
}
/** 工具栏，非标按钮类型 */
export interface CrudButtonItems {
  label: string
  clickFun: string
  permission: string[]
  loading: boolean
  /** 按钮是否禁用-一般二次赋值使用 */
  disabled?: boolean
  /** 按钮禁用状态条件，是否单选，优先级小于disabled，true是单选，false是多选 */
  single?: boolean
  /** 按钮样式 */
  btnType?: BtnType
  /** 按钮风格样式 */
  styleType?: StyleType
  /** 按钮引用图表名称 */
  icon?: string
}
