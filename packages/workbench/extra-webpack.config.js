const {resolve} = require('node:path');
const singleSpaAngularWebpack = require('single-spa-angular/lib/webpack').default;

function patchSassLoader(rules) {
  if (!Array.isArray(rules)) return;
  rules.forEach(rule => {
    patchSassLoader(rule.rules);
    patchSassLoader(rule.oneOf);
    (rule.use || []).forEach(use => {
      if (typeof use === 'object' && use.loader && use.loader.includes('sass-loader')) {
        use.options = {
          ...use.options,
          sassOptions: {
            silenceDeprecations: ['color-functions', 'global-builtin', 'import', 'if-function'],
            loadPaths: [resolve(__dirname)]
          }
        };
      }
    });
  });
}

module.exports = (config, options) => {
  const singleSpaWebpackConfig = singleSpaAngularWebpack(config, options);

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

  patchSassLoader(singleSpaWebpackConfig.module.rules);

  return singleSpaWebpackConfig;
};
