define([
        'angular/core/services',
        'angular/core/controllers',
        'angular/core/directives',
        'angular/repositories/services',
        'lib/angular-ui-scroll/1.3.2/ui-scroll',
        'lib/angular-ui-scroll/1.3.2/ui-scroll-jqlite',
        'd3-ONTO-chord-patch',
        'd3-tip',
        'lib/angular-pageslide-directive',
        'lib/rzslider',
        'lib/angucomplete-alt',
        'lib/ng-tags-input.min',
        'common/d3-utils',
        'common/circle-packing',
        'common/svg-export',
        'angular/graphexplore/modules',
        'angular/graphexplore/services/graph-data.service',
        'angular/graphexplore/services/ui-scroll.service',
        'angular/graphexplore/services/rdfs-label-comment.service',
        'angular/graphexplore/services/saved-graphs.service',
        'angular/graphexplore/services/graph-config.service',
        'angular/graphexplore/controllers/rdf-class-hierarchy.controller',
        'angular/graphexplore/controllers/domain-range-graph.controller',
        'angular/graphexplore/controllers/dependencies-chord.controller',
        'angular/graphexplore/controllers/graphs-visualizations.controller',
        'angular/graphexplore/controllers/graphs-config.controller',
        'angular/graphexplore/directives/rdf-class-hierarchy.directive',
        'angular/graphexplore/directives/domain-range-graph.directive',
        'angular/graphexplore/directives/system-repo-warning.directive',
        'angular/graphexplore/directives/rdfs-comment-label.directive',
        'angular/graphexplore/directives/dependencies-chord.directive',
        'angular/graphexplore/directives/list-items-search-filter.directive',
        'angular/graphexplore/directives/search-icon-input.directive'],

    function () {
        angular
            .module('graphdb.framework.graphexplore')
            .config(config);

        config.$inject = ['$menuItemsProvider', '$routeProvider'];
        function config($menuItemsProvider, $routeProvider) {
            $routeProvider
                .when('/hierarchy', {
                    templateUrl: 'pages/rdfClassHierarchyInfo.html',
                    reloadOnSearch: false,
                    controller: 'RdfClassHierarchyCtlr',
                    title: 'Class hierarchy',
                    helpInfo: 'This diagram shows the hierarchy of RDF classes by number of instances. '
                                + 'The biggest circles are the parent classes and the nested ones are their children. '
                                + 'Hover over a given class to see its subclasses or zoom in a '
                                + 'nested circle (RDF class) for further exploration. '
                })
                .when('/domain-range-graph', {
                    templateUrl: 'pages/domainRangeInfo.html',
                    reloadOnSearch: true,
                    controller: 'DomainRangeGraphCtlr',
                    title: 'Domain-Range graph',
                    helpInfo: 'This diagram shows the classes and properties that lead to a given '
                                + 'RDF class, which plays the role of <b>range</b> for all properties on the left of it, and '
                                + '<b>domain</b> for all properties on the right of it.'
                                + 'You can navigate to another class '
                                + 'by double clicking on it.'
                }).when('/relationships', {
                    templateUrl: 'pages/dependencies.html',
                    controller: 'DependenciesChordCtrl',
                    title: 'Class relationships',
                    helpInfo: 'This diagram shows the relationships between RDF classes, '
                                + 'where a relationship is represented by links between the individual instances of two classes. '
                                + 'Each link is an RDF statement where the subject is an instance of one class, the object is an instance of another class, '
                                + 'and the link is the predicate. '
                                + 'Depending on the number of links between the instances of two classes, the bundle can be '
                                + 'thicker or thinner and it gets the colour of the class with more incoming links. '
                                + 'The links can be in both directions. '
                }).when('/graphs-visualizations', {
                    templateUrl: 'pages/graphs-visualizations.html',
                    controller: 'GraphsVisualizationsCtrl',
                    title: 'Visual graph',
                    helpInfo: 'Provides a way to create a visual representation of parts of the data graph. You start from a single resource and the resources connected '
                                + ' to it or from a graph query result. Click on resources to show their connections too.',
                    reloadOnSearch: false
                }).when('/graphs-visualizations/config/save/:configName?', {
                    templateUrl: 'pages/graph-config/saveGraphConfig.html',
                    title: 'Create visual graph config',
                    controller: 'GraphConfigCtrl',
                    helpInfo: 'A visual graph config defines the SPARQL queries used to retrieve nodes and edges in the visual graph, as well as'
                                + ' the starting point of visualisation.'
                });

            $menuItemsProvider.addItem({
                label : 'Explore',
                href : '#',
                order : 1,
                role : 'IS_AUTHENTICATED_FULLY',
                icon: "icon-data"
            });

            $menuItemsProvider.addItem({
                label: 'Class relationships',
                href: 'relationships',
                order: 2,
                parent: 'Explore'
            });

            $menuItemsProvider.addItem({
                label: 'Class hierarchy',
                href: 'hierarchy',
                order: 1,
                parent: 'Explore'
            });

            $menuItemsProvider.addItem({
                label: 'Visual graph',
                href: 'graphs-visualizations',
                order: 5,
                parent: 'Explore',
                children: [{
                    href: 'graphs-visualizations/config/save',
                    children: []
                }]
            });
        }
    });
