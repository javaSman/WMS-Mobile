<template>
  <div>
    <!-- 表单布局 -->
    <van-cell-group>
      <van-cell title-class="toggleFormCellTitle" style="padding-left: 0; padding-right: 0; border-radius: 0">
        <template #title v-if="showFormList.length > 0">
          <van-icon :name="show ? 'arrow-down' : 'arrow'" @click="show = !show" />
        </template>
        <template #value>
          <FormVue ref="formComponent" v-model:formData="form" :formList="formList" />
        </template>
      </van-cell>
    </van-cell-group>
    <!-- 隐藏字段布局 -->
    <van-cell-group v-show="show" :style="showFormList.length > 0 ? 'padding-left: 20px' : ''">
      <FormVue ref="showFormComponent" v-model:formData="form" :formList="showFormList" />
    </van-cell-group>
    <!-- 列表信息总览 -->
    <van-sticky :offset-top="46">
      <van-grid
        direction="horizontal"
        :column-num="4"
        :border="false"
        style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc"
      >
        <van-grid-item>总数：{{ list.length }}</van-grid-item>
        <van-grid-item>已确认：{{ selectedList.length }}</van-grid-item>
        <van-grid-item>剩余数：{{ list.length - selectedList.length }}</van-grid-item>
        <van-grid-item>
          <van-checkbox v-model="selectAll" :disabled="props.chkDisabled" shape="square" @click="handleSelectAll">
            全选
          </van-checkbox>
        </van-grid-item>
      </van-grid>
    </van-sticky>

    <!-- 列表 -->
    <TableVue
      ref="table"
      v-model:table-data="list"
      :tableColumn="tableColumn"
      v-model:selection="selectedList"
      :disabledChk="chkDisabled"
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
  </div>
</template>

<script lang="ts" setup name="ToggleFormVue">
import { PropType, computed, ref, watch, reactive, nextTick } from 'vue'
import FormVue from '@/components/Form/index.vue'
import TableVue from '@/components/Table/index.vue'
import ActionBarVue from '@/views/businessComponents/ActionBar.vue'
import { FormConfig, TableColumn } from '@/typing'
import { MISWMSAPI } from '@/api/generalAPI'
import { showSuccessToast } from 'vant'
import Dates from '@/utils/datetime'
import { v4 as uuidv4 } from 'uuid'
import { showConfirmDialog } from 'vant'
import Loading from '@/components/Loading'
import { _showFailToast } from '@/utils/message'

let emits = defineEmits(['clickHandler', 'update:snrc'])
let props = defineProps({
  formList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 表单项数组
  showFormList: { type: Array as PropType<FormConfig[]>, default: () => [] }, // 需要展开显示的数据字段参数
  viewData: { type: Object as PropType<any>, default: () => ({}) }, // 列表信息总览数据
  tableColumn: { type: Array as PropType<TableColumn[]>, default: () => [] }, // 列表字段参数
  chkDisabled: { type: Boolean, default: () => false },
  submit: {
    type: Function,
    default: undefined
  }, // 过账按钮前执行事件
  passAPIName: { type: String, default: () => '' }, // 过账接口地址
  listAPIName: { type: String, default: () => '' }, // 扫码查询接口地址
  confirmText: { type: String, default: () => '过账' }, // 底部按钮显示文本
  enterFrontEvent: {
    type: Function,
    default: () => false
  }, // 条码回车事件前执行事件
  enterAfterEvent: {
    type: Function,
    default: undefined
  }, // 条码回车事件后执行事件，用于重新组合数据
  snrc: { type: Array as PropType<any[]>, default: () => [] }, // 确认信息数组
  isPass: { type: Boolean, default: () => true },
  // 1.扫码匹配字段一标识key，此key是用来实现业务的，必须传入；2.追加数据判断是否重复扫码的唯一识别符
  scanlKey: { type: String, default: '' },
  // 当前模式，all：加载接口后全选；one：扫码匹配或手动勾选，需传值scanlKey匹配字段；handler：只能手动勾选；addTo：追加数据
  mode: { type: String, default: 'one', required: true }
})

let table = ref<InstanceType<typeof TableVue> | null>(null)
let formComponent = ref<InstanceType<typeof FormVue> | null>(null)

const today = new Dates(new Date()).strftime('YYYY-MM-DD')
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
// 表单项数组
let formList = computed({
  get: () => props.formList,
  set: (val) => val
})
// 列表数据
let list = ref<any[]>([])
// 过账按钮loading
let loading = ref(false)
// 存储额外的参数对象
let exParams = reactive<any>({})
// 用于存储列表原始数据
let staticData: any[] = []

// 对比选中项长度与数据数组总长度，是否可以勾选全选复选框
watch(
  () => [selectedList.value.length, list.value.length],
  ([val1, val2]) => {
    selectAll.value = val1 === val2 && val1 !== 0
  }
)
/** 全选和反选 */
const handleSelectAll = () => {
  table.value?.checkboxGroup.toggleAll(selectAll.value)
}

/**
 * @description: 条码回车事件，需判断匹配明细的方式
 * @param {*} val 条码值
 */
const barcodeEnter = async (val: string | number | null) => {
  let inputRef = formComponent.value?.formInputRef[formList.value[0].prop].inputRef
  if (!val) {
    _showFailToast('请输入条码')
    return
  }
  // 以list.value的长度作为判断条件，大于0，表面如果页面明细没有被清除，等于0表明页面无信息
  if (list.value.length > 0) {
    // 1.当模式是扫码匹配
    if (props.mode === 'one') {
      // 从结果集中寻找
      let target = list.value.filter((item) => item[props.scanlKey] === val)
      if (target.length > 0) {
        // 每次都是追加，不是覆盖，因为存在连续扫码的情况
        let arrs = [...selectedList.value.map((item: any) => item.uuid), ...target.map((item: any) => item.uuid)]
        // 进行勾选
        table.value?.handleSelect(arrs)
        nextTick(() => {
          // 光标重新聚焦
          form.value[formList.value[0].prop] = ''
          inputRef.focus()
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
    Loading.show('数据加载中')
    // 否则加载接口数据然后全选
    // 如果有前置事件，则执行
    if (await props.enterFrontEvent(val, form.value.postDate)) {
      Loading.show('数据加载中')
      return
    } else {
      MISWMSAPI.post(props.listAPIName, { imBarcode: val })
        .then((res) => {
          if (res && res.success) {
            let _data: any = res.data
            form.value = Object.assign({}, form.value, _data.title)
            // 清空输入框
            form.value[formList.value[0].prop] = ''
            let arr: any[] = []
            // 增加uuid为唯一识别符
            ;(_data.data as any[]).forEach((item) => {
              item.uuid = uuidv4()
              arr.push(item)
            })
            // 赋值表格数据
            list.value = arr
            // 存储原始数据
            staticData = JSON.parse(JSON.stringify(arr))
            // 重新组合数据
            props.enterAfterEvent && props.enterAfterEvent(list.value, staticData)
            // 处理snrc确认数组 增加uuid为唯一识别符
            let snrc: any[] = []
            let _snrc = (_data.snrc as any[]) || []
            _snrc.forEach((item) => {
              item.uuid = uuidv4()
              snrc.push(item)
            })
            let arrs = list.value.map((item) => item.uuid)
            // 默认将数据全选
            if (props.mode === 'all') {
              table.value?.handleSelect(arrs)
            }
            // emits('update:snrc', [
            //   { equnr: '1271-001', uuid: 'xxx1', y: 1 },
            //   { equnr: '1344-001', uuid: 'xxx2', y: 2 },
            //   { equnr: '1344-002', uuid: 'xxx3', y: 3 }
            // ])

            // 序列号
            emits('update:snrc', snrc)
            // 额外的参数对象
            if (_data.wmsTools) exParams.wmsTools = _data.wmsTools // 卡板编号
            if (_data.whid) exParams.whid = _data.whid // 仓库ID
            if (_data.boxId) exParams.boxId = _data.boxId // 卡板编号
          } else {
            _showFailToast(res.data as string)
          }
        })
        .catch((e) => {
          // 在返回错误后清空页面
          handleClear()
        })
        .finally(() => {
          Loading.hide()
          // 查询结果之后重新聚焦
          inputRef.focus()
        })
    }
  }
}

/**
 * @description: 当前操作模式为addTo时条码回车事件
 * @param {*} val 条码值
 */
const barcodeEnterByAddTo = (val: string | number | null) => {
  let inputRef = formComponent.value?.formInputRef[formList.value[0].prop].inputRef
  if (!val) {
    _showFailToast('请输入条码')
    return
  }
  // 1.判断是否重复扫码
  if (list.value.length > 0) {
    let target = list.value.filter((item) => item[props.scanlKey] === val)
    if (target.length > 0) {
      _showFailToast('请勿重复扫码')
      return
    }
  }
  // 2.不重复则调用接口追加数据
  MISWMSAPI.post(props.listAPIName, { imBarcode: val })
    .then((res) => {
      if (res && res.success) {
        let _data: any = res.data
        form.value = Object.assign({}, form.value, _data.title)
        // 清空输入框
        form.value[formList.value[0].prop] = ''
        // 增加uuid为唯一识别符
        ;(_data.data as any[]).forEach((item) => {
          item.uuid = uuidv4()
          list.value.push(item)
        })
        // 存储原始数据
        staticData = JSON.parse(JSON.stringify(list.value))

        let arrs = list.value.map((item) => item.uuid)
        // 默认勾选数据
        table.value?.handleSelect(arrs)
      } else {
        _showFailToast(res.data as string)
      }
    })
    .catch((e) => {
      // 在返回错误后清空页面
      // handleClear()
    })
    .finally(() => {
      Loading.hide()
      // 查询结果之后重新聚焦
      inputRef.focus()
    })
}

// 过账
const handleConfirm = () => {
  // 表单验证
  formComponent.value?.refForm
    .validate()
    .then(() => {
      // 表格内表单验证
      table.value?.refForm
        .validate()
        .then(async () => {
          // 确认是否可以过账
          if (!props.isPass) {
            _showFailToast('序列号未扫描完。')
            return
          }
          if (selectedList.value.length === 0) {
            _showFailToast('请勾选数据')
            return
          } else {
            let key = getEditableKey()
            if (key && !selectedList.value.every((item) => Number(item[key]) > 0)) {
              _showFailToast('所提交项中存在数量小于或等于0的项目，请检查')
              return
            }

            showConfirmDialog({
              title: '提示',
              message: `本次过账共 ${selectedList.value.length} 条数据,累计数量是: ${computedTotal(
                selectedList.value
              )},是否确认过账？`
            })
              .then(async () => {
                loading.value = true
                // 处理接口参数
                let _form = Object.assign({}, form.value)
                let postDate = _form.postDate
                delete _form.postDate
                // 删除uuid,遍历实现
                let _list: any[] = JSON.parse(JSON.stringify(selectedList.value))
                _list.forEach((item) => delete item.uuid)
                let _data: any = {
                  postDate,
                  title: _form,
                  data: _list
                }
                // 增加额外的参数
                if (exParams.wmsTools) _data.wmsTools = exParams.wmsTools // 卡板编号
                if (exParams.whid) _data.whid = exParams.whid // 仓库ID
                if (exParams.boxId) _data.boxId = exParams.boxId // 卡板编号
                // 表单验证完后，若有自定义方法，则执行
                if (props.submit) {
                  props.submit(_data, loading)
                } else {
                  MISWMSAPI.post(props.passAPIName, _data)
                    .then((res) => {
                      if (res && res.success) {
                        showSuccessToast(res.msg)
                        // 清空表单和列表
                        handleClear()
                      } else {
                        _showFailToast(res.data as string)
                      }
                    })
                    .finally(() => {
                      loading.value = false
                    })
                }
                // on confirm
              })
              .catch(() => {
                // on cancel
              })
          }
        })
        .catch((e: any) => {
          console.log(e)
        })
    })
    .catch(() => {
      // console.log(e)
    })
}

// 计算勾选的累计数量
const computedTotal = (arr: any[]) => {
  let key = getEditableKey()
  // 如果key不存在
  if (!key) return 0
  return arr.reduce((pre, next) => {
    // eslint-disable-next-line no-prototype-builtins
    if (pre.hasOwnProperty(key)) {
      return Number(pre[key]) + Number(next[key])
    } else {
      return Number(next[key])
    }
  }, 0)
}

// 获取可编辑项的prop
// 取出tableColumn中类型是Table/Number的项目的prop，因为这个才是可以编辑的项
const getEditableKey = () => {
  let tarItem = props.tableColumn.find((item) => item.type === 'Table/Number')
  let key = tarItem?.prop || ''
  return key
}

// 用于存储当前正在编辑的行的索引
let numBlurParams = ref<any>({ key: 'erfmg', index: 0 })
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
function initConfig() {
  props.tableColumn.forEach((item) => {
    if (item.type === 'Table/NumberInput') {
      let _erfmgRules: any[] = [
        { required: true, message: '请输入数量', trigger: 'onBlur' },
        { validator: validateErfmg }
      ]

      item.rules = _erfmgRules
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
  let inputRef = formComponent.value?.formInputRef[formList.value[0].prop].inputRef
  inputRef.focus()
}
// 行右键点击方法
const clickHandler = (key: string, data: any, index: number) => {
  emits('clickHandler', key, data, index)
}

// 观察数据模式，条码绑定回车
watch(
  () => props.mode,
  (val) => {
    if (val === 'addTo') formList.value[0].enter = barcodeEnterByAddTo
    else formList.value[0].enter = barcodeEnter
  },
  { immediate: true, deep: true }
)

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
