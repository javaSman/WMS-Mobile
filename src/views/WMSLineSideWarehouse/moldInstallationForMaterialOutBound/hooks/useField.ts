import { getmaterialBarcodeInfo } from '@/api/system/common'
import { TableColumn } from '@/typing'
import { _showFailToast } from '@/utils/message'
import { ref } from 'vue'

/**
 * @description 用于控制和管理两个输入框的逻辑事件
 */
const useField = () => {
  // 当前编辑项
  let index = 0
  // 控制选择器是否显示
  const showPickerOfBatch = ref(false)
  const showPickerOfStation = ref(false)
  // 生产批弹出层数据源
  const batchPopColumn = ref<Array<{text:string, value:string}>>([])
  // 项目工位弹出层数据源
  const stationPopColumn = ref<Array<{text:string, value:string}>>([])

  /** 项目号回车事件 */
  const projectEnterHandler = async(val:string, index:number, tableData:any[]) => {
    let res = await getmaterialBarcodeInfo(null, val)
    if (res.success) {
      if (res.barcodeList.length > 0) {
        tableData[index].batchPopColumn = res.barcodeList.map((item:any) => ({
          text: item.batch,
          value: item.batch
        }))
        tableData[index].stationPopColumn = res.barcodeList.map((item:any) => ({
          text: item.stationNo,
          value: item.stationNo
        }))
      }
    } else {
      _showFailToast({message: res.message})
    }
  }

  /** 生产批回车事件 */
  const batchEnterHandler = async(val:{row:any, index:number, item:TableColumn}) => {
    if (val.row.projectNo) {
      // 调用接口获取数据，过滤筛选所有的生产批
      // tips 打开之前将当前行的弹出数据源赋值过去给用户选择
      batchPopColumn.value = val.row.batchPopColumn
      showPickerOfBatch.value = true
      index = val.index
    } else {
      _showFailToast({message: '请先输入项目号'})
    }
  }
  /** 项目工位回车事件 */
  const stationEnterHandler = (val:{row:any, index:number, item:TableColumn}) => {
    if (val.row.projectNo) {
      // TODO 这里原型要进行模糊搜索，但是后台现在只给了一个接口,所有的内容都在前端进行模糊搜索
      // TODO 用弹出层，好像没必要模糊搜索了
      stationPopColumn.value = val.row.stationPopColumn
      showPickerOfStation.value = true
      index = val.index
    } else {
      _showFailToast({message: '请先输入项目号'})
    }
  }
  /** 生产批弹出层选择器确认方法 */
  const onConfirmOfBatch = (val:string, tableData:any[]) => {
    tableData[index].batch = val
    showPickerOfBatch.value = false
  }
  /** 项目工位弹出层选择器确认方法 */
  const onComfirmOfStation = (val:string, tableData:any[]) => {
    tableData[index].stationNo = val
    showPickerOfStation.value = false
  }
  /** 生产批弹出层取消方法 */
  const onCancelOfBatch = (val:string, tableData:any[]) => {
    tableData[index].batch = val
    showPickerOfBatch.value = false
  }
  /** 项目工位弹出层取消方法 */
  const onCancelOfStation = (val:string, tableData:any[]) => {
    tableData[index].stationNo = val
    showPickerOfStation.value = false
  }
  return {
    batchEnterHandler,
    stationEnterHandler,
    showPickerOfBatch,
    showPickerOfStation,
    onConfirmOfBatch,
    onComfirmOfStation,
    batchPopColumn,
    stationPopColumn,
    projectEnterHandler,
    onCancelOfBatch,
    onCancelOfStation
  }
}
export default useField
