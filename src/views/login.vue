<template>
  <div class="login-container">
    <van-nav-bar title="WMS" />
    <div class="center-content">
      <van-image
        width="12rem"
        height="12rem"
        fit="cover"
        :src="require('@/assets/images/lyric.png')"
        style="margin-bottom: 1rem"
      />
      <van-form ref="loginForm" class="login-form" autocomplete="on" :show-error="false" @submit="handleSubmit">
        <van-cell-group class="group-container">
          <!-- <van-cell class="cell-container"> -->
          <van-field
            ref="username"
            v-model="dataMap.userAccount"
            name="username"
            label="用户名"
            placeholder="用户名"
            left-icon="manager"
            autocomplete="on"
            style="margin-bottom: 1.5rem"
            label-width="3rem"
            :rules="[{ required: true, message: '用户名不能为空' }]"
            @keyup.enter="usernameEnter"
          />
          <van-field
            ref="password"
            v-model="dataMap.password"
            :type="passwordType || undefined"
            name="password"
            label="密码"
            placeholder="密码"
            left-icon="lock"
            autocomplete="on"
            label-width="3rem"
            style="margin-bottom: 1.5rem"
            :rules="[
              { required: true, message: '密码不能为空' },
              { pattern: /^.{6,}$/, message: '密码不能少于6位字符' }
            ]"
            @keyup.enter="passwordEnter"
          >
            <template #right-icon>
              <van-icon :name="!dataMap.showPwd ? 'closed-eye' : 'eye-o'" @click="showPwd" />
            </template>
          </van-field>
        </van-cell-group>
        <div style="margin: 16px 0">
          <van-button round block type="primary" native-type="submit" :loading="dataMap.loading">登录</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { reactive, ref, ComponentInternalInstance, getCurrentInstance } from 'vue'
import Cookies from 'js-cookie'
import { Form, Field, FieldType } from 'vant'
import useStore from '@/store'
import { _showFailToast } from '@/utils/message'

const { user } = useStore()

let dataMap = reactive({
  password: '', // 密码
  userAccount: '', // 工号
  showPwd: false,
  loading: false
})
let _this = getCurrentInstance() as ComponentInternalInstance
let el = _this.appContext.config.globalProperties

let passwordType = ref<FieldType>('password')

let loginForm = ref(Form)
let username = ref(Field)
let password = ref(Field)
// 判断当前token状态
function point() {
  const point = Cookies.get('point') !== undefined
  if (point) {
    _showFailToast({
      message: '当前登录状态已过期，请重新登录！'
    })
    Cookies.remove('point')
  }
}
// 用户名回车
function usernameEnter() {
  loginForm.value
    .validate('username')
    .then(() => {
      password.value.focus()
    })
    .catch(() => {
      username.value.focus()
    })
}
// 密码回车
function passwordEnter() {
  loginForm.value
    .validate('password')
    .then(() => {
      username.value.focus()
    })
    .catch(() => {
      password.value.focus()
    })
}
// 查看密码
function showPwd() {
  dataMap.showPwd = !dataMap.showPwd
  passwordType.value = !dataMap.showPwd ? 'password' : 'text'
  password.value.focus()
}
// 登录
function handleSubmit() {
  loginForm.value.validate().then(() => {
    // const userObj: LoginFormData = {
    //   account: dataMap.userAccount,
    //   password: dataMap.password
    // }
    dataMap.loading = true
    let _obj: any = {
      userName: dataMap.userAccount,
      password: dataMap.password,
      client_id: 'basic-web',
      client_secret: '1q2w3e*',
      grant_type: 'password'
    }
    let _data = new FormData()
    for (let d in _obj) {
      _data.append(d, _obj[d])
    }

    user
      .Login(_data)
      .then(() => {
        el?.$router.push('/')
      })
      .finally(() => {
        dataMap.loading = false
      })
  })
}

point()
</script>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100%;
  text-align: center;
  .svg-container {
    padding-right: 5px;
    display: inline-block;
  }
  .center-content {
    border-radius: 10px;
    background: #fafafa;
    width: 85%;
    text-align: center;
    margin-top: 10px;
    padding: 5%;
    display: inline-block;
    vertical-align: middle;
  }
  .group-container {
    background: unset;
    // width: 90%;
    // margin: 10px auto;
  }
  // cell组外框线不显示
  .group-container::after {
    border: none;
  }
  .cell-container {
    padding: 0px 0px;
    overflow: unset;
    margin: 20px 0;
  }
  // 达到验证错误信息能显示的目的
  .van-cell__value,
  .van-field {
    overflow: unset;
  }
  // 使用下拉框组件，达到验证错误信息能显示的目的
  .fieldRadio :deep(.van-field) {
    overflow: unset;
  }
  // 验证错误提示位置
  :deep(.van-field__error-message) {
    position: absolute;
    top: 28px;
    left: 0;
  }
}
</style>
