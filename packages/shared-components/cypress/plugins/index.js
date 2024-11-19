const webpack = require('@cypress/webpack-preprocessor');

module.exports = (on) => {
  const options = {
    webpackOptions: require('../../cypress-webpack.config'),
    watchOptions: {},
  };

  on('file:preprocessor', webpack(options));
};
