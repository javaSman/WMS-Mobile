// 字典接口
export interface IDict<T = object> {
  /** 任意属性 */
  [key: string]: T[]
}
/**
 * 批量请求字典值类型
 * */
export interface IDictByCode {
  value: string
  code: string
}
// export interface IDataMap extends IViewModule {
//   /** 任意属性 */
//   [key: string]: any
// }
export interface IDictObj {
  label: string
  value: string
  suffix?: string
}
