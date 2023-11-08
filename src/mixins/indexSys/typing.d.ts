import {IDict} from '@/typing'
/** 页面参数 */
export interface IViewModule<T = object> {
  /** 接口模块名 */
  apiName: string
  /** 接口方法 */
  apiMethod?: string
  /** 打开对话框的标题 */
  dialogTitle?: string
  /** 是否打开对话框 */
  dialogFormVisible?: boolean
  /** 表单 */
  form?: T
  /** 表单全部标题（组合的） */
  formTitle?: string
  /** 是编辑/新增 */
  isEdit?: boolean
  /** Table组件 */
  tableRef?: any
  /** Table的选中行的明细Table的数据 */
  detailTable?: Array<any>
  /** 明细加载loading */
  detailListLoading?: boolean
  /** 明细Table */
  tableDetailRef?: any
  /** 暂时未知 */
  listToPage?: boolean
  /** 查询参数 */
  listQuery?: any
  /** 当前使用代理 */
  agentMes?: string
}

/** 分页 */
/** 查询参数 */
export interface IParams<T = any> {
  [key: string]: T
}
/** 页面查询变量 */
export interface IListQuery extends IParams {
  /** 当前页码 */
  pageNo: number
  /** 一页显示数据条数 */
  pageSize: number
  /** 排序字段 */
  // orderBy?: string
}
/** getList 参数 */
export interface IGetListParams {
  /** 页码 */
  page?: number | null
  /** 一页显示数据条数 */
  limit?: number | null
  /** 排序字段 */
  sorting?: string
  /** 查询变量 */
  listQuery?: IListQuery
}
/** 取消事件参数 */
export interface ICancelParams {
  /** 对话框的显示与隐藏 */
  dialogFormVisible: boolean
  /** 是否保存（用于窗口关闭判断） */
  isSave?: boolean
  /** 此次操作是否添加过数据 */
  hasAdd?: boolean
  /** 是否为编辑弹窗 */
  isEdit: boolean
}

/**
 * MES复用方法变量接口
 * */
export interface IViewModuleMes<T = object, D = object> {
  /** 显示Table组件，场景：列自定义 */
  tableShow: boolean
  /** table表格数组数据 */
  list: T[]
  /** 表格加载状态 */
  listLoading: boolean
  /** 表格查询参数 */
  listQuery: IListQuery
  /** 当前页码 */
  page: number
  /** 数据总数 */
  totalCount: number
  /** 表格选中数据 */
  multipleSelection: T[]
  /** 导出查询字段 */
  exportParams: object
  /** 导出loading */
  downloadLoading: boolean
  /** 用于远程搜索方法的返回值的存储 */
  remoteSearchData: IDict
}

