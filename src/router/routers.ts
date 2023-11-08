import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
export const Layout = () => import('@/layout/index.vue')

export const constantRouterMap: Array<RouteRecordRaw> = [
  {
    path: '/login',
    meta: { title: '登录', noCache: true, hidden: true },
    component: () => import('@/views/login.vue')
  },
  {
    path: '/download',
    meta: { title: '登录', noCache: true, hidden: true },
    component: () => import('@/views/download.vue')
  },
  {
    path: '/404',
    component: () => import('@/views/features/404.vue'),
    meta: { title: '404', hidden: true }
  },
  {
    path: '/401',
    component: () => import('@/views/features/401.vue'),
    meta: { title: '401', hidden: true }
  },
  {
    path: '/redirect',
    component: Layout,
    meta: { title: '401', hidden: true },
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/features/redirect.vue')
      }
    ]
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { title: '企业云', hidden: true },
    name: 'Dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/system/home/index.vue'),
        name: 'Dashboard',
        meta: { title: '企业云', icon: 'sw-home' }
      },
      {
        path: 'second',
        component: () => import('@/views/system/home/second.vue'),
        name: 'second',
        meta: { title: '企业云', icon: null }
      }
    ]
    // MARK "alwaysShow": true, 就是会让当前菜单为二级菜单
  }
  // {
  //   path: '/user',
  //   component: Layout,
  //   meta: { title: 'user', hidden: true },
  //   redirect: 'noredirect',
  //   children: [
  //     {
  //       path: 'center',
  //       component: () => import('@/views/system/user/center/updatePass.vue'),
  //       name: '个人中心',
  //       meta: { title: '个人中心' }
  //     }
  //   ]
  // }
  // {
  //   path: '/user/settings',
  //   component: Layout,
  //   meta: { title: '账户设置', hidden: true },
  //   redirect: 'noredirect',
  //   children: [
  //     {
  //       path: 'base',
  //       component: () => import('@/views/system/user/settings/index.vue'),
  //       meta: { title: '账户设置' },
  //       name: '账户设置'
  //     }
  //   ]
  // }
]

export const asyncRoutes = [
  {
    alwaysShow: false,
    hidden: false,
    path: '/receive',
    name: 'receive',
    redirect: '/receive/103POReceiveToQuality',
    meta: { title: '收货业务', icon: 'receive', hidden: false },
    component: 'Layout',
    children: [
      {
        alwaysShow: false,
        hidden: false,
        path: '101POReceiveToWarehouse',
        name: 'receive.101POReceiveToWarehouse',
        meta: { title: '101PO收货入库', icon: null, hidden: false },
        component: 'receive/101POReceiveToWarehouse/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '103POReceiveToQuality',
        name: 'receive.103POReceiveToQuality',
        meta: { title: '103PO收货到质检', icon: null, hidden: false },
        component: 'receive/103POReceiveToQuality/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '105GoodToWarehouse',
        name: 'receive.105GoodToWarehouse',
        meta: { title: '105良品入库', icon: null, hidden: false },
        component: 'receive/105GoodToWarehouse/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '122PurchaseReturnGoodsMonth',
        name: 'receive.122PurchaseReturnGoodsMonth',
        meta: { title: '122当月采购退货', icon: null, hidden: false },
        component: 'receive/122PurchaseReturnGoodsMonth/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '124RejectsReturnGoods',
        name: 'receive.124RejectsReturnGoods',
        meta: { title: '124不良品退货', icon: null, hidden: false },
        component: 'receive/124RejectsReturnGoods/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '161PurchaseReturnGoodsExtendMonth',
        name: 'receive.161PurchaseReturnGoodsExtendMonth',
        meta: { title: '161跨月采购退货', icon: null, hidden: false },
        component: 'receive/161PurchaseReturnGoodsExtendMonth/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '511FreeReceiveToWarehouse',
        name: 'receive.511FreeReceiveToWarehouse',
        meta: { title: '511免费收货入库', icon: null, hidden: false },
        component: 'receive/511FreeReceiveToWarehouse/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'Z01FinishedToWarehouse',
        name: 'receive.Z01FinishedToWarehouse',
        meta: { title: 'Z01成品入库', icon: null, hidden: false },
        component: 'receive/Z01FinishedToWarehouse/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '101POReceiveToWarehouse-WMS',
        name: 'receive.101POReceiveToWarehouse-WMS',
        meta: { title: '101PO收货入库-WMS', icon: null, hidden: false },
        component: 'receive/101POReceiveToWarehouse-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '103POReceiveToQuality-WMS',
        name: 'receive.103POReceiveToQuality-WMS',
        meta: { title: '103PO收货到质检-WMS', icon: null, hidden: false },
        component: 'receive/103POReceiveToQuality-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '105GoodToWarehouse-WMS',
        name: 'receive.105GoodToWarehouse-WMS',
        meta: { title: '105良品入库-WMS', icon: null, hidden: false },
        component: 'receive/105GoodToWarehouse-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '122PurchaseReturnGoodsMonth-WMS',
        name: 'receive.122PurchaseReturnGoodsMonth-WMS',
        meta: { title: '122当月采购退货-WMS', icon: null, hidden: false },
        component: 'receive/122PurchaseReturnGoodsMonth-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '124RejectsReturnGoods-WMS',
        name: 'receive.124RejectsReturnGoods-WMS',
        meta: { title: '124不良品退货-WMS', icon: null, hidden: false },
        component: 'receive/124RejectsReturnGoods-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '161PurchaseReturnGoodsExtendMonth-WMS',
        name: 'receive.161PurchaseReturnGoodsExtendMonth-WMS',
        meta: { title: '161跨月采购退货-WMS', icon: null, hidden: false },
        component: 'receive/161PurchaseReturnGoodsExtendMonth-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '511FreeReceiveToWarehouse-WMS',
        name: 'receive.511FreeReceiveToWarehouse-WMS',
        meta: { title: '511免费收货入库-WMS', icon: null, hidden: false },
        component: 'receive/511FreeReceiveToWarehouse-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'Z01FinishedToLineSideWarehouse-WMS',
        name: 'receive.Z01FinishedToLineSideWarehouse-WMS',
        meta: { title: '成品入库-线边仓WMS', icon: null, hidden: false },
        component: 'receive/Z01FinishedToLineSideWarehouse-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '644IntercompanyReturn-WMS',
        name: 'receive.644IntercompanyReturn-WMS',
        meta: { title: '644公司间退货-WMS', icon: null, hidden: false },
        component: 'receive/644IntercompanyReturn-WMS/index'
      }
    ]
  },
  {
    alwaysShow: false,
    hidden: false,
    path: '/shipment',
    name: 'shipment',
    meta: { title: '出货业务', icon: 'shipment', hidden: false },
    component: 'Layout',
    children: [
      {
        alwaysShow: false,
        hidden: false,
        path: '201DeptPicking',
        name: 'shipment.201DeptPicking',
        meta: { title: '201部门领料', icon: null, hidden: false },
        component: 'shipment/201DeptPicking/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '201DeptPickingWMS',
        name: 'shipment.201DeptPickingWMS',
        meta: { title: '201部门领料-WMS', icon: null, hidden: false },
        component: 'shipment/201DeptPickingWMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '202DeptReturn',
        name: 'shipment.202DeptReturn',
        meta: { title: '202部门退料', icon: null, hidden: false },
        component: 'shipment/202DeptReturn/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '202DeptReturnWMS',
        name: 'shipment.202DeptReturnWMS',
        meta: { title: '202部门退料-WMS', icon: null, hidden: false },
        component: 'shipment/202DeptReturnWMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '262AuxiliaryMaterialReturn',
        name: 'shipment.262AuxiliaryMaterialReturn',
        meta: { title: '262辅料退料', icon: null, hidden: false },
        component: 'shipment/262AuxiliaryMaterialReturn/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '261Issuance',
        name: 'shipment.261Issuance',
        meta: { title: '261发料', icon: null, hidden: false },
        // component: 'shipment/261Issuance/index',
        children: [
          {
            alwaysShow: false,
            hidden: false,
            path: '261AccessoriesIssuance-LineSideWarehouseWMS',
            name: 'shipment.261AccessoriesIssuance-LineSideWarehouseWMS',
            meta: { title: '261辅料发料-线边仓-WMS', icon: null, hidden: false },
            component: 'shipment/261AccessoriesIssuance-LineSideWarehouseWMS/index'
          },
          {
            alwaysShow: false,
            hidden: false,
            path: '261WarehouseDirectDelivery',
            name: 'shipment.261WarehouseDirectDelivery',
            meta: { title: '261仓库直发', icon: null, hidden: false },
            component: 'shipment/261WarehouseDirectDelivery/index'
          },
          {
            alwaysShow: false,
            hidden: false,
            path: '261WarehouseDirectDeliveryOutSourcingWMS',
            name: 'shipment.261WarehouseDirectDeliveryOutSourcingWMS',
            meta: { title: '261仓库直发-外购件-WMS', icon: null, hidden: false },
            component: 'shipment/261WarehouseDirectDeliveryOutSourcingWMS/index'
          },
          {
            alwaysShow: false,
            hidden: false,
            path: '261SupplierPicking',
            name: 'shipment.261SupplierPicking',
            meta: { title: '261供应商领料', icon: null, hidden: false },
            component: 'shipment/261SupplierPicking/index'
          },
          {
            alwaysShow: false,
            hidden: false,
            path: '261SupplierPickingWMS',
            name: 'shipment.261SupplierPickingWMS',
            meta: { title: '261供应商领料-WMS', icon: null, hidden: false },
            component: 'shipment/261SupplierPickingWMS/index'
          },
          {
            alwaysShow: false,
            hidden: false,
            path: '261EmbryoIssuance',
            name: 'shipment.261EmbryoIssuance',
            meta: { title: '261胚料发料', icon: null, hidden: false },
            component: 'shipment/261EmbryoIssuance/index'
          },
          {
            alwaysShow: false,
            hidden: false,
            path: '261EmbryoIssuanceWMS',
            name: 'shipment.261EmbryoIssuanceWMS',
            meta: { title: '261胚料发料-WMS', icon: null, hidden: false },
            component: 'shipment/261EmbryoIssuanceWMS/index'
          },
          {
            alwaysShow: false,
            hidden: false,
            path: '261ScrewIssuanceWMS',
            name: 'shipment.261ScrewIssuanceWMS',
            meta: { title: '261螺丝发料-WMS', icon: null, hidden: false },
            component: 'shipment/261ScrewIssuanceWMS/index'
          },
          {
            alwaysShow: false,
            hidden: false,
            path: '261EmbryoIssuance-BT',
            name: 'shipment.261EmbryoIssuance-BT',
            meta: { title: '261胚料发料-柏塘', icon: null, hidden: false },
            component: 'shipment/261EmbryoIssuance-BT/index'
          },
          {
            alwaysShow: false,
            hidden: false,
            path: '261EmbryoIssuance-FT',
            name: 'shipment.261EmbryoIssuance-FT',
            meta: { title: '261胚料发料-分摊', icon: null, hidden: false },
            component: 'shipment/261EmbryoIssuance-FT/index'
          },
          {
            alwaysShow: false,
            hidden: false,
            path: '261EmbryoIssuance-FTWMS',
            name: 'shipment.261EmbryoIssuance-FTWMS',
            meta: { title: '261胚料发料-分摊-WMS', icon: null, hidden: false },
            component: 'shipment/261EmbryoIssuance-FTWMS/index'
          }
        ]
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '262EmbryoReturn',
        name: 'shipment.262EmbryoReturn',
        meta: { title: '262胚料退料', icon: null, hidden: false },
        component: 'shipment/262EmbryoReturn/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '262EmbryoReturnWMS',
        name: 'shipment.262EmbryoReturnWMS',
        meta: { title: '262胚料退料-WMS', icon: null, hidden: false },
        component: 'shipment/262EmbryoReturnWMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '262ProductionReturn',
        name: 'shipment.262ProductionReturn',
        meta: { title: '262生产退料', icon: null, hidden: false },
        component: 'shipment/262ProductionReturn/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '262ProductionReturnWMS',
        name: 'shipment.262ProductionReturnWMS',
        meta: { title: '262生产退料-WMS', icon: null, hidden: false },
        component: 'shipment/262ProductionReturnWMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '262ProductionReturn-LineSideWarehouseWMS',
        name: 'shipment.262ProductionReturn-LineSideWarehouseWMS',
        meta: { title: '262生产退料-线边仓-WMS', icon: null, hidden: false },
        component: 'shipment/262ProductionReturn-LineSideWarehouseWMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '531ByProductReceive',
        name: 'shipment.531ByProductReceive',
        meta: { title: '531副产品收货', icon: null, hidden: false },
        component: 'shipment/531ByProductReceive/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '531ByProductReceiveWMS',
        name: 'shipment.531ByProductReceiveWMS',
        meta: { title: '531副产品收货-WMS', icon: null, hidden: false },
        component: 'shipment/531ByProductReceiveWMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '541SubcontractingIssuance',
        name: 'shipment.541SubcontractingIssuance',
        meta: { title: '541委外发料', icon: null, hidden: false },
        component: 'shipment/541SubcontractingIssuance/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '541SubcontractingIssuanceWMS',
        name: 'shipment.541SubcontractingIssuanceWMS',
        meta: { title: '541委外发料-WMS', icon: null, hidden: false },
        component: 'shipment/541SubcontractingIssuanceWMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'Z03ToolPicking',
        name: 'shipment.Z03ToolPicking',
        meta: { title: 'Z03工具领料', icon: null, hidden: false },
        component: 'shipment/Z03ToolPicking/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'Z03ToolPickingWMS',
        name: 'shipment.Z03ToolPickingWMS',
        meta: { title: 'Z03工具领料-WMS', icon: null, hidden: false },
        component: 'shipment/Z03ToolPickingWMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'Z04ToolReturn',
        name: 'shipment.Z04ToolReturn',
        meta: { title: 'Z04工具退料', icon: null, hidden: false },
        component: 'shipment/Z04ToolReturn/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'Z04ToolReturnWMS',
        name: 'shipment.Z04ToolReturnWMS',
        meta: { title: 'Z04工具退料-WMS', icon: null, hidden: false },
        component: 'shipment/Z04ToolReturnWMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '643IntercompanyShipmentWMS',
        name: 'shipment.643IntercompanyShipmentWMS',
        meta: { title: '643公司间发货-WMS', icon: null, hidden: false },
        component: 'shipment/643IntercompanyShipmentWMS/index'
      }
    ]
  },
  {
    alwaysShow: false,
    hidden: false,
    path: '/transfer',
    name: 'transfer',
    redirect: '/transfer/301TransferBetweenFactories',
    meta: { title: '转移业务', icon: 'transfer', hidden: false },
    component: 'Layout',
    children: [
      {
        alwaysShow: false,
        hidden: false,
        path: '301TransferBetweenFactories',
        name: 'transfer.301TransferBetweenFactories',
        meta: { title: '301工厂间调拨', icon: null, hidden: false },
        component: 'transfer/301TransferBetweenFactories/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '315MaterialPreparationTransfer',
        name: 'transfer.315MaterialPreparationTransfer',
        meta: { title: '315备料转移', icon: null, hidden: false },
        component: 'transfer/315MaterialPreparationTransfer/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'Z31TransferToWarehouse',
        name: 'transfer.Z31TransferToWarehouse',
        meta: { title: 'Z31转移到结算仓/样机仓', icon: null, hidden: false },
        component: 'transfer/Z31TransferToWarehouse/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'Z41RepairProductDelivery',
        name: 'transfer.Z41RepairProductDelivery',
        meta: { title: 'Z41维修品出库', icon: null, hidden: false },
        component: 'transfer/Z41RepairProductDelivery/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'Z42RepairGoodsReceipt',
        name: 'transfer.Z42RepairGoodsReceipt',
        meta: { title: 'Z42维修品收货', icon: null, hidden: false },
        component: 'transfer/Z42RepairGoodsReceipt/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'Z43CrossRegionalTransferReceipt',
        name: 'transfer.Z43CrossRegionalTransferReceipt',
        meta: { title: 'Z43跨区域调拨入库', icon: null, hidden: false },
        component: 'transfer/Z43CrossRegionalTransferReceipt/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'Z44CrossRegionalTransferPicking',
        name: 'transfer.Z44CrossRegionalTransferPicking',
        meta: { title: 'Z44跨区域调拨拣货', icon: null, hidden: false },
        component: 'transfer/Z44CrossRegionalTransferPicking/index'
      },
      // {
      //   alwaysShow: false,
      //   hidden: false,
      //   path: 'transferReceiptBetweenStorageLocations',
      //   name: 'transfer.transferReceiptBetweenStorageLocations',
      //   meta: { title: '库位间调拨入库', icon: null, hidden: false },
      //   component: 'transfer/transferReceiptBetweenStorageLocations/index'
      // },
      {
        alwaysShow: false,
        hidden: false,
        path: '315MaterialPreparationTransfer-WMS',
        name: 'transfer.315MaterialPreparationTransfer-WMS',
        meta: { title: '315备料转移-WMS', icon: null, hidden: false },
        component: 'transfer/315MaterialPreparationTransfer-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '315MaterialPreparationTransferLineSideWarehouse-WMS',
        name: 'transfer.315MaterialPreparationTransferLineSideWarehouse-WMS',
        meta: { title: '315辅料备料转移-线边仓WMS', icon: null, hidden: false },
        component: 'transfer/315MaterialPreparationTransferLineSideWarehouse-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'Z31TransferToWarehouse-WMS',
        name: 'transfer.Z31TransferToWarehouse-WMS',
        meta: { title: 'Z31转移到结算仓/样机仓-WMS', icon: null, hidden: false },
        component: 'transfer/Z31TransferToWarehouse-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'Z43CrossRegionalTransferReceipt-WMS',
        name: 'transfer.Z43CrossRegionalTransferReceipt-WMS',
        meta: { title: 'Z43跨区域调拨入库-WMS', icon: null, hidden: false },
        component: 'transfer/Z43CrossRegionalTransferReceipt-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'Z44CrossRegionalTransferPicking-WMS',
        name: 'transfer.Z44CrossRegionalTransferPicking-WMS',
        meta: { title: 'Z44跨区域调拨拣货-WMS', icon: null, hidden: false },
        component: 'transfer/Z44CrossRegionalTransferPicking-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'crossRegionalReception-WMS',
        name: 'transfer.crossRegionalReception-WMS',
        meta: { title: '跨区域接收-WMS', icon: null, hidden: false },
        component: 'transfer/crossRegionalReception-WMS/index'
      }
    ]
  },
  {
    alwaysShow: false,
    hidden: false,
    path: '/wmsFunction',
    name: 'WMSFunction',
    redirect: '/wmsFunction/InventoryBind',
    meta: { title: 'WMS功能', icon: 'WMSFunction', hidden: false },
    component: 'Layout',
    children: [
      {
        alwaysShow: false,
        hidden: false,
        path: 'InventoryBind-WMS',
        name: 'WMSFunction.InventoryBind-WMS',
        meta: { title: '库存绑定-WMS', icon: null, hidden: false },
        component: 'wmsFunction/InventoryBind-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'BoxBingAndUnbind-WMS',
        name: 'WMSFunction.BoxBingAndUnbind-WMS',
        meta: { title: '载具绑定/解绑货位-WMS', icon: null, hidden: false },
        component: 'wmsFunction/BoxBingAndUnbind-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'MaterialTransfer-WMS',
        name: 'WMSFunction.MaterialTransfer-WMS',
        meta: { title: '物料箱号调拨-WMS', icon: null, hidden: false },
        component: 'wmsFunction/MaterialTransfer-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'BoxTransfer-WMS',
        name: 'WMSFunction.BoxTransfer-WMS',
        meta: { title: '整箱物料调拨-WMS', icon: null, hidden: false },
        component: 'wmsFunction/BoxTransfer-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'MaterialTypeSorting-WMS',
        name: 'WMSFunction.MaterialTypeSorting-WMS',
        meta: { title: '物料类型分拣-WMS', icon: null, hidden: false },
        component: 'wmsFunction/MaterialTypeSorting-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'MaterialInfoModify-WMS',
        name: 'WMSFunction.MaterialInfoModify-WMS',
        meta: { title: '物料主数据信息修改', icon: null, hidden: false },
        component: 'wmsFunction/MaterialInfoModify-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'BadBoxBind',
        name: 'WMSFunction.BadBoxBind',
        meta: { title: '不良箱号绑定', icon: null, hidden: false },
        component: 'wmsFunction/BadBoxBind/index'
      }
    ]
  },
  {
    alwaysShow: false,
    hidden: false,
    path: '/WMSLineSideWarehouse',
    name: 'WMSLineSideWarehouse',
    redirect: '/WMSLineSideWarehouse/index',
    meta: { title: 'WMS装配线边物料', icon: 'WMSLineSideWarehouse', hidden: false },
    component: 'Layout',
    children: [
      {
        alwaysShow: false,
        hidden: false,
        path: 'moldInstallationForMaterialOutBound',
        name: 'WMSLineSideWarehouse.moldInstallationForMaterialOutBound',
        meta: { title: '模装现场物料出库', icon: null, hidden: false },
        component: 'WMSLineSideWarehouse/moldInstallationForMaterialOutBound/index'
      },
      // {
      //   alwaysShow: false,
      //   hidden: false,
      //   path: 'onSiteMaterialInBound',
      //   name: 'WMSLineSideWarehouse.onSiteMaterialInBound',
      //   meta: { title: '现场物料入库', icon: null, hidden: false },
      //   component: 'WMSLineSideWarehouse/onSiteMaterialInBound/index'
      // },
      {
        alwaysShow: false,
        hidden: false,
        path: 'onSiteMaterialOutBound',
        name: 'WMSLineSideWarehouse.onSiteMaterialOutBound',
        meta: { title: '现场物料出库', icon: null, hidden: false },
        component: 'WMSLineSideWarehouse/onSiteMaterialOutBound/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'clearMaterialBoxNumber',
        name: 'WMSLineSideWarehouse.clearMaterialBoxNumber',
        meta: { title: '物料箱号清除', icon: null, hidden: false },
        component: 'WMSLineSideWarehouse/clearMaterialBoxNumber/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'handoverOfCardMaterialWarehouse',
        name: 'WMSLineSideWarehouse.handoverOfCardMaterialWarehouse',
        meta: { title: '卡板物料仓库间交接', icon: null, hidden: false },
        component: 'WMSLineSideWarehouse/handoverOfCardMaterialWarehouse/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'TransferAreaReception',
        name: 'WMSLineSideWarehouse.TransferAreaReception',
        meta: { title: '转运区接收', icon: null, hidden: false },
        component: 'WMSLineSideWarehouse/TransferAreaReception/index'
      }
    ]
  },
  {
    alwaysShow: false,
    hidden: false,
    path: '/machinedWarehousing',
    name: 'machinedWarehousing',
    redirect: '/machinedWarehousing/index',
    meta: { title: '机加仓储业务', icon: 'machinedWarehousing', hidden: false },
    component: 'Layout',
    children: [
      {
        alwaysShow: false,
        hidden: false,
        path: '261MachinedPartsMaterialIssuance-WMS',
        name: 'machinedWarehousing.261MachinedPartsMaterialIssuance-WMS',
        meta: { title: '261机加件发料-WMS', icon: null, hidden: false },
        component: 'machinedWarehousing/261MachinedPartsMaterialIssuance-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '261MachinedPartsMaterialPreparationAndIssuance-WMS',
        name: 'machinedWarehousing.261MachinedPartsMaterialPreparationAndIssuance-WMS',
        meta: { title: '261机加件备料发料-WMS', icon: null, hidden: false },
        component: 'machinedWarehousing/261MachinedPartsMaterialPreparationAndIssuance-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '315MachinedPartsMaterialPreparation-WMS',
        name: 'machinedWarehousing.315MachinedPartsMaterialPreparation-WMS',
        meta: { title: '315机加件备料-WMS', icon: null, hidden: false },
        component: 'machinedWarehousing/315MachinedPartsMaterialPreparation-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: '261MachinedPartsMaterialIssuanceByBox-WMS',
        name: 'WMSManagement.261MachinedPartsMaterialIssuanceByBox-WMS',
        meta: { title: '261机加件发料-按箱-WMS', icon: null, hidden: false },
        component: 'WMSManagement/261MachinedPartsMaterialIssuanceByBox-WMS/index'
      }
    ]
  },
  {
    alwaysShow: false,
    hidden: false,
    path: '/WMSManagement',
    name: 'WMSManagement',
    redirect: '/WMSManagement/index',
    meta: { title: 'WMS管理', icon: 'WMSManagement', hidden: false },
    component: 'Layout',
    children: [
      {
        alwaysShow: false,
        hidden: false,
        path: 'LocationQuery-WMS',
        name: 'WMSManagement.LocationQuery-WMS',
        meta: { title: 'WMS区域查询', icon: null, hidden: false },
        component: 'WMSManagement/LocationQuery-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'ProjectBoxQuery-WMS',
        name: 'WMSManagement.ProjectBoxQuery-WMS',
        meta: { title: '项目箱号查询', icon: null, hidden: false },
        component: 'WMSManagement/ProjectBoxQuery/index'
      }
    ]
  },
  // {
  //   alwaysShow: false,
  //   hidden: false,
  //   path: '/logisticsAccount',
  //   name: 'logisticsAccount',
  //   redirect: '/logisticsAccount/index',
  //   meta: { title: '物流台账', icon: 'logisticsAccount', hidden: false },
  //   children: []
  // },
  // {
  //   alwaysShow: false,
  //   hidden: false,
  //   path: '/labelIssue',
  //   name: 'labelIssue',
  //   redirect: '/labelIssue/index',
  //   meta: { title: '标签发行', icon: 'labelIssue', hidden: false },
  //   children: []
  // },
  {
    alwaysShow: false,
    hidden: false,
    path: '/query',
    name: 'query',
    redirect: '/query/index',
    meta: { title: '查询业务', icon: 'query', hidden: false },
    component: 'Layout',
    children: [
      {
        alwaysShow: false,
        hidden: false,
        path: 'paymentDateOfMilitaryOrderInBT',
        name: 'query.paymentDateOfMilitaryOrderInBT',
        meta: { title: '柏塘军令状纳期查询', icon: null, hidden: false },
        component: 'query/paymentDateOfMilitaryOrderInBT/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'productionOrderStatusQuery',
        name: 'query.productionOrderStatusQuery',
        meta: { title: '生产订单状态查询', icon: null, hidden: false },
        component: 'query/productionOrderStatusQuery/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'barcodeQuery',
        name: 'query.barcodeQuery',
        meta: { title: '条码查询', icon: null, hidden: false },
        component: 'query/barcodeQuery/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'materialVoucherQuery',
        name: 'query.materialVoucherQuery',
        meta: { title: '物料凭证查询', icon: null, hidden: false },
        component: 'query/materialVoucherQuery/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'projectStationQuery',
        name: 'query.projectStationQuery',
        meta: { title: '项目工位查询', icon: null, hidden: false },
        component: 'query/projectStationQuery/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'componentQuery',
        name: 'query.componentQuery',
        meta: { title: '组件查询', icon: null, hidden: false },
        component: 'query/componentQuery/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'latestStatusQuery',
        name: 'query.latestStatusQuery',
        meta: { title: '最新状态查询', icon: null, hidden: false },
        component: 'query/latestStatusQuery/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'inventoryQuery',
        name: 'query.inventoryQuery',
        meta: { title: '库存查询', icon: null, hidden: false },
        component: 'query/inventoryQuery/index'
      }
    ]
  },
  {
    alwaysShow: false,
    hidden: false,
    path: '/logisticsAGVDistribution',
    name: 'logisticsAGVDistribution',
    redirect: '/logisticsAGVDistribution/index',
    meta: { title: '调度业务', icon: 'WMSManagement', hidden: false },
    component: 'Layout',
    children: [
      {
        alwaysShow: false,
        hidden: false,
        path: 'cardLoadingStatus-WMS',
        name: 'logisticsAGVDistribution.cardLoadingStatus-WMS',
        meta: { title: '卡板装载状态-WMS', icon: null, hidden: false },
        component: 'logisticsAGVDistribution/cardLoadingStatus-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'cardboardBindingMaterialRack-WMS',
        name: 'logisticsAGVDistribution.cardboardBindingMaterialRack-WMS',
        meta: { title: '卡板绑定料架-WMS', icon: null, hidden: false },
        component: 'logisticsAGVDistribution/cardboardBindingMaterialRack-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'materialRackBindingAndWaitingForStorageArea-WMS',
        name: 'logisticsAGVDistribution.materialRackBindingAndWaitingForStorageArea-WMS',
        meta: { title: '料架绑定待入库区-WMS', icon: null, hidden: false },
        component: 'logisticsAGVDistribution/materialRackBindingAndWaitingForStorageArea-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'materialRackStorage-WMS',
        name: 'logisticsAGVDistribution.materialRackStorage-WMS',
        meta: { title: '料架入库-WMS', icon: null, hidden: false },
        component: 'logisticsAGVDistribution/materialRackStorage-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'materialRackOutbound-WMS',
        name: 'logisticsAGVDistribution.materialRackOutbound-WMS',
        meta: { title: '料架出库-WMS', icon: null, hidden: false },
        component: 'logisticsAGVDistribution/materialRackOutbound-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'emptyMaterialRackOutbound-WMS',
        name: 'logisticsAGVDistribution.emptyMaterialRackOutbound-WMS',
        meta: { title: '空料架出库-WMS', icon: null, hidden: false },
        component: 'logisticsAGVDistribution/emptyMaterialRackOutbound-WMS/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'AGVInStorage',
        name: 'logisticsAGVDistribution.AGVInStorage',
        meta: { title: '呼叫AGV入库-WMS', icon: null, hidden: false },
        component: 'logisticsAGVDistribution/AGVInStorage/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'LocationBatchOutStorage',
        name: 'logisticsAGVDistribution.LocationBatchOutStorage',
        meta: { title: '项目工位批次出库-WMS', icon: null, hidden: false },
        component: 'logisticsAGVDistribution/LocationBatchOutStorage/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'logisticsStock',
        name: 'logisticsAGVDistribution.logisticsStock',
        meta: { title: '后勤备料-WMS', icon: null, hidden: false },
        component: 'logisticsAGVDistribution/logisticsStock/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'callAGV',
        name: 'logisticsAGVDistribution.callAGV',
        meta: { title: '叫车-WMS', icon: null, hidden: false },
        component: 'logisticsAGVDistribution/callAGV/index'
      },
      {
        alwaysShow: false,
        hidden: false,
        path: 'logisticsBindingDistribution',
        name: 'logisticsAGVDistribution.logisticsBindingDistribution',
        meta: { title: '后勤绑定配送-WMS', icon: null, hidden: false },
        component: 'logisticsAGVDistribution/logisticsBindingDistribution/index'
      }
      // {
      //   alwaysShow: false,
      //   hidden: false,
      //   path: '/assemblyManagement',
      //   name: 'assemblyManagement',
      //   redirect: '/assemblyManagement/index',
      //   meta: { title: '装配件管理', icon: null, hidden: false },
      //   children: []
      // },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(), // hash模式：createWebHashHistory，history模式：createWebHistory
  routes: constantRouterMap
})
export default router
