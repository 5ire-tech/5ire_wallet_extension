#!/usr/bin/env node

// A script for developing a browser extension with live-reloading using Create React App (no need to eject).
// Run it instead of the "start" script of your app for a nice development environment.
// P.S.: Install webpack-extension-reloader.

// Force a "development" environment in watch mode
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

const fs = require("fs-extra");
const paths = require("react-scripts/config/paths");
const webpack = require("webpack");
const configFactory = require("react-scripts/config/webpack.config");
const ExtensionReloader = require("webpack-extension-reloader");
const cracoConfig = require("../craco.config");
// Create the Webpack config usings the same settings used by the "start" script of create-react-app.
const config = configFactory("development");

// Add the webpack-extension-reloader plugin to the Webpack config.
// It notifies and reloads the extension on code changes.
config.plugins.push(new ExtensionReloader());
const edited = {
  ...config,
  entry: {
    main: [
      require.resolve("react-dev-utils/webpackHotDevClient"),
      paths.appIndexJs,
    ].filter(Boolean),
    content: "./src/Scripts/content.js",
    background: "./src/Scripts/background.js",
    injected: "./src/Scripts/injected.js",
  },
  output: {
    ...config.output,
    filename: "static/js/[name].js",
  },
  optimization: {
    ...config.optimization,
    runtimeChunk: false,
  },
  resolve: {
    ...config.resolve,
    fallback: {
      ...config.resolve.fallback,
      path: require.resolve("path-browserify"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
    },
  },
};
// delete edited.devtool;
// Start Webpack in watch mode.
const compiler = webpack(edited);
const watcher = compiler.watch({}, function (err) {
  if (err) {
    console.error(err);
  } else {
    // Every time Webpack finishes recompiling copy all the assets of the
    // "public" dir in the "build" dir (except for the background.html, index.html and options.html)
    fs.copySync(paths.appPublic, paths.appBuild, {
      dereference: true,
      filter: (file) =>
        file !== paths.appHtml &&
        file !== paths.appBackgroundHtml &&
        file !== paths.appOptionsHtml,
    });
    // Read extension name and version from manifest
    const manifest = JSON.parse(
      fs.readFileSync(`${paths.appPublic}/manifest.json`, "utf8")
    );

    // Report on console the successful build
    console.clear();
    console.info(`${manifest.name} - ${manifest.version}`);
    console.info("Compiled successfully!");
    console.info("Built at", new Date().toLocaleTimeString());
    console.info();
    console.info("Note that the development build is not optimized.");
    console.info("To create a production build, use yarn build.");
    console.info();
  }
});
