/**
 * 自适应表格高度
 * 使用：
 * <el-table height="100px" v-adaptive="{bottomOffset: 30}">...</el-table>
 * el-table height (必须设置高度属性，不可省略，100无具体意义，仅为初始值)
 * 修改为(1)填-1时时高度自适应(2)填其他数值时使用填写高度(3)不填时为表格高度不填状态
 * bottomOffset 代表距离底部的距离
 * bottomOffset: 30(default)   // 从这一页的底部到表格的高度.
 */
let heightMap: any = {}
// 设置表格高度
const doResize = (el: any, binding: any) => {
  const { instance: $table } = binding
  // 获取调用传递过来的数据
  const { value } = binding
  // if (!$table.height) {
  if ($table.height === -1) {
    // 获取距底部距离（用于展示页码等信息）
    const bottomOffset = (value && value.bottomOffset) || 90
    let _name = binding.instance.$el.className

    if (!$table) return
    let _top = el.getBoundingClientRect().top
    // TODO:这个做法不太好，对于隐藏的元素dom设置一个常量
    if (_top === 0) {
      _top = heightMap[_name]
    } else {
      heightMap[_name] = _top
    }
    // 计算列表高度并设置
    const height = window.innerHeight - _top - bottomOffset
    $table.$refs.refTable.layout.setHeight(height)
    $table.$refs.refTable.doLayout()
  }
}

const tableAdaptive = (app: any) => {
  // 定义变量监听搜索栏高度
  let resizeObserver: any = null
  app.directive('tableAdaptive', {
    // 初始化设置
    beforeMount(el: any, binding: any) {
      // 设置resize监听方法
      el.resizeListener = () => {
        doResize(el, binding)
      }
      // 绑定监听方法到addResizeListener
      window.addEventListener('resize', el.resizeListener)
      // window.addEventListener('resize', domEl.resizeListener)
    },
    // 绑定默认高度
    mounted(el: any, binding: any) {
      let domEl = document.getElementsByClassName('head-container')[0]
      // 如果 DOM 存在加一个监听事件
      if (domEl) {
        // entries 是一个数组 里面有5个属性能用到的只有两个contentRect, target
        // contentRect 是dom的几何信息
        // target 和点击事件里面的target一样的 dom对象
        resizeObserver = new ResizeObserver(function(entries) {
          doResize(el, binding)
        })
        resizeObserver.observe(domEl)
      }
      doResize(el, binding)
    },
    // 销毁时设置
    unmounted(el: any) {
      // 移除resize监听
      window.removeEventListener('resize', el.resizeListener)
      resizeObserver && resizeObserver.disconnect()
    }
  })
}
export default {
  install(app: any) {
    tableAdaptive(app)
  }
}
