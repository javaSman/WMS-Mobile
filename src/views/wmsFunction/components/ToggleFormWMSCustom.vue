<template>
  <div>
    <!-- 表单布局-隐藏字段布局 -->
    <FormGroup
      ref="refFormGroup"
      :showFormList="showFormList"
      :formList="_formList"
      v-model:form="form"
      v-model:show="show"
    />
    <!-- 列表信息总览 -->
    <SummaryCheck
      :chkDisabled="chkDisabled"
      v-model:selectAll="selectAll"
      :selectedList="selectedList"
      :list="list"
      @handleSelectAll="handleSelectAll"
    />
    <!-- 列表 -->
    <TableVue
      ref="table"
      v-model:table-data="list"
      :tableColumn="tableColumn"
      v-model:selection="selectedList"
      @click-handler="clickHandler"
      @inputNumHandler="inputNumHandler"
    />
    <!-- 底部按钮 -->
    <ActionBarVue
      ref="actionBarVue"
      :loading="loading"
      :confirmText="confirmText"
      @clear="handleClear"
      @confirm="handleConfirm"
    />
    <!-- 调用扫条码时的loading效果，同时阻止用户继续操作 -->
    <van-overlay :show="scanLoading">
      <div class="loading_wrapper" @click.stop>
        <van-loading color="#ffffff" type="spinner">数据加载中</van-loading>
      </div>
    </van-overlay>
  </div>
</template>

<script lang="ts" setup name="ToggleFormWMSVue">
import { PropType, ref, reactive, nextTick, computed } from 'vue'
import FormGroup from '@/views/wmsFunction/components/FormGroup.vue'
import SummaryCheck from '@/views//wmsFunction/components/SummaryCheck.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { FormConfig, TableColumn } from '@/typing'
import { WMSAPI } from '@/api/generalAPI'
import { showSuccessToast, showConfirmDialog, FieldInstance } from 'vant'
import Dates from '@/utils/datetime'
import { v4 as uuidv4 } from 'uuid'
import useStore from '@/store'
import { GetUserWarehouse, GetBoxDetail, GetBoxInfoByBoxId, GetLocationInfo } from '@/api/system/common'
import { getPostInParams, getOutStockParams, getEditableKey } from '@/utils/wmsFunction'
import { _showFailToast } from '@/utils/message'

let emits = defineEmits(['clickHandler'])
let props = defineProps({
  formList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 表单项数组
  showFormList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 需要展开显示的数据字段参数
  viewData: { type: Object as PropType<any>, default: () => ({}) }, // 列表信息总览数据
  tableColumn: { type: Array as PropType<TableColumn[]>, default: () => [] }, // 列表字段参数
  chkDisabled: { type: Boolean, default: () => false },
  submit: { type: Function, default: undefined }, // 过账按钮前执行事件
  passAPIName: { type: String, default: () => '' }, // 过账接口地址
  listAPIName: { type: String, default: () => '' }, // 扫码查询接口地址
  boxIDAPIName: { type: String, default: () => '' }, // 扫码箱子号查询接口地址
  type: { type: String, default: () => '' }, // 页面业务类型
  confirmText: { type: String, default: () => '过账' }, // 底部按钮显示文本
  enterFrontEvent: { type: Function, default: () => false }, // 条码回车事件前执行事件
  enterAfterEvent: { type: Function, default: undefined }, // 条码回车事件后执行事件，用于重新组合数据
  snrc: { type: Array as PropType<any[]>, default: () => [] }, // 确认信息数组
  isPass: { type: Boolean, default: () => true },
  // 1.扫码匹配字段一标识key，此key是用来实现业务的，必须传入；2.追加数据判断是否重复扫码的唯一识别符
  scanlKey: { type: String, default: 'matnr' },
  // 当前模式，all：加载接口后全选；one：扫码匹配或手动勾选，需传值scanlKey匹配字段；handler：只能手动勾选；addTo：追加数据
  mode: { type: String, default: 'one' }
})

let table = ref<InstanceType<typeof TableVue> | null>(null)
let refFormGroup = ref<any>({}) // 表单组合ref

let { user } = useStore()
let { account, name } = user.user

const today = new Dates(new Date()).strftime('YYYY-MM-DD')

let locationIndex = ref()
let targetLocationProp = ref('') // 区域/货位prop
// 表单对象，初始化过账日期
let form = ref<any>({
  postDate: today
})
// 点击左侧箭头是否展开
let show = ref(false)
// 是否全选
let selectAll = ref(false)
// 选中项集合
let selectedList = ref<any[]>([])
// 表单项数组，因需要二次赋值，但是子组件深度监听都监听不到props.formList的改变，computed是异步会有数据延迟，只好是用ref
let _formList = ref<FormConfig[]>(JSON.parse(JSON.stringify(props.formList)))

// 列表数据
let list = ref<any[]>([])
// 过账按钮loading
let loading = ref(false)
// 存储额外的参数对象
let exParams = reactive<any>({})
// 扫条码时进行loading
const scanLoading = ref(false)
// 用于存储列表原始数据
let staticData: any[] = []
// 用于存储仓库列表
let wareHouseList = ref<any[]>([])
// // 如果过账的时PostIn，表示入库，OutStock 表示退货，两边接口参数不一致
// const isPostIn = computed<boolean>(() => props.passAPIName.endsWith('/PostIn'))

// 过账的method
let passType = computed<string>(() => {
  let passStr: string
  passStr = props.passAPIName.split('/').at(-1) ?? ''
  return passStr
})

/** 全选和反选 */
const handleSelectAll = () => {
  table.value?.checkboxGroup.toggleAll(selectAll.value)
}
// TODO: 目前没有权限，先写死用户工号
/** 根据用户工号获取仓库列表 */
async function getUserWarehouse() {
  try {
    let res = await GetUserWarehouse()
    if (res.success) {
      wareHouseList.value = res.datas as any[]
    } else {
      _showFailToast(res.message as string)
    }
  } catch (e) {
    console.log(e)
  }
}

let boxInputRef: FieldInstance | null = null
let areaInputRef: FieldInstance | null = null
let barcodeInputRef: FieldInstance | null = null
/** 仓库change */
function wareHouseChange(val: string | null) {
  if (!val) return
  boxInputRef?.focus()
}
/** 箱子号回车带出明细 */
function boxIDEnter(val: string | null) {
  if (!val) return
  scanLoading.value = true
  GetBoxDetail(val)
    .then((res: any) => {
      if (res && res.success) {
        let _data = res.materialBarcodeList as any[]
        selectedList.value = []
        if (_data.length === 0) {
          _showFailToast(`箱子号[${val}]下没有明细物料，请重新扫码`)
          form.value.boxID = ''
          boxInputRef?.focus()
          return
        }
        // 增加uuid为唯一识别符
        _data.forEach((item) => {
          item.uuid = uuidv4()
        })
        // 赋值表格数据
        list.value = _data
        // 存储原始数据
        staticData = JSON.parse(JSON.stringify(_data))
        staticData.forEach((item: any) => {
          item.newQuantity = item.quantity
        })
        // // 重新组合数据
        // props.enterAfterEvent && props.enterAfterEvent(list.value, staticData)
        // 光标跳转
        boxInputRef?.focus()
      } else {
        _showFailToast(res.message)
      }
    })
    .finally(() => {
      scanLoading.value = false
    })
}
/** 箱子号回车 */
function boxNoEnter(val: string | null) {
  if (!val) return
  // 调用接口带出区域，如果区域有值，光标跳转到条码，没有跳转到区域
  GetBoxInfoByBoxId(val)
    .then((res: any) => {
      // console.log(res)
      // 判断箱子号是否存在
      if (res.success) {
        // 判断箱子号是否可以带出货位
        if (res.locationNo) {
          form.value[targetLocationProp.value] = res.locationNo as string
          setLocationDisable(true)
          barcodeInputRef?.focus()
        } else {
          setLocationDisable(false)
          areaInputRef?.focus()
        }
      } else {
        _showFailToast(res.message as string)
        setLocationDisable(false)
        boxInputRef?.focus()
      }
    })
    .catch(() => {
      boxInputRef?.focus()
      setLocationDisable(false)
    })
}

/** 设置货位禁用状态 */
let setLocationDisable = (flag: boolean) => {
  if ((locationIndex.value ?? '') !== '') {
    _formList.value[locationIndex.value].disabled = flag
  }
}

/** 区域回车 */
function areaEnter(val: string | null) {
  if (!val) return
  GetLocationInfo(val)
    .then((res: any) => {
      console.log(res)
      if (res.success) {
        barcodeInputRef?.focus()
      } else {
        _showFailToast(res.message as string)
        areaInputRef?.focus()
      }
    })
    .catch(() => {
      areaInputRef?.focus()
    })
}

/**
 * @description: 回车事件，需判断匹配明细的方式
 * @param {*} val 值
 */
const enterByCommon = async (val: string | number | null, paramsProp: string, listProp: string) => {
  // 以list.value的长度作为判断条件，大于0，表面如果页面明细没有被清除，等于0表明页面无信息
  if (list.value.length > 0) {
    // 1.当模式是扫码匹配
    if (props.mode === 'one') {
      // 从结果集中寻找
      let target = list.value.filter((item) => item[props.scanlKey] === val)
      if (target.length > 0) {
        // 每次都是追加，不是覆盖，因为存在连续扫码的情况
        let arrs = [...selectedList.value, ...target.map((item: any) => item.uuid)]
        // 进行勾选
        table.value?.handleSelect(arrs)
        nextTick(() => {
          // 光标重新聚焦
          barcodeInputRef?.focus()
        })
      } else {
        _showFailToast('没有找到结果，请检查重试或清除结果后重新扫码')
      }
    }
    // 2.当模式是手动勾选
    if (props.mode === 'handler') {
      _showFailToast('请手动勾选数据过账或清除信息后再扫码！')
    }
    // 3.当前模式是默认全选
    if (props.mode === 'all') {
      _showFailToast('请清除信息后再扫码！')
    }
  } else {
    // 否则加载接口数据然后全选
    scanLoading.value = true
    // 如果有前置事件，则执行
    if (await props.enterFrontEvent(val, form.value.postDate)) {
      scanLoading.value = true
      return
    } else {
      let params: any = {}
      params[paramsProp] = [val]
      WMSAPI.get(props.listAPIName, params)
        .then((res: any) => {
          // debugger
          if (res && res.success) {
            let _data: any[] = res[listProp]
            if (_data.length === 0) {
              _showFailToast('暂无数据')
              return
            }
            // TODO: 使用静态测试数据
            // let _data: any[] = testData.data
            if (_data.length > 0) {
              form.value = Object.assign({}, form.value, _data[0])
            }

            let arr: any[] = []
            // 增加uuid为唯一识别符
            _data.forEach((item) => {
              item.uuid = uuidv4()
              arr.push(item)
            })
            // 赋值表格数据
            list.value = arr
            // 存储原始数据
            staticData = JSON.parse(JSON.stringify(arr))
            staticData.forEach((item: any) => {
              item.newQuantity = item.quantity
            })
            // 重新组合数据
            props.enterAfterEvent && props.enterAfterEvent(list.value, staticData)

            let arrs = list.value.map((item) => item.uuid)
            // 默认将数据全选
            if (props.mode === 'all') {
              table.value?.handleSelect(arrs)
            }
          } else {
            _showFailToast(res.message as string)
          }
        })
        .catch((e) => {
          // 在返回错误后清空页面
          handleClear()
        })
        .finally(() => {
          scanLoading.value = false
          form.value.imBarcode = ''
          // 查询结果之后重新聚焦
          barcodeInputRef?.focus()
        })
    }
  }
}

/**
 * @description: 当前操作模式为addTo时回车事件
 * @param {*} val 值
 */
const enterByAddTo = (val: string | number | null, paramsProp: string, listProp: string) => {
  // 1.判断是否重复扫码
  if (list.value.length > 0) {
    let target = list.value.filter((item) => item[props.scanlKey] === val)
    if (target.length > 0) {
      _showFailToast('请勿重复扫码')
      return
    }
  }
  let params: any = {}
  params[paramsProp] = [val]

  // 2.不重复则调用接口追加数据
  WMSAPI.get(props.listAPIName, params)
    .then((res: any) => {
      if (res && res.success) {
        let _data: any[] = res[listProp]

        // 清空输入框
        form.value.imBarcode = ''

        if (_data === null || _data.length === 0) {
          _showFailToast('暂无数据')
          return
        }
        // 增加uuid为唯一识别符
        _data.forEach((item) => {
          item.uuid = uuidv4()
          list.value.push(item)
        })
        // 存储原始数据
        staticData = JSON.parse(JSON.stringify(list.value))
        staticData.forEach((item: any) => {
          item.newQuantity = item.quantity
        })
        let arrs = list.value.map((item) => item.uuid)
        // 默认勾选数据
        table.value?.handleSelect(arrs)
      } else {
        _showFailToast(res.message as string)
      }
    })
    .catch(() => {
      // 在返回错误后清空页面
      // handleClear()
    })
    .finally(() => {
      scanLoading.value = false
      form.value.imBarcode = ''
      // 查询结果之后重新聚焦
      barcodeInputRef?.focus()
    })
}

// /**
//  * @description: 条码回车事件，需判断匹配明细的方式
//  * @param {*} val 条码值
//  */
// const barcodeEnter = async (val: string | number | null) => {
//   if (!val) {
//     _showFailToast('请输入条码')
//     return
//   }
//   // 以list.value的长度作为判断条件，大于0，表面如果页面明细没有被清除，等于0表明页面无信息
//   if (list.value.length > 0) {
//     // 1.当模式是扫码匹配
//     if (props.mode === 'one') {
//       // 从结果集中寻找
//       let target = list.value.filter((item) => item[props.scanlKey] === val)
//       if (target.length > 0) {
//         // 每次都是追加，不是覆盖，因为存在连续扫码的情况
//         let arrs = [...selectedList.value, ...target.map((item: any) => item.uuid)]
//         // 进行勾选
//         table.value?.handleSelect(arrs)
//         nextTick(() => {
//           // 光标重新聚焦
//           barcodeInputRef?.focus()
//         })
//       } else {
//         _showFailToast('没有找到结果，请检查重试或清除结果后重新扫码')
//       }
//     }
//     // 2.当模式是手动勾选
//     if (props.mode === 'handler') {
//       _showFailToast('请手动勾选数据过账或清除信息后再扫码！')
//     }
//     // 3.当前模式是默认全选
//     if (props.mode === 'all') {
//       _showFailToast('请清除信息后再扫码！')
//     }
//   } else {
//     // 否则加载接口数据然后全选
//     scanLoading.value = true
//     // 如果有前置事件，则执行
//     if (await props.enterFrontEvent(val, form.value.postDate)) {
//       scanLoading.value = true
//       return
//     } else {
//       // 条码/物料编号
//       let str: string = props.listAPIName.split('/').at(-1) ?? ''
//       let params: any = {}
//       let listProp = ''
//       if (str === 'GetMaterialBarcodeList') {
//         params = { barcodes: [val] }
//         listProp = 'barcodeList'
//       } else {
//         params = { materialNos: [val] }
//         listProp = 'materialList'
//       }
//       WMSAPI.get(props.listAPIName, params)
//         .then((res: any) => {
//           // debugger
//           if (res && res.success) {
//             let _data: any[] = res[listProp]
//             if (_data.length === 0) {
//               _showFailToast('暂无数据')
//               return
//             }
//             // TODO: 使用静态测试数据
//             // let _data: any[] = testData.data
//             if (_data.length > 0) {
//               form.value = Object.assign({}, form.value, _data[0])
//             }

//             let arr: any[] = []
//             // 增加uuid为唯一识别符
//             _data.forEach((item) => {
//               item.uuid = uuidv4()
//               arr.push(item)
//             })
//             // 赋值表格数据
//             list.value = arr
//             // 存储原始数据
//             staticData = JSON.parse(JSON.stringify(arr))
//             staticData.forEach((item: any) => {
//               item.newQuantity = item.quantity
//             })
//             // 重新组合数据
//             props.enterAfterEvent && props.enterAfterEvent(list.value, staticData)

//             let arrs = list.value.map((item) => item.uuid)
//             // 默认将数据全选
//             if (props.mode === 'all') {
//               table.value?.handleSelect(arrs)
//             }
//           } else {
//             _showFailToast(res.message as string)
//           }
//         })
//         .catch((e) => {
//           // 在返回错误后清空页面
//           handleClear()
//         })
//         .finally(() => {
//           scanLoading.value = false
//           form.value.imBarcode = ''
//           // 查询结果之后重新聚焦
//           barcodeInputRef?.focus()
//         })
//     }
//   }
// }

/** 当前操作模式为addTo时回车事件-物料编号 */
let materialEnterByAddTo = (val: string | number | null) => {
  if (!val) {
    _showFailToast('请输入物料编号')
    return
  }
  /** 当前操作模式为addTo时回车事件-条码 */
  enterByAddTo(val, 'materialNos', 'materialList')
}
let barcodeEnterByAddTo = (val: string | number | null) => {
  if (!val) {
    _showFailToast('请输入条码')
    return
  }
  enterByAddTo(val, 'barcodes', 'barcodeList')
}
/** 当前操作模式为one|handler|all时回车事件-物料编号 */
let materialEnterByCommon = (val: string | number | null) => {
  if (!val) {
    _showFailToast('请输入物料编号')
    return
  }
  enterByCommon(val, 'materialNos', 'materialList')
}
/** 当前操作模式为one|handler|all时回车事件-条码 */
let barcodeEnterByCommon = (val: string | number | null) => {
  if (!val) {
    _showFailToast('请输入条码')
    return
  }
  enterByCommon(val, 'barcodes', 'barcodeList')
}
// /**
//  * @description: 当前操作模式为addTo时条码回车事件
//  * @param {*} val 条码值
//  */
// const barcodeEnterByAddTo = (val: string | number | null) => {
//   if (!val) {
//     _showFailToast('请输入条码')
//     return
//   }
//   // 1.判断是否重复扫码
//   if (list.value.length > 0) {
//     let target = list.value.filter((item) => item[props.scanlKey] === val)
//     if (target.length > 0) {
//       _showFailToast('请勿重复扫码')
//       return
//     }
//   }
//   // 条码/物料编号
//   let str: string = props.listAPIName.split('/').at(-1) ?? ''
//   let params: any = {}
//   let listProp = ''
//   if (str === 'GetMaterialBarcodeList') {
//     params = { barcodes: [val] }
//     listProp = 'barcodeList'
//   } else {
//     params = { materialNos: [val] }
//     listProp = 'materialList'
//   }

//   // 2.不重复则调用接口追加数据
//   WMSAPI.get(props.listAPIName, params)
//     .then((res: any) => {
//       if (res && res.success) {
//         let _data: any[] = res[listProp]

//         // 清空输入框
//         form.value.imBarcode = ''

//         if (_data === null || _data.length === 0) {
//           _showFailToast('暂无数据')
//           return
//         }
//         // 增加uuid为唯一识别符
//         _data.forEach((item) => {
//           item.uuid = uuidv4()
//           list.value.push(item)
//         })
//         // 存储原始数据
//         staticData = JSON.parse(JSON.stringify(list.value))
//         staticData.forEach((item: any) => {
//           item.newQuantity = item.quantity
//         })
//         let arrs = list.value.map((item) => item.uuid)
//         // 默认勾选数据
//         table.value?.handleSelect(arrs)
//       } else {
//         _showFailToast(res.message as string)
//       }
//     })
//     .catch(() => {
//       // 在返回错误后清空页面
//       // handleClear()
//     })
//     .finally(() => {
//       scanLoading.value = false
//       form.value.imBarcode = ''
//       // 查询结果之后重新聚焦
//       barcodeInputRef?.focus()
//     })
// }

/** 表格选中项-验证 */
let validateTable = () => {
  let flag: boolean = false
  for (let col of props.tableColumn) {
    let rules: any[] = col?.rules ?? []
    if (rules.length > 0) {
      for (let rule of rules) {
        if (rule.required) {
          for (let row of selectedList.value) {
            if ((row[col.prop] ?? '') === '') {
              flag = true
              break
            }
          }
        }
        if (rule.validator !== undefined) {
          for (let row of selectedList.value) {
            let idx = list.value.findIndex((item: any) => row.uuid === item.uuid)
            numBlurParams = ref<any>({ key: col.prop, index: idx })
            if (rule.validator(row[col.prop]) !== true) {
              flag = true
              break
            }
          }
        }
      }
    }
  }
  return flag
}
// 过账
const handleConfirm = async () => {
  try {
    // 表单验证
    await refFormGroup.value?.formComponent?.refForm.validate()
    // 表格必填项验证
    // await table.value?.refForm.validate()
    // 确认是否可以过账
    if (!props.isPass) {
      _showFailToast('序列号未扫描完。')
      return
    }
    if (selectedList.value.length === 0) {
      _showFailToast('请勾选数据')
      return
    }
    // 表格已选项数据必填项验证
    if (validateTable()) {
      _showFailToast('请将已勾选数据明细填写完整！')
      return
    }

    let key = getEditableKey(props.tableColumn)
    if (key && !selectedList.value.every((item) => Number(item[key]) > 0)) {
      _showFailToast('所提交项中存在数量小于或等于0的项目，请检查')
      return
    }
    // 过账前确认
    await showConfirmDialog({
      title: '提示',
      message: `本次过账共 ${selectedList.value.length} 条数据,累计数量是: ${computedTotal(
        selectedList.value
      )},是否确认过账？`
    })
    // 开始过账
    loading.value = true
    // 处理接口参数
    // let _form = Object.assign({}, form.value)
    // let postDate = _form.postDate
    // delete _form.postDate
    // 删除uuid,遍历实现
    let _list: any[] = JSON.parse(JSON.stringify(selectedList.value))
    _list.forEach((item) => delete item.uuid)

    let _data = {}

    if (passType.value === 'PostIn') {
      _data = getPostInParams(_list, form.value, { account, name }, props.type)
    } else if (passType.value === 'OutStock') {
      _data = getOutStockParams(_list, form.value, { account, name }, props.type)
    } else if (passType.value === 'MaterialBindBox') {
      _data = getBindBoxParams(_list)
    } else if (passType.value === 'MasterDataModify') {
      _data = getMasterDataModifyParams(_list)
    }
    // 表单验证完后，若有自定义方法，则执行
    if (props.submit) {
      props.submit(_data, loading)
    } else {
      console.log(_data)
      let res: any = await WMSAPI.post(props.passAPIName, _data)
      if (res && res.success) {
        showSuccessToast(res.message || '过账成功')
        // 清空表单和列表
        handleClear()
      } else {
        _showFailToast(res.message as string)
      }
      loading.value = false
    }
  } finally {
    loading.value = false
  }
}

// 获取过账（入库）的参数
const getMasterDataModifyParams = (_list: any[]) => {
  let _data: any = {
    materialList: _list
  }
  return _data
}

// 获取过账（物料类型分拣）的参数
const getBindBoxParams = (_list: any[]) => {
  let { boxID } = form.value

  let barcodes = _list.map((item: any) => {
    return item.barcode
  })
  let _data: any = {
    boxNo: boxID,
    barcodes: barcodes,
    oclas: '', // 移到类型-无数据
    remark: '', // 备注-无数据
    addResume: true // 后端说传-默认值-true
  }

  return _data
}

// 计算勾选的累计数量
const computedTotal = (arr: any[]) => {
  let key = getEditableKey(props.tableColumn)
  // 如果key不存在
  // debugger
  if (!key) return 0
  return arr.reduce((pre: any, next: any) => {
    return Number(pre) + Number(next[key])
  }, 0)
}

// 用于存储当前正在编辑的行的索引
let numBlurParams = ref<any>({ key: 'newQuantity', index: 0 })

// 校验规则
function validateErfmg(): any {
  let { key, index } = numBlurParams.value
  // 改变后的值
  let x = Number(list.value[index][key])
  // 原始值
  let y = staticData[index][key]
  if (!x || x < 0) return '数量不能小于等于0'
  if (x > y) return '数量不能大于' + y
  else return true
}

// 判断数量，不能大于原数量， 不能小于等于0
function inputNumHandler(key: string, index: number) {
  numBlurParams.value = { key, index }
}

// 初始化配置项
async function initConfig() {
  await getUserWarehouse()
  props.tableColumn.forEach((item) => {
    if (item.type === 'Table/NumberInput') {
      let _erfmgRules: any[] = [
        { required: true, message: '请输入数量', trigger: 'onBlur' },
        { validator: validateErfmg }
      ]
      item.rules = _erfmgRules
    }
  })
  _formList.value.forEach((item, index) => {
    // 仓库-获取下拉列表
    if (item.prop === 'warehouseNo') {
      item.change = wareHouseChange
      item.options = wareHouseList.value
    }
    // 箱子号-获取箱子明细
    if (item.prop === 'boxNo') {
      item.enter = boxIDEnter
      boxInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
    }
    // 箱子号/接收箱子号-获取区域
    if (item.prop === 'boxID' || item.prop === 'targetBoxID') {
      targetLocationProp.value = item.prop === 'targetBoxID' ? 'targetLocationID' : 'locationID'
      item.enter = boxNoEnter
      boxInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
    }
    // 区域/货位/接收货位-验证货位值
    if (item.prop === 'locationID' || item.prop === 'targetLocationID') {
      item.enter = areaEnter
      areaInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
      locationIndex.value = index
    }
    // 条码
    if (item.prop === 'imBarcode') {
      // 追加模式
      if (props.mode === 'addTo') {
        item.enter = barcodeEnterByAddTo
      } else {
        item.enter = barcodeEnterByCommon
      }
      barcodeInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
    }
    // 物料编号
    if (item.prop === 'materialNo') {
      // 追加模式
      if (props.mode === 'addTo') {
        item.enter = materialEnterByAddTo
      } else {
        item.enter = materialEnterByCommon
      }
      barcodeInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
    }
  })
}

// 清空
const handleClear = () => {
  // 额外参数
  exParams.value = {}
  // table数据
  list.value = []
  // 选中项集合
  selectedList.value = []
  // 表单
  form.value = {
    postDate: today
  }
  _formList.value[locationIndex.value].disabled = false // 禁用恢复
  // let inputRef = refFormGroup.value?.formComponent?.formInputRef[formList.value[3].prop].inputRef
  // inputRef.focus()
}
// 行右键点击方法
const clickHandler = (key: string, data: any, index: number) => {
  emits('clickHandler', key, data, index)
}

// getUserWarehouse()
initConfig()

// 将这个清除方法暴露出去
defineExpose({
  /**
   * @description:清空界面和所选内容方法
   */
  clearHandler: handleClear,
  /**
   * 表单
   */
  form,
  /**
   * 数据列表
   */
  list,
  /**
   * Table 实例
   */
  table
})
</script>

<style lang="scss" scoped>
.loading_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.form-vue {
  :deep(.van-cell__title) {
    width: 60px !important;
  }
}
</style>
