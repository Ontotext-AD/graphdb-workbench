import 'angular/core/services';
import 'angular/core/directives';
import 'angular/resources/controllers';
import 'angular/core/services/repositories.service';
import 'angular/sparql-template/controllers';
import 'angular/rest/sparql-templates.rest.service';
import 'angular/utils/uri-utils';
import 'angular/core/directives/yasgui-component/yasgui-component.directive';

const modules = [
    'toastr',
    'ui.bootstrap',
    'graphdb.framework.sparql-template.controllers',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.core.directives',
    'graphdb.framework.rest.sparql-templates.service',
    'graphdb.framework.utils.uriutils',
    'graphdb.framework.core.directives.yasgui-component'
];

angular.module('graphdb.framework.sparql-template', modules);

