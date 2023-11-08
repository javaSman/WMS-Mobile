import { FieldRule, FieldTextAlign } from 'vant'

export interface FormConfig {
  label: string
  prop: string
  type: string
  unique?: boolean // 编辑不能修改
  tip?: string
  isHide?: boolean
  rules?: FieldRule[]
  placeholder?: string
  disabled?: boolean

  blur?: (val: any) => void
  enter?: (val: any) => void
  change?: (val: any) => void
  /** 自定义插槽名称，type = 'CustomSlotForm' 时用 */
  slot?: string

  // selectParams: ISelect
  options?: any[]
  optProps?: IDictObj // 选择器 key 转义

  inputParams?: IInputParams
  numberParams?: INumberParams
  calendarParams?: ICalendarParams
}

export interface IInputParams{
  maxlength?: number
  leftIcon?: string
  rightIcon?: string
  btnLabel?: string // 按钮插槽中按钮的文本
  clickFun?: string
  align?: FieldTextAlign // 输入框对齐方式
  autosize?: boolean // 高度自适应，type 为 Textarea 时有效
  rows?: number // type 为 Textarea 时有效
}
export interface INumberParams{
  max?: number
  min?: number
  precision?: number
  step?: number
}
export interface ISelectParams{
  loading?: boolean
}
export interface ICalendarParams{
  minDate?: Date
  maxDate?: Date
  // 以下，适合日期范围
  maxRange?: number // 选择日期的最大范围
  prompt?: string // 范围选择超过最多可选天数时的提示文案
}

// export interface ISelect{
//   options?: any[]
//   optProps?: IDictObj // 选择器 key 转义
// }

export interface IDictObj {
  label: string
  value: string
  suffix?: string
}

export interface TableColumn{
  label: string
  prop: string
  type?: string
  formatter?: (data: any, val: any) => any
  tableBtnParams?: ITableBtnParams // type 类型为 Table/RightBtn 的时候使用
  multiple?:number // type类型是Number时使用，多少倍的意思
  slot?: string // 自定义插槽名称，type = 'CustomSlot' 时用
  rules?: FieldRule[],
  tableNumberParams?: ITableNumberParams
}
export interface ITableBtnParams{
  // clickFun: string
  loading: boolean[]
  btnText?: string
  icon?: string // 图标名称
}
/** Table数字输入框 */
export interface ITableNumberParams{
  /**
   *  单位字段
   */
  exProp?: string
}
