import { url_api } from '@/api/generalAPI'
export type ListType = 'text' | 'picture' | 'picture-card'
/** 上传类型 */
export interface IUpSetting {
  /** 传入包括代理在内的完整地址 */
  apiName: string
  /** 上传时额外的参数 */
  params?: object
  /** 上传是否可以多选 */
  multiple?: boolean
  /** 上传文件可接受的类型 */
  accept?: string
  /** 上传按钮的文本 */
  text?: string
  /** 代理 */
  agent?: string
}

export class UploadSetting implements IUpSetting {
  apiName = ''
  params = {}
  multiple = false
  accept = 'xlsx, xls'
  text = '导入'
  constructor(val?: IUpSetting) {
    if (val) {
      this.apiName = val.agent ? `/${val.agent}/${val.apiName}` : `/${url_api}/${val.apiName}`
      this.params = val.params || {}
      this.multiple = val.multiple || false
      this.accept = val.accept || 'xlsx, xls'
      this.text = val.text || '导入'
    } else {
      this.apiName = ''
    }
  }
}
export interface IUploadParams {
  /** 允许上传文件的最大数量 */
  limit: number
  /** 文件列表的类型 */
  listType: ListType
  /** 接受上传的文件类型,如'.xls,.xlsx' */
  accept: string
  /** 接受上传的文件大小，单位MB */
  fileSize: number
  /** 拖拽 */
  drag?: boolean
  /** 是否显示提示 */
  showTips?: boolean
}

export interface IUpload{
  fileType?: string // uoload type
  fileSize?: any // upload
  limit?: number // upload 上传控件使用，限制文件的数量
  uploadParams?: IUploadParams // upload 上传列表参数
}
