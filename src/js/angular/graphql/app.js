import 'angular/graphql/controllers/graphql-playground-view.controller';
import 'angular/core/directives/graphql-playground/graphql-playground.directive';

const modules = [
    'ngRoute',
    'graphdb.framework.graphql.controllers.graphql-playground-view',
    'graphdb.framework.core.directives.graphql-playground'
];

angular.module('graphdb.framework.graphql', modules);