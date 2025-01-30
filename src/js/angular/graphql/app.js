import 'angular/graphql/controllers/graphql-playground-view.controller';
import 'angular/graphql/controllers/graphql-endpoint-management-view.controller';
import 'angular/graphql/controllers/create-graphql-endpoint-view.controller';
import 'angular/core/directives/graphql-playground/graphql-playground.directive';

const modules = [
    'ngRoute',
    'graphdb.framework.graphql.controllers.graphql-endpoint-management-view',
    'graphdb.framework.graphql.controllers.graphql-playground-view',
    'graphdb.framework.graphql.controllers.create-graphql-endpoint-view',
    'graphdb.framework.core.directives.graphql-playground'
];

angular.module('graphdb.framework.graphql', modules);
