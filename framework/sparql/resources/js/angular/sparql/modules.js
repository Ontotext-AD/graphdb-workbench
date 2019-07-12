define([],

    function () {
        angular
            .module(
                'graphdb.framework.sparql', [
                    'LocalStorageModule',
                    'xeditable',
                    'ngAnimate',
                    'ngRoute',
                    'toastr',
                    'graphdb.framework.core.directives',
                    'graphdb.framework.repositories.services',
                    'graphdb.framework.sparql.services',
                    'graphdb.framework.sparql.controllers.queryeditor',
                    'graphdb.framework.sparql.directives.sparqltab',
//                    'graphdb.framework.core.directives.keyboardshortcuts',
                    'graphdb.framework.sparql.directives.queryeditor'
                ]);
    });