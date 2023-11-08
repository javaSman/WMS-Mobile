// vue.config.js
const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

console.log(process.env.VUE_APP_BASE_API)
module.exports = {
  // 选项...
  publicPath: '/',
  outputDir: process.env.outputDir,
  assetsDir: '',
  indexPath: 'index.html',
  filenameHashing: true,
  pages: {
    index: {
      // page 的入口
      entry: 'src/main.ts',
      // 模板来源
      template: 'public/index.html',
      // 在 dist/index.html 的输出
      filename: 'index.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'WMS',
      // 在这个页面中包含的块，默认情况下会包含
      // 提取出来的通用 chunk 和 vendor chunk。
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
    // 当使用只有入口的字符串格式时，
    // 模板会被推导为 `public/subpage.html`
    // 并且如果找不到的话，就回退到 `public/index.html`。
    // 输出文件名会被推导为 `subpage.html`。
    // subpage: "src/subpage/main.js"
  },
  // 是否在开发环境下通过 eslint-loader 在每次保存时 lint 代码
  // 设置为 true 时，eslint-loader 会将 lint 错误输出为编译警告
  lintOnSave: false,
  // 是否使用包含运行时编译器的 Vue 构建版本
  runtimeCompiler: false,
  // 默认情况下 babel-loader 会忽略所有 node_modules 中的文件
  transpileDependencies: [],
  // 生产环境 sourceMap
  productionSourceMap: false,
  // 将 API 请求代理到 API 服务器
  devServer: {
    // host: '',
    port: 8091,
    https: false,
    hotOnly: false,
    proxy: {
      // // 非WMS业务，走企业云
      // '/eip-mapp-cmc-server': {
      //   target: process.env.VUE_APP_BASE_API,
      //   changeOrigin: true,
      //   pathRewrite: {
      //     '^/eip-mapp-cmc-server': 'eip-mapp-cmc-server'
      //   }
      // },
      // // 非WMS业务，走企业云
      // '/eip-mapp-sapwms-server': {
      //   target: process.env.VUE_APP_BASE_API,
      //   changeOrigin: true,
      //   pathRewrite: {
      //     '^/eip-mapp-sapwms-server': 'eip-mapp-sapwms-server'
      //   }
      // },
      // 非WMS业务，走企业云
      '/sapwms-api': {
        target: process.env.VUE_APP_BASE_API,
        changeOrigin: true,
        pathRewrite: {
          '^/sapwms-api': 'sapwms-api'
        }
      }
      // // WMS业务
      // '/api': {
      //   target: process.env.VUE_APP_BASE_API_WMS,
      //   changeOrigin: true,
      //   pathRewrite: {
      //     '^/api': 'api'
      //   }
      // },
      // // WMS业务登录
      // '/connect': {
      //   target: process.env.VUE_APP_BASE_API_WMS_LOGIN,
      //   changeOrigin: true,
      //   pathRewrite: {
      //     '^/connect': 'connect'
      //   }
      // }
    },
    disableHostCheck: true
  },
  // 构建时开启多进程处理 babel 编译
  parallel: require('os').cpus().length > 1,
  // 第三方插件配置
  pluginOptions: {
    // css引入sass全局变量
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        // 两种路径写法都可以，这里的路径不能使用 @ 符号，否则会报错
        path.resolve(__dirname, 'src/styles/variables.scss')
      ]
    }
  },
  configureWebpack: {
    // devtool: ' source-map',
    resolve: {
      alias: {
        '@': resolve('src'),
        '*': resolve('')
      }
    }
  },
  chainWebpack(config) {
    // set svg-sprite-loader
    config.resolve.extensions.add('ts').add('tsx')
    config.module.rule('svg').exclude.add(resolve('src/assets/icons')).end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  }
}
