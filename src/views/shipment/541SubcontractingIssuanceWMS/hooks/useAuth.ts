import { ExtraProps } from '@/typing'
import { ref } from 'vue'

const useAuth = () => {
  const userAuthVisible = ref(true)
  const extraParams = ref<ExtraProps | null>(null)
  return {
    userAuthVisible,
    extraParams
  }
}
export default useAuth
