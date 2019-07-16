define([],

    function () {
        angular
            .module(
                'graphdb.framework.graphexplore', [
                    'graphdb.framework.graphexplore.services.data',
                    'graphdb.framework.graphexplore.services.uiscroll',
                    'graphdb.framework.graphexplore.services.rdfsdetails',
                    'graphdb.framework.graphexplore.services.savedgraphs',
                    'graphdb.framework.graphexplore.services.graphconfig',
                    'graphdb.framework.graphexplore.controllers.class',
                    'graphdb.framework.graphexplore.controllers.domainrange',
                    'graphdb.framework.graphexplore.controllers.dependencies',
                    'graphdb.framework.graphexplore.controllers.graphviz',
                    'graphdb.framework.graphexplore.controllers.graphviz.config',
                    'graphdb.framework.graphexplore.directives.sysrepo',
                    'graphdb.framework.graphexplore.directives.rdfsdetails',
                    'graphdb.framework.graphexplore.directives.searchfilter',
                    'graphdb.framework.graphexplore.directives.class',
                    'graphdb.framework.graphexplore.directives.domainrange',
                    'graphdb.framework.graphexplore.directives.dependencies',
                    'graphdb.framework.graphexplore.directives.searchcontrols'
                ]);
    });