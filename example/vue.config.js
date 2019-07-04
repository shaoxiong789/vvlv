const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}

const TerserPlugin = require('terser-webpack-plugin');
const ComperssionPlugin = require('compression-webpack-plugin');

module.exports = {
  // 部署应用时的基本 URL
  // baseUrl: process.env.NODE_ENV === 'production' ? '' : '',
  productionSourceMap: false,
  devServer: {
    // 设置主机地址
    host: '',
    // 设置默认端口
    port: 8080,
    // 设置代理
    proxy: {
      '/api': {
        // 目标 API 地址
        // target: 'https://www.laoge.mobi',
        target: 'http://localhost:7001',

        // 如果要代理 websockets
        ws: false,
        // 将主机标头的原点更改为目标URL
        changeOrigin: false
      }
    }
  },

  publicPath: process.env.NODE_ENV === 'production'
    ? './'
    : '/',

  // 默认在生成的静态资源文件名中包含hash以控制缓存
  filenameHashing: true,

  // 是否在开发环境下通过 eslint-loader 在每次保存时 lint 代码 (在生产构建时禁用 eslint-loader)
  // lintOnSave: process.env.NODE_ENV !== 'production',
  lintOnSave: false,

  // 多线程暂时关闭,因为在编译 md 文件的时候会报错.
  parallel: false,

  css: {
    // 是否使用css分离插件 ExtractTextPlugin
    extract: true,
    // 开启 CSS source maps?
    sourceMap: false,
    // css预设器配置项
    loaderOptions: {},
    // 启用 CSS modules for all css / pre-processor files.
    modules: false
  },

  // eslint-disable-next-line consistent-return
  // 开启 gzip
  configureWebpack: (config) => {
    if (process.env.NODE_ENV !== 'development') {
      return {
        plugins: [new ComperssionPlugin({
          test: /\.js$|\.html$|\.css/,
          threshold: 10240,
          deleteOriginalAssets: false
        })]
      };
    }
  },

  // 对内部的 webpack 配置（比如修改、增加Loader选项）(链式操作)
  chainWebpack: (config) => {
    // 添加别名
    config.resolve.alias
      .set('@', resolve('src'))

    // 关闭利用空余带宽加载文件 提升首页速度
    config.plugins.delete('prefetch');

    if (process.env.use_analyzer) {
      config
        .plugin('webpack-bundle-analyzer')
        // eslint-disable-next-line global-require
        .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin);
    }


    config
      // 开发环境
      .when(
        process.env.NODE_ENV === 'development',
        // sourcemap不包含列信息
        // eslint-disable-next-line no-shadow
        config => config.devtool('cheap-source-map'),
      )
      // 非开发环境
      // eslint-disable-next-line no-shadow
      .when(process.env.NODE_ENV !== 'development', (config) => {
        config.optimization.minimizer([
          new TerserPlugin({
            cache: true,
            parallel: true,
            sourceMap: true
          })
        ]);
    });
    
  }


};
