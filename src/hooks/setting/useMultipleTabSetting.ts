export function tagSetting () {
  //  TODO: 后续可以拓展到vuex存储，做全局设置
  const getShowRedo = true
  const getShowQuick = true
  const getShowFold = true
  return {
    getShowRedo,
    getShowQuick,
    getShowFold
  }
}
