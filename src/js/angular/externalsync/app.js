import 'angular/core/services';
import 'angular/core/directives';
import 'angular/core/controllers';
import 'angular/externalsync/controllers';
import 'angular/externalsync/directives';

const modules = [
    'graphdb.framework.core.controllers',
    'graphdb.framework.externalsync.controllers',
    'graphdb.framework.externalsync.directives',
    'graphdb.framework.core.directives'
];

const externalsync = angular.module('graphdb.framework.externalsync', modules);

externalsync.filter('singular', function () {
    return function (noun) {
        if (angular.isUndefined(noun)) {
            return noun;
        } else {
            return noun.replace(/ies$/, 'y').replace(/s$/, '');
        }
    };
});
