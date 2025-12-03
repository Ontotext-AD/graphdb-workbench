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
  };
  // singleSpaWebpackConfig.devServer.client.overlay = false;
  // singleSpaWebpackConfig.devServer.liveReload = false;

  // console.log('=============', JSON.stringify(singleSpaWebpackConfig, null, 2));
  return singleSpaWebpackConfig;
};
