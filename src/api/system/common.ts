import request from '@/utils/request'
let urlWMS = process.env.VUE_APP_BASE_API_WMS
urlWMS = urlWMS + 'api/business/'

// 根据箱子号获取货位
export function GetBoxInfoByBoxId(boxId: string) {
  return request({
    url: urlWMS + 'webapi/GetLocationNoByBoxId',
    method: 'get',
    params: {
      boxId
    }
  })
}

/**
 * 根据箱子号获取箱子内明细
 * @param boxId 箱子号
 */
export function GetBoxDetail(boxId: string) {
  return request({
    url: urlWMS + 'webapi/GetBoxDetail',
    method: 'get',
    params: {
      boxId
    }
  })
}
/**
 * 根据货位号获取货位详情
 * @param locationNo 货位号
 */
export function GetLocationInfo(locationNo: string) {
  return request({
    url: urlWMS + 'webapi/GetLocationInfoByLocationNo',
    method: 'get',
    params: {
      locationNo
    }
  })
}
// TODO: 目前没有权限，先写死用户工号
/** 根据用户工号获取仓库列表 */
export function GetUserWarehouse() {
  return request({
    url: urlWMS + 'userwarehouse/GetUserWarehouse',
    method: 'get',
    params: {
      userId: '03351'
    }
  })
}
/**
 *
 * @description 根据仓库编号获取厂区数据
 */
export function getArea(WarehouseNo:string) {
  return request({
    url: urlWMS + 'area/all',
    method: 'get',
    params: {
      WarehouseNo
    }
  })
}
/**
 *
 * @param Barcodes 条码、可传入一个字符串数组也可传入一个字符串
 * @param ProjectNo 项目号
 * @param StationNo 工位号
 * @param MaterialNo 物料编号
 * @param Type 项目箱号
 * @description 根据上面的信息获取一个条码列表
 */
export function getmaterialBarcodeInfo(Barcodes:any, ProjectNo?:string, StationNo?:string, MaterialNo?:string, Type?:string) {
  return request({
    url: urlWMS + 'webapi/GetMaterialBarcodeList',
    method: 'get',
    params: {
      Barcodes,
      ProjectNo,
      StationNo,
      MaterialNo,
      Type
    }
  })
}
