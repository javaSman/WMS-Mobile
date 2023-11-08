// import { parseTime } from '@/utils/index'
import { onBeforeUnmount, ref, shallowRef, unref } from 'vue'
;(function waterMark() {
  const id = 'watermark-dom'
  const watermarkEl = shallowRef()
  const appendEl = ref(document.body)
  /** 创建水印 */
  const createWatermark = str => {
    if (unref(watermarkEl)) {
      updateWatermark({ str })
      return id
    }
    const div = document.createElement('div')
    watermarkEl.value = div
    div.style.pointerEvents = 'none'
    div.style.top = '0px'
    div.style.left = '0px'
    div.style.position = 'absolute'
    div.style.zIndex = '100000'
    const el = unref(appendEl)
    if (!el) return id
    const { clientHeight: height, clientWidth: width } = el
    updateWatermark({ str, width, height })
    el.appendChild(div)
    return id
  }

  /** 更新水印，高度、宽度、背景 */
  function updateWatermark(options) {
    const el = unref(watermarkEl)
    if (!el) return
    if (options.width) {
      el.style.width = `${options.width}px`
    }
    if (options.height) {
      el.style.height = `${options.height}px`
    }
    if (options.str) {
      el.style.background = `url(${createBase64(options.str)}) left top repeat`
    }
  }
  /**  创建背景图
   * @param stirng
   */
  function createBase64(str) {
    const can = document.createElement('canvas')
    const width = 300
    const height = 240
    Object.assign(can, { width, height })

    const cans = can.getContext('2d')
    if (cans) {
      cans.rotate((-20 * Math.PI) / 120)
      cans.font = '15px Vedana'
      cans.fillStyle = 'rgba(0, 0, 0, 0.15)'
      // cans.
      cans.textAlign = 'left'
      cans.textBaseline = 'middle'
      cans.fillText(str, width / 20, height)
    }
    return can.toDataURL('image/png')
  }
  const func = function () {
    const el = unref(appendEl)
    if (!el) return
    const { clientHeight: height, clientWidth: width } = el
    updateWatermark({ height, width })
  }
  function resizeWM() {
    func()
  }
  createWatermark('111111111')
  window.addEventListener('resize', resizeWM)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeWM)
  })
})()
