import 'lib/jquery/2.1.4/jquery.min.js';
import 'lib/angularjs/1.3.8/angular.js';
import './lib/angularjs/1.3.8/angular-mocks';

// See https://github.com/webpack-contrib/karma-webpack#alternative-usage

const testsContext = require.context('.', true, /.spec$/);
testsContext.keys().forEach(testsContext);
