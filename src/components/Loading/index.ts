import { createApp, App } from 'vue'
import LoadingComponent from '@/components/Loading/index.vue'
const container = document.createElement('div')
let instance: null | App<Element> = null
const Loading = {
  show(msg?: string) {
    if (!instance) instance = createApp(LoadingComponent, { tips: msg })
    instance.mount(container)
    document.body.appendChild(container)
  },
  hide() {
    instance?.unmount()
    instance = null
  }
}
export default Loading
