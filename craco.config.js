const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");

//flag checks
const isChrome = process.env.BUILD_TYPE === 'CHROME' ? true : false;
const Min = Boolean(Number(process.env.MINI)) ? true : false

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      return {
        ...webpackConfig,
        entry: {
          main: [
            env === "development" &&
            require.resolve("react-dev-utils/webpackHotDevClient"),
            paths.appIndexJs,
          ].filter(Boolean),
          content: "./src/Scripts/content.js",
          background: "./src/Scripts/background.js",
          injected: "./src/Scripts/injected.js",

        },
        output: {
          ...webpackConfig.output,
          filename: "static/js/[name].js",
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
          },
        },
        plugins: [
          ...webpackConfig.plugins,
          new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
          }),
          new CopyPlugin({
            patterns: [
              { from: isChrome ? "./src/manifest/chrome.json" : "./src/manifest/firefox.json", to: "manifest.json" },
            ],
          }),
        ],

      };
    },
  },
};
