import Cookies from 'js-cookie'
import Config from '@/settings'

const TokenKey = Config.TokenKey
const TokenWMSKey = Config.TokenWMSKey

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token: string, rememberMe: boolean) {
  if (rememberMe) {
    return Cookies.set(TokenKey, token, { expires: Config.tokenCookieExpires })
  } else return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
// KeyId
export function getKeyId() {
  return Cookies.get(TokenWMSKey)
}

export function setKeyId(token: string) {
  return Cookies.set(TokenWMSKey, token)
}

export function removeKeyId() {
  return Cookies.remove(TokenWMSKey)
}
