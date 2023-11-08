<script lang="ts">
import { onBeforeMount, onBeforeUpdate, h } from 'vue'
import { useRouter } from 'vue-router'
export default {
  setup() {
    // 写法可再优化
    onBeforeMount(() => {
      redirectFun()
    })
    onBeforeUpdate(() => {
      redirectFun()
    })
    function redirectFun() {
      const router = useRouter()
      const { params, query } = router.currentRoute.value
      const { path } = params
      router.replace({ path: '/' + (path as string[]).join('/'), query })
    }
  },
  render() {
    return h('div') // avoid warning message
  }
}
</script>
