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
import { PropType, ref, computed, onMounted } from 'vue'
import FormGroup from '../../components/FormGroup.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { FormConfig } from '@/typing'
import { WMSAPI } from '@/api/generalAPI'
import { showSuccessToast, FieldInstance } from 'vant'
import Dates from '@/utils/datetime'
import useStore from '@/store'
import { GetBoxInfoByBoxId, GetLocationInfo } from '@/api/system/common'
import { _showFailToast } from '@/utils/message'

let props = defineProps({
  formList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 表单项数组
  showFormList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 需要展开显示的数据字段参数
  submit: { type: Function, default: undefined }, // 过账按钮前执行事件
  passAPIName: { type: String, default: () => '' }, // 过账接口地址
  boxIDAPIName: { type: String, default: () => '' }, // 扫码箱子号查询接口地址
  isPass: { type: Boolean, default: () => true }
})

let refFormGroup = ref<any>({}) // 表单组合ref

let { user } = useStore()
let { account, name } = user.user

const today = new Dates(new Date()).strftime('YYYY-MM-DD')

// 表单对象，初始化过账日期
let form = ref<any>({
  postDate: today
})
// 点击左侧箭头是否展开
let show = ref(false)
// 表单项数组，因需要二次赋值，但是子组件深度监听都监听不到props.formList的改变，computed是异步会有数据延迟，只好是用ref
let _formList = ref<FormConfig[]>(JSON.parse(JSON.stringify(props.formList)))

// 过账按钮loading
let loading = ref(false)
// 扫条码时进行loading
const scanLoading = ref(false)

let boxInputRef: FieldInstance | null = null // 箱子号ref
let areaInputRef: FieldInstance | null = null // 区域ref

let operateType = ref(1) // 操作类型-bind-1|unbind-0

// let locationIndex = ref()

// 按钮文字
let confirmText = computed(() => {
  let str = ''
  switch (operateType.value) {
    case 1: {
      str = '绑定'
      break
    }
    case 0: {
      str = '解绑'
      break
    }
    default: {
      str = '绑定'
    }
  }
  return str
})

/** 箱子号回车
 *  1、查询箱子是否存在-
 *  2、查询箱子是否有绑定货位-（1）未绑定货位-光标跳转到【货位】；（2）已绑定货位-给货位赋值、光标跳转到【下一输入框】
 */
function boxNoEnter(val: string | null) {
  if (!val) return
  // 调用接口带出区域，如果区域有值，光标跳转到条码，没有跳转到区域
  GetBoxInfoByBoxId(val)
    .then((res: any) => {
      // 判断箱子号是否存在
      if (res.success) {
        // 判断箱子号是否可以带出货位
        if (res.locationNo) {
          form.value.locationNo = res.locationNo as string // locationID 字段根据需求
          // setLocationDisable(true)
          operateType.value = 0 // 可进行【解绑】操作
        } else {
          // setLocationDisable(false)
          areaInputRef?.focus()
          operateType.value = 1 // 可进行【绑定】操作
        }
      } else {
        // setLocationDisable(false)
        _showFailToast(res.message as string)
        operateType.value = 1 // 可进行【绑定】操作
        if (res.message.includes('没有绑定货位')) {
          areaInputRef?.focus()
        } else {
          boxInputRef?.focus() // boxInputRef 字段根据需求
        }
      }
    })
    .catch(() => {
      boxInputRef?.focus() // boxInputRef 字段根据需求
      // setLocationDisable(false)
    })
}

/** 设置货位禁用状态 */
// let setLocationDisable = (flag: boolean) => {
//   if ((locationIndex.value ?? '') !== '') {
//     _formList.value[locationIndex.value].disabled = flag
//   }
// }

/** 区域回车
 *  查询区域是否存在-（1）存在-光标跳转到【下一输入框】（2）不存在-错误提示
 */
function areaEnter(val: string | null) {
  if (!val) return
  GetLocationInfo(val)
    .then((res: any) => {
      if (!res.success) {
        _showFailToast(res.message as string)
        areaInputRef?.focus()
      }
    })
    .catch(() => {
      areaInputRef?.focus()
    })
}

// 过账
const handleConfirm = async () => {
  try {
    // 表单验证
    await refFormGroup.value?.formComponent?.refForm.validate()
    // 确认是否可以过账
    if (!props.isPass) {
      _showFailToast('序列号未扫描完。')
      return
    }

    // 开始过账
    loading.value = true

    // 获取传参值
    let _data = {}
    _data = getPassParams()

    // 表单验证完后，若有自定义方法，则执行
    if (props.submit) {
      props.submit(_data, loading)
    } else {
      let res: any = await WMSAPI.post(props.passAPIName, _data)
      if (res && res.success) {
        showSuccessToast(res.message ?? '操作成功')
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

// 获取过账的参数
const getPassParams = () => {
  let { boxNo, locationNo } = form.value
  let _data: any = {
    cardNo: account, // 工号
    cardName: name, // 姓名
    boxNo: boxNo, // 箱子号
    locationNo: locationNo, // 货位（区域）
    type: operateType.value // 0:解绑 1:绑定
  }
  return _data
}

// 初始化配置项
async function initConfig() {
  _formList.value.forEach((item) => {
    // 箱子号/接收箱子号-获取区域
    if (item.prop === 'boxNo') {
      item.enter = boxNoEnter
      boxInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
      boxInputRef?.focus()
    }
    // 区域/货位/接收货位-验证货位值
    if (item.prop === 'locationNo') {
      item.enter = areaEnter
      areaInputRef = refFormGroup.value?.formComponent?.formInputRef[item.prop].inputRef
      // locationIndex.value = index
    }
  })
}

// 清空
const handleClear = () => {
  // 表单
  form.value = {
    postDate: today
  }
  boxInputRef?.focus() // 初始聚焦
}

onMounted(() => {
  initConfig()
})

// 将这个清除方法暴露出去
defineExpose({
  /**
   * @description:清空界面和所选内容方法
   */
  clearHandler: handleClear,
  /**
   * 表单
   */
  form
})
</script>

<style lang="scss" scoped>
.loading_wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
