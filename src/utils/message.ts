import { showFailToast } from 'vant'

/**
 * 失败提示工具
 * @param msg 消息
 * @param delay 延迟，默认5s
 */
const _showFailToast = (msg:string|{message:string}, delay:number = 5000) => {
  showFailToast({
    message: typeof msg === 'string' ? msg : msg.message,
    duration: delay
  })
}
export {_showFailToast}
