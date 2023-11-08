/** 接口模型 */
export interface IViewResponse<T = IViewPageList | number | string | any[]> {
  result?: any
  success: boolean
  code: string
  msg: string
  message?: string
  data?: T
  datas?: any[]
  zipFlag: boolean
}
/** 接口data模型 */
export interface IViewPageList<T = any> {
  data: T[]
  title: T
  version: number
}
