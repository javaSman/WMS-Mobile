<template>
  <!-- <a href="/download.apk"><img src="/download.apk.png" /></a> -->
  <van-nav-bar title="扫码下载" />
  <div class="download">
    <img src="/download.apk.png" />
  </div>
</template>

<style scoped lang="scss">
.download {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 46px);
  img{
    width: 300px; height: 300px
  }
}
</style>
