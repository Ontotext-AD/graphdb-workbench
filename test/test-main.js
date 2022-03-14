import 'jquery';
import 'angular/plugin-registry';
import 'lib/angularjs/1.3.8/angular.js';
import './lib/angularjs/1.3.8/angular-mocks';

// See https://github.com/webpack-contrib/karma-webpack#alternative-usage

const testsContext = require.context('.', true, /.spec$/);
export const bundle = require('../src/i18n/locale-en.json');
testsContext.keys().forEach(testsContext);
