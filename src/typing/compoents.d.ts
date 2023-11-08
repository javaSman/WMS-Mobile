import { TableColumn } from './pageConfig'
import { IDictObj } from './dict'
export type Trigger = 'click' | 'hover'

/** compoents 通用组件选择项类型声明 */
export interface ICom_Config {
  label: string
}
export interface option {
  value: string
  label: string
  children?: Option[]
}

// // 树形控件的数据类型
// export interface Tree {
//   level: number
//   key: string | number
//   label: string
//   value: number
//   title: string
//   children?: Tree[]
// }

// export interface TreeNode {
//   key: string | number
//   level: number
//   parent?: TreeNode
//   children?: TreeNode[]
//   data: any
//   disabled?: boolean
//   label?: string
//   isLeaf?: boolean
// }

/** 时间选择器 */
export interface IDatePicker {
  // dateType?: string // 时间选择器类型,用于表格
  valueFormat?: string // 时间选择器-值格式化
  labelFormat?: string // 时间选择器-显示格式化
  disabledDate?: (time: Date) => boolean // 判断该日期是否被禁用的函数
  shortcuts?: Array<any> // 快捷选项
  startPlaceholder?: string // 时间
  endPlaceholder?: string // 时间
  startProp?: string // 时间
  endProp?: string // 时间
  separatorStr?: string // 时间 分割
}
/** 日期选择器 */

// TODO:以下：级联选择器的，后续优化
export interface ICascader {
  collapse?: boolean
  showAllLevels?: boolean
  propsConfig?: any
  valueProp?: string
  expandTrigger?: Trigger
  emitPath?: boolean
  checkStrictly?: boolean
  lazy?: boolean
}

/** 选择器 select */
export interface ISelect {
  options?: Array<any>
  optProps?: IDictObj // 选择器 key 转义
}
/** 下拉框多选参数 */
export interface ISelectParams {
  /** loading */
  loading?: boolean
  // TODO: 考虑是否增加此属性，禁用的选项
  // disabledOptions?: Array<string | number>
  // 下拉多选
  /** 是否折叠 */
  collapseTags?: boolean
  /** 最多可选择多少项 */
  multLimit?: number
  // 下拉单选
  /** 是否允许远程搜索 */
  remote?: boolean
  /** 远程搜索方法，必须要有返回值 */
  remoteMethod?: (val: string | null) => Promise<any[]>
}

/** 数字输入框 number-input*/
export interface IInputNumber {
  min?: number // 数字组件
  max?: number // 数字组件
  precision?: number // 数字组件
  step?: number // 数字输入框
}

/** 文本域 */
export interface ITextArea {
  minRows?: number // 文本域
  maxRows?: number // 文本域
  resize?: string // 文本域  控制是否能被用户缩放
}
/** 输入框后置按钮 */
export interface IInputAppendBtn {
  loading: boolean // 按钮的 loading
  btnLabel: string // 后置按钮文本
  clickFun: string // 后置按钮方法名
}
/** 下拉网格参数 */
export interface ISelectCombogridParams {
  loading: boolean
  /** 表格参数 */
  tableParams: TableColumn[] // TableColumn[]
  /** 数据总数，分页使用 */
  total: number
  /** 获取选项，
   * @param page 当前页
   * @param val 搜索框的值 */
  getList: (page: number, val: string) => void
}
// 树形下拉框默认设置
export interface ISelectTreeDefaultProps {
  // 指定子节点字段
  children: string
  // 指定显示为 label 的字段
  label: string
  // 指定唯一值的字段
  id: string
  // 指定最后子节点字段
  isLeaf?: string
  // 指定禁用的字段
  disabled?: string
}
/** 开关 */
export interface ISwitchProps {
  active: string | number | boolean
  inactive: string | number | boolean
  activeText?: string
  inactiveText?: string
}
/** layout 对象 */
export interface ILayout {
  gutter?: number
  span?: number
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
}
/** 复选框 */
export interface Icheck {
  hasSelectAll?: boolean
}
