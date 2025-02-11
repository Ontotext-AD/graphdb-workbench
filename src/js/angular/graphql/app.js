import 'angular/graphql/controllers/graphql-playground-view.controller';
import 'angular/graphql/controllers/graphql-endpoint-management-view.controller';
import 'angular/graphql/controllers/create-graphql-endpoint-view.controller';
import 'angular/core/directives/graphql-playground/graphql-playground.directive';
import 'angular/core/directives/dynamic-form/dynamic-form.directive';
import 'angular/graphql/controllers/graphql-endpoint-configuration-modal.controller';
import 'angular/core/directives/multiselect-dropdown/multiselect-dropdown.directive';

const modules = [
    'ngRoute',
    'graphdb.framework.graphql.controllers.graphql-endpoint-management-view',
    'graphdb.framework.graphql.controllers.graphql-playground-view',
    'graphdb.framework.graphql.controllers.create-graphql-endpoint-view',
    'graphdb.framework.core.directives.graphql-playground',
    'graphdb.framework.core.directives.dynamic-form',
    'graphdb.framework.graphql.controllers.graphql-endpoint-configuration-modal',
    'graphdb.framework.core.directives.multiselect-dropdown'
];

angular.module('graphdb.framework.graphql', modules);
