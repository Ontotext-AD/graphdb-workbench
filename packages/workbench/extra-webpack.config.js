const singleSpaAngularWebpack = require('single-spa-angular/lib/webpack').default;

module.exports = (config, options) => {
  const singleSpaWebpackConfig = singleSpaAngularWebpack(config, options);

  // Ensure Zone.js is included
  // singleSpaWebpackConfig.externals = singleSpaWebpackConfig.externals || {};
  // delete singleSpaWebpackConfig.externals['zone.js'];
  // Feel free to modify this webpack config however you'd like to

  singleSpaWebpackConfig.externals = [...singleSpaWebpackConfig.externals, "@ontotext/workbench-api"];
  singleSpaWebpackConfig.experiments.outputModule = true;
  if (singleSpaWebpackConfig.output) {
    delete singleSpaWebpackConfig.output.library;
  }

  singleSpaWebpackConfig.output = {
    ...singleSpaWebpackConfig.output,
    filename: 'workbenchApp.js',
    publicPath: 'auto',
  };

  singleSpaWebpackConfig.devServer = {
    ...singleSpaWebpackConfig.devServer,
    headers: {
      ...(singleSpaWebpackConfig.devServer?.headers),
      'Access-Control-Allow-Origin': '*',
    },
  };
  // singleSpaWebpackConfig.devServer.client.overlay = false;
  // singleSpaWebpackConfig.devServer.liveReload = false;

  return singleSpaWebpackConfig;
};
