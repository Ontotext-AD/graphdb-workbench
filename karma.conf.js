const DEV_CONFIG = require('./webpack.config.dev');
const {merge} = require('webpack-merge');
const path = require('path');

process.env.CHROME_BIN = require('puppeteer').executablePath();
const os = require('os');
const chromeHeadlessSupported = os.platform() !== 'win32' || Number((os.release().match(/^(\d+)/) || ['0', '0'])[1]) >= 10;


module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'jasmine-matchers'],

    client: {
        jasmine: {
            // Don't randomize test order for jasmine, otherwise weird things happen
            random: false
        }
    },


    // list of files / patterns to load in the browser
    files: [
        'test/test-main.js'
    ],


    // list of files / patterns to exclude
    exclude: [],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'test/test-main.js': ['webpack', 'sourcemap']
    },


    // Reuse the DEV configuration
    webpack: merge(DEV_CONFIG, {
        devtool: 'inline-source-map',
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: {
                        loader: 'istanbul-instrumenter-loader',
                        query: {
                            esModules: true
                        }
                    },
                    include: path.resolve('src/js/angular/')
                }
            ]
        }
    }),


    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],


    // optionally, configure the reporter
    coverageReporter: {
      includeAllSources: true,
      type: 'lcov',
      dir : 'coverage/',
      subdir: '.'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    browserNoActivityTimeout: 30000,


    // if ChromeHeadless is not supported configure Chrome in headless mode
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
        chromeHeadlessSupported ? 'ChromeHeadless' : 'Chrome'
    ],

    customLaunchers: {
        ChromeHeadless: {
            base: 'Chrome',
            flags: ['--no-sandbox', '--headless', '--disable-gpu', '--remote-debugging-port=9222']
        }
    },


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: 1
  });
};
