import useStore from '@/store'
import deepClone from './deepClone'

const {user} = useStore()
/** 转换过账参数,postIn形式的 */
function postTransferPramamsForWmsInPostIn(oringinList:any[], type:string, barcodeKey?:string, materialDescKey?:string) {
  let _oringinList = deepClone(oringinList) as any[]
  return _oringinList.map(item => {
    return {
      boxID: item.wmsTools || item.boxID,
      materialID: item.matnr || item.idnrk || item.materialNo,
      materialDesc: materialDescKey ? item[materialDescKey] : item.txZ01,
      quantity: Number(item.erfmg) || Number(item.quantity), // 数字类型
      barcode: barcodeKey ? item[barcodeKey] : item.barcode || item.objnr, // 看谁有值就取谁
      oclas: type, // 与查询明细的imOclas参数保持一致
      stationID: '', // 不需要传参
      projectID: item.proje,
      batchID: item.prodbatch,
      mark: '', // 不需要传参
      resultMsg: '', // 不需要传参
      locationID: item.locationId,
      cardNo: user.user.account,
      cardName: user.user.name,
      poid: item.ebeln,
      poItemNo: item.ebelp,
      proofNumber: item.mblnr,
      ngeln: item.ngeln
    }
  })
}
/** 转换过账参数,outStock形式的 */
function postTransferPramamsForWmsInOutStock(oringinList:any[], type:string, barcodeKey?:string, materialDescKey?:string) {
  let _oringinList = deepClone(oringinList) as any[]
  return _oringinList.map(item => {
    return {
      boxID: item.wmsTools || item.boxID,
      receiveBoxID: item.receiveBoxID,
      materialID: item.matnr || item.idnrk || item.materialNo,
      materialDesc: materialDescKey ? item[materialDescKey] : item.txZ01,
      quantity: Number(item.erfmg) || Number(item.quantity), // 数字类型
      projectID: item.proje,
      barcode: barcodeKey ? item[barcodeKey] : item.barcode || item.objnr,
      batchID: item.prodbatch,
      oclas: type, // 与查询明细的imOclas参数保持一致
      locationID: item.locationId || '', // 仓位，也叫储位编号
      areaId: item.areaId, // 厂区编号
      whId: item.warehouseNo, // 仓库编号
      cardNo: user.user.account,
      cardName: user.user.name,
      poid: item.ebeln,
      poItemNo: item.ebelp,
      proofNumber: item.mblnr,
      werks: item.werks, // 工厂
      ngeln: item.ngeln,
      targetBoxID: item.targetBoxID,
      targetLocationID: item.targetLocationID
    }
  })
}

// 出库的过账参数详情
// {
//   "iM_OCLAS": "业务类型",
//   "iM_CARDNO": "当前登录人工号",
//   "iM_CARDNAME": "当前登录人姓名",
//   "WarehouseNo": "出库仓库编号",
//   "TargetWarehouseNo": "目标仓库编号", --不是必填
//   "wmsOutStockList": [
//     {
//       "boxID": "箱子号",
//       "receiveBoxID": "string",
//       "materialID": "明细中物料编号matnr",
//       "materialDesc": "明细中物料描述txZ01",
//       "quantity": 0, // 明细中数量erfmg，数字类型
//       "projectID": "明细中proje",
//       "barcode": "条码",
//       "batchID": "明细中prodbatch",
//       "oclas": "业务类型",
//       "locationID": "货位",
//       "areaId": "区域",
//       "whId": "仓库",
//       "cardNo": "当前登录账号",
//       "cardName": "当前登录账号姓名",
//       "poid": "明细中ebeln",
//       "poItemNo": "明细中cardmo",
//       "proofNumber": "明细中mblnr",
//       "werks": "明细中werks",
//       "ngeln": "明细中ngeln",
//       "targetBoxID": "目标载具编号",
//       "targetLocationID": "目标货位",
//     }
//   ],
//   "zxstXmbeStruList": [] // 勾选的明细数组，明细中需扫码的箱子号和区域不需在其中
// }

// 入库的过账明细详情
// {
//   'IM_OCLAS': '业务类型',
//   'IM_CARDNO': '当前登录人工号',
//   'IM_CARDNAME': '当前登录人姓名',
//   'warehouseNo': '仓库',
//   'wmsPostInList': [
//     {
//       'boxID': '箱子号',
//       'materialID': '明细中物料编号matnr',
//       'materialDesc': '明细中物料描述txZ01',
//       'quantity': 0, // 明细中数量erfmg，数字类型
//       'barcode': '明细中barcode',
//       'oclas': '业务类型', // 与查询明细的imOclas参数保持一致
//       'stationID': '', // 不需要传参
//       'projectID': '明细中proje',
//       'batchID': '明细中prodbatch',
//       'mark': '', // 不需要传参
//       'resultMsg': '', // 不需要传参
//       'locationID': '区域',
//       'cardNo': '当前登录账号工号',
//       'cardName': '当前登录账号姓名',
//       'poid': '明细中ebeln',
//       'poItemNo': '明细中cardmo',
//       'proofNumber': '明细中mblnr',
//       'ngeln': '明细中ngeln'
//     }
//   ],
//   'zxstXmbeStruList': [] // 勾选的明细数组
// }

// TODO 考虑统一封装这个转换方法

export {
  postTransferPramamsForWmsInPostIn,
  postTransferPramamsForWmsInOutStock
}
