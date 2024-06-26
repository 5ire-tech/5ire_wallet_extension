const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

//flag checks
const isChrome = process.env.BUILD_TYPE === "CHROME" ? true : false;
const Min = Boolean(Number(process.env.MINI));
module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === "ModuleScopePlugin"
      );

      webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      webpackConfig.ignoreWarnings = [/Failed to parse source map/];

      return {
        ...webpackConfig,
        entry: {
          main: [
            env === "development" && require.resolve("react-dev-utils/webpackHotDevClient"),
            paths.appIndexJs
          ].filter(Boolean),
          content: "./src/Scripts/content.js",
          background: "./src/Scripts/background.js",
          injected: "./src/Scripts/injected.js"
        },
        output: {
          ...webpackConfig.output,
          filename: "static/js/[name].js"
        },
        optimization: {
          ...webpackConfig.optimization,
          runtimeChunk: false,
          minimize: Min
        },
        resolve: {
          ...webpackConfig.resolve,
          fallback: {
            ...webpackConfig.resolve.fallback,
            path: require.resolve("path-browserify"),
            crypto: require.resolve("crypto-browserify"),
            stream: require.resolve("stream-browserify"),
            buffer: require.resolve("buffer"),
            http: require.resolve("stream-http"),
            https: require.resolve("https-browserify"),
            zlib: require.resolve("browserify-zlib"),
            vm: require.resolve("vm-browserify")
          }
        },
        plugins: [
          ...webpackConfig.plugins,
          new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"]
          }),
          new CopyPlugin({
            patterns: [
              {
                from: isChrome ? "./src/manifest/chrome.json" : "./src/manifest/firefox.json",
                to: "manifest.json"
              }
            ]
          }),
          new webpack.ProvidePlugin({
            process: "process/browser"
          })
        ]
      };
    }
  }
};
