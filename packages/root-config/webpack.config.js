const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
require('dotenv').config({path:'../../.env'});

require('dotenv').config({path:'../../.env'});

module.exports = (webpackConfigEnv, argv) => {
  const orgName = "ontotext";
  const defaultConfig = singleSpaDefaults({
    orgName,
    projectName: "root-config",
    webpackConfigEnv,
    argv,
    disableHtmlGeneration: true,
  });

  return merge(defaultConfig, {
    // modify the webpack config however you'd like to by adding to this object
    plugins: [
      new HtmlWebpackPlugin({
        inject: false,
        template: "src/index.ejs",
        templateParameters: {
          isLocal: webpackConfigEnv && webpackConfigEnv.isLocal,
          orgName,
        },
      }),
    ],
      devServer: {
          // disableHostCheck: true,
          allowedHosts: 'all',
          // contentBase: path.join(__dirname, 'dist/'),
          static: {
              directory: path.join(__dirname, 'dist/')
          },
          compress: true,
          port: process.env.ROOT_CONFIG_PORT,
          host: process.env.ROOT_CONFIG_HOST,
          headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
              "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization, x-graphdb-repository",
          },
          // needed to handle urls sent by open id providers that contain dots
          historyApiFallback: {
              disableDotRule: true
          },
          proxy: [{
                context: [process.env.LEGACY_WORKBENCH_PREFIX],
                target: process.env.LEGACY_WORKBENCH_PROTOCOL + '://' + process.env.LEGACY_WORKBENCH_HOST + ':' + process.env.LEGACY_WORKBENCH_PORT,
                pathRewrite: { [`^${process.env.LEGACY_WORKBENCH_PREFIX}`]: '' }
            },
            {
                context: [process.env.WORKBENCH_PREFIX],
                target: process.env.WORKBENCH_PROTOCOL + '://' + process.env.WORKBENCH_HOST + ':' + process.env.WORKBENCH_PORT,
                pathRewrite: { [`^${process.env.WORKBENCH_PREFIX}`]: '' },
            },
            {
                context: [process.env.ROOT_CONFIG_PREFIX],
                target: process.env.ROOT_CONFIG_PROTOCOL + '://' + process.env.ROOT_CONFIG_HOST + ':' + process.env.ROOT_CONFIG_PORT,
                pathRewrite: { [`^${process.env.ROOT_CONFIG_PREFIX}`]: '' }
            },
            {
                context: [process.env.NAVBAR_PREFIX],
                target: process.env.NAVBAR_PROTOCOL + '://' + process.env.NAVBAR_HOST + ':' + process.env.NAVBAR_PORT,
                pathRewrite: { [`^${process.env.NAVBAR_PREFIX}`]: '' }
            },
            {
                context: [process.env.API_PREFIX],
                target: process.env.API_PROTOCOL + '://' + process.env.API_HOST + ':' + process.env.API_PORT,
                pathRewrite: { [`^${process.env.API_PREFIX}`]: '' }
            },
            {
              context: ['/rest', '/repositories', '/protocol', '/rdf-bridge'],
              target: process.env.LEGACY_WORKBENCH_PROTOCOL + '://' + process.env.LEGACY_WORKBENCH_HOST + ':' + process.env.LEGACY_WORKBENCH_PORT,
              onProxyRes: (proxyRes) => {
                  var key = 'www-authenticate';
                  if (proxyRes.headers[key]) {
                      proxyRes.headers[key] = proxyRes.headers[key].split(', ');
                  }
              }
          }]
      }
  });
};
