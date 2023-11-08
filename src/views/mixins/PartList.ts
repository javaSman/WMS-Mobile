import { ITableBtnParams, TableColumn } from '@/typing'
import { MISWMSAPI } from '@/api/generalAPI'
import { _showFailToast } from '@/utils/message'

const partListAPIName = 'receivingAndWarehousing/findDetailListByMatnr'

/**
 * 按钮-配件清单
 * @param key 字段名
 * @param data 整条数据
 * @param index 索引
 * @param mapState 页面传过来的变量，包含partsList，visible
 * @param tableBtnParams 需要改loading的对象
 */
export function getPartList(key: string, data: any, index: number, mapState: any, tableBtnParams: ITableBtnParams) {
  let matnr = data[key]
  if (!matnr) {
    _showFailToast('物料号不存在')
    return
  }

  tableBtnParams.loading[index] = true
  MISWMSAPI.post(partListAPIName, { matnr: Number(matnr) + '' })
    .then((res) => {
      if (res && res.success) {
        mapState.partList = res.data as any[]
        mapState.visible = true
      } else {
        _showFailToast(res.data as string)
      }
    })
    .finally(() => {
      tableBtnParams.loading[index] = false
    })
}

/**
 * 配件清单表头
 */
export const partListTableColumn: TableColumn[] = [
  { label: '产品名', prop: 'productname' },
  { label: '规格/型号', prop: 'specification' },
  { label: '单位', prop: 'unit' },
  { label: '数量', prop: 'quantity' }
]
