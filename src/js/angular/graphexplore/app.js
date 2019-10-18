import 'angular/core/services';
import 'angular/core/controllers';
import 'angular/core/directives';
import 'angular/repositories/services';
import 'angular-ui-scroll/dist/ui-scroll.min';
import 'angular-ui-scroll/dist/ui-scroll-jqlite.min';
import 'lib/d3-ONTO-chord-patch';
import 'lib/d3-tip/d3-tip-patch';
import 'angular-pageslide-directive/dist/angular-pageslide-directive';
import 'angularjs-slider/dist/rzslider.min';
import 'lib/angucomplete-alt/angucomplete-alt';
import 'ng-tags-input/build/ng-tags-input.min';
import 'lib/common/d3-utils';
import 'lib/common/circle-packing';
import 'lib/common/svg-export';
import 'angular/graphexplore/modules';
import 'angular/rest/graph-data.rest.service';
import 'angular/graphexplore/services/ui-scroll.service';
import 'angular/graphexplore/services/rdfs-label-comment.service';
import 'angular/rest/saved-graphs.rest.service';
import 'angular/rest/graph-config.rest.service';
import 'angular/graphexplore/controllers/rdf-class-hierarchy.controller';
import 'angular/graphexplore/controllers/domain-range-graph.controller';
import 'angular/graphexplore/controllers/dependencies-chord.controller';
import 'angular/graphexplore/controllers/graphs-visualizations.controller';
import 'angular/graphexplore/controllers/graphs-config.controller';
import 'angular/graphexplore/directives/rdf-class-hierarchy.directive';
import 'angular/graphexplore/directives/domain-range-graph.directive';
import 'angular/graphexplore/directives/system-repo-warning.directive';
import 'angular/graphexplore/directives/rdfs-comment-label.directive';
import 'angular/graphexplore/directives/dependencies-chord.directive';
import 'angular/graphexplore/directives/list-items-search-filter.directive';
import 'angular/graphexplore/directives/search-icon-input.directive';

angular.module('graphdb.framework.graphexplore').config(config);

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
        label: 'Explore',
        href: '#',
        order: 1,
        role: 'IS_AUTHENTICATED_FULLY',
        icon: 'icon-data'
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
