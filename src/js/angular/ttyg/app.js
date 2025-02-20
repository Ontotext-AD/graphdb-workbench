import 'angular/ttyg/controllers/ttyg-view.controller';
import 'ng-tags-input/build/ng-tags-input.min';

const modules = [
    'ngRoute',
    'graphdb.framework.ttyg.controllers.ttyg-view'
];

angular.module('graphdb.framework.ttyg', modules);
