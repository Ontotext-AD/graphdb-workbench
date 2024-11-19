const { defineConfig } = require("cypress");
const webpack = require('@cypress/webpack-preprocessor');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3333/',
    video: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      // const options = {
      //   webpackOptions: require('./cypress-webpack.config'),
      //   watchOptions: {},
      // };
      //
      // on('file:preprocessor', webpack(options));
    },
  },
});
