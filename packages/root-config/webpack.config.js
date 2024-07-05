const { merge } = require("webpack-merge");
const singleSpaDefaults = require("webpack-config-single-spa");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

const host = 'localhost';
const portHere = 9000;
const portThere = 9001;

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
          port: portHere,
          host: host,
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
              context: ['/rest', '/repositories', '/protocol', '/rdf-bridge'],
              target: 'http://' + host + ':' + portThere,
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
