import 'angular/core/services';
import 'angular/core/controllers';
import 'angular/core/directives';
import 'angular/core/services/repositories.service';
import 'angular-ui-scroll/dist/ui-scroll.min';
import 'angular-ui-scroll/dist/ui-scroll-jqlite.min';
import 'lib/d3.patch.js';
import 'lib/d3-tip/d3-tip-patch';
import 'angular-pageslide-directive/dist/angular-pageslide-directive';
import 'angularjs-slider/dist/rzslider.min';
import 'lib/angucomplete-alt/angucomplete-alt';
import 'ng-tags-input/build/ng-tags-input.min';
import 'lib/common/d3-utils';
import 'lib/common/circle-packing';
import 'lib/common/svg-export';
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
import 'angular/core/directives/queryeditor/query-editor.controller';
import 'angular/core/directives/queryeditor/query-editor.directive';
import 'angular/core/directives/yasgui-component/yasgui-component.directive';

angular.module('graphdb.framework.graphexplore', [
    'graphdb.framework.core.controllers',
    'graphdb.framework.core.directives',
    'graphdb.framework.rest.graphexplore.data.service',
    'graphdb.framework.graphexplore.services.uiscroll',
    'graphdb.framework.graphexplore.services.rdfsdetails',
    'graphdb.framework.rest.graphexplore.savedgraphs.service',
    'graphdb.framework.rest.graphconfig.service',
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
    'graphdb.framework.graphexplore.directives.searchcontrols',
    'graphdb.framework.core.directives.queryeditor.controllers',
    'graphdb.framework.core.directives.queryeditor.queryeditor',
    'graphdb.framework.core.directives.yasgui-component'
]);
