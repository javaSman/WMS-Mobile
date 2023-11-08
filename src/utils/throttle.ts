/**
 * @description 节流函数
 * @param func  要节流的函数
 * @param wait  时间间隔
 */
const throttle = (func:any, wait:number) => {
  let timer:number|null = null
  return (...args:any) => {
    if (!timer) {
      func.apply(this, args)
      timer = window.setTimeout(() => {
        if (timer) clearInterval(timer)
        timer = null
      }, wait)
    }
  }
}

export {
  throttle
}
