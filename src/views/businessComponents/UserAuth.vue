<template>
  <van-overlay :show="visible">
    <div class="wrapper">
      <div class="context">
        <div class="title">
          <SvgIcon iconFileName="userAuth" />
          <span class="title_name">用户验证</span>
        </div>
        <div class="tips">请输入接收人！</div>
        <div class="inputItem">
          <input placeholder="请输入账号" v-model="userInfo.account" focus />
        </div>
        <div class="inputItem">
          <input placeholder="请输入密码" type="password" v-model="userInfo.password" @keyup.enter="comfirAuth" />
        </div>
        <div class="back">
          <span @click="coloseMocal">返回</span>
        </div>
        <van-button block color="green" :loading="authLoading" class="btn" @click="comfirAuth">确定</van-button>
      </div>
    </div>
  </van-overlay>
</template>

<script lang="ts" setup name="TableVue">
import { reactive, ref } from 'vue'
import SvgIcon from '@/components/SvgIcon/index.vue'
import useStore from '@/store'
import { WMSLogin, getuserInfo } from '@/api/system/login'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { ExtraProps } from '@/typing'
import { _showFailToast } from '@/utils/message'

let emits = defineEmits<{
  (e: 'update:visible', val: boolean): void
  (e: 'update:extra', val: ExtraProps | null): void
  /** @description 授权通过时的回调函数，用于处理非常业务 */
  (e: 'comfir', val: ExtraProps): void
}>()
withDefaults(
  defineProps<{
    visible: boolean
    extra?: ExtraProps | null
  }>(),
  {
    visible: false
  }
)
const { user } = useStore()
const router = useRouter()
const userInfo = reactive<{
  account: string
  password: string
}>({
  account: '03351',
  password: '1q2w3E*'
})
const authLoading = ref(false)

// 关闭校验框
// TODO 此处应该跳转路由，暂定关闭
const coloseMocal = () => {
  emits('update:visible', false)
  router.back()
}

// 确认登陆授权,此处调用登陆接口（暂定）
const comfirAuth = async () => {
  try {
    if (userInfo.account && userInfo.password) {
      authLoading.value = true
      // TODO 现在所有鉴权的接口都使用WMS登录接口
      let _obj: any = {
        userName: userInfo.account,
        password: userInfo.password,
        client_id: 'basic-web',
        client_secret: '1q2w3e*',
        grant_type: 'password'
      }
      let _data = new FormData()
      for (let d in _obj) {
        _data.append(d, _obj[d])
      }
      let res = await WMSLogin(_data)
      if (res.access_token) {
        let res2 = await getuserInfo(userInfo.account)
        if (res2.success) {
          // 获取store的账号和名称+这次鉴权人的账号和名称合并成一个参数给外部
          let localUser = user.user
          let combineParams = {
            cardmo: localUser.account,
            cardmame: localUser.name,
            cardno: res2.userName,
            cardname: res2.name
          }
          // 放入缓存
          user.authUserInfo = combineParams
          emits('update:extra', combineParams)
          emits('update:visible', false)
          // 这里放一个事件出去,某些业务可能需要授权后再调用过账业务的
          emits('comfir', combineParams)
        } else {
          showToast({
            message: res.msg
          })
        }
      }
      authLoading.value = false
    } else {
      _showFailToast({ message: '账号和密码不允许为空' })
    }
  } catch {
    authLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.context {
  width: 95%;
  height: auto;
  border-radius: 6px;
  background-color: #fff;
  position: relative;
  padding: 10px;
  box-sizing: border-box;

  .title {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    column-gap: 10px;

    .title_name {
      font-size: 18px;
      font-weight: 400;
    }
  }

  .tips {
    color: rgba(45, 17, 215, 0.9);
    text-align: left;
    margin-top: 5px;
  }

  .inputItem {
    margin-top: 20px;

    input {
      width: 100%;
      border: none;
      border-bottom: 1px solid #ccc;
    }
  }

  .back {
    margin-top: 10px;
    text-align: right;
    color: rgba(45, 17, 215, 0.9);
  }

  .btn {
    margin-top: 10px;
  }
}
</style>
