import { DefineComponent, Ref } from 'vue'
import { IGetListParams, IListQuery } from './indexSys/typing'
export function initFilter(listQuery: Ref<IListQuery>, table: Ref<DefineComponent>, getList: (val?: IGetListParams) => void) {
  /** 重置
   * 清空所有查询条件-传参:0-新增、导入、重置操作；
   * 保留原有查询条件-不传参-修改、批量修改等不影响数据条数的操作；删除操作；
   */
  // console.log(listQuery)
  const reset = (val?: number) => {
    if (val === 0) {
      // 清空所有查询条件，修改为默认值
      // pageNo = 1
      if (table) {
        // table.$refs.table.clearSort()
      }
      listQuery.value = {
        pageNo: 1, // 页码
        pageSize: listQuery.value.pageSize // 一页显示数据条数
      }
    } else if (val === 1) {
      // 查询条件不修改、仅页码修改为第一页,查询为第一页
      // pageNo = 1
      listQuery.value.pageNo = 1
    }
    // 不传参，保留原有查询条件、页码
    getList({ page: 1 })
  }
  return {
    reset,
    listQuery
  }
}
