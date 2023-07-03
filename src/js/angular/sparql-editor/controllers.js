import {
    savedQueryResponseMapper, buildQueryModel
} from "../rest/mappers/saved-query-mapper";
import {RouteConstants} from "../utils/route-constants";
import 'angular/rest/connectors.rest.service';
import 'services/ontotext-yasgui-web-component.service.js';
import 'angular/externalsync/controllers';
import {YasguiComponentDirectiveUtil} from "../core/directives/yasgui-component/yasgui-component-directive.util";
import {QueryType} from "../../../models/ontotext-yasgui/query-type";

const modules = [
    'ui.bootstrap',
    'graphdb.framework.rest.connectors.service',
    'graphdb.framework.ontotext-yasgui-web-component',
    'graphdb.framework.externalsync.controllers'
];

angular
    .module('graphdb.framework.sparql-editor.controllers', modules)
    .controller('SparqlEditorCtrl', SparqlEditorCtrl);

SparqlEditorCtrl.$inject = [
    '$scope',
    '$q',
    '$location',
    '$jwtAuth',
    '$repositories',
    'toastr',
    '$translate',
    'SparqlRestService',
    'ShareQueryLinkService'];

function SparqlEditorCtrl($scope,
                          $q,
                          $location,
                          $jwtAuth,
                          $repositories,
                          toastr,
                          $translate,
                          SparqlRestService,
                          ShareQueryLinkService) {
    this.repository = '';

    $scope.yasguiConfig = undefined;
    $scope.savedQueryConfig = undefined;
    $scope.prefixes = {};
    $scope.inferUserSetting = true;
    $scope.sameAsUserSetting = true;

    // =========================
    // Public functions
    // =========================
    $scope.updateConfig = () => {
        $scope.yasguiConfig = {
            endpoint: getQueryEndpoint(),
            componentId: 'graphdb-workbench-sparql-editor',
            prefixes: $scope.prefixes,
            infer: $scope.inferUserSetting,
            sameAs: $scope.sameAsUserSetting,
            yasrToolbarPlugins: [exploreVisualGraphYasrToolbarElementBuilder]
        };
    };

    $scope.initViewFromUrlParams = () => {
        const queryParams = $location.search();
        if (queryParams.hasOwnProperty(RouteConstants.savedQueryName)) {
            // init new tab from shared saved query link
            initTabFromSavedQuery(queryParams);
        } else if (queryParams.hasOwnProperty(RouteConstants.query)) {
            // init new tab from shared query link
            initTabFromSharedQuery(queryParams);
        }
    };

    // =========================
    // Private function
    // =========================

    const getQueryEndpoint = () => {
        return `/repositories/${$repositories.getActiveRepository()}`;
    };

    const initTabFromSavedQuery = (queryParams) => {
        const savedQueryName = queryParams[RouteConstants.savedQueryName];
        const savedQueryOwner = queryParams[RouteConstants.savedQueryOwner];
        SparqlRestService.getSavedQuery(savedQueryName, savedQueryOwner).then((res) => {
            const savedQuery = savedQueryResponseMapper(res);
            // * Check if there is an open tab with the same query already. If there is one, then open it.
            // * Otherwise open a new tab and load the query in the editor.
            // TODO: Before opening a new tab: check if there is a running query or update and prevent opening it.
            // Same as the above should be checked on tab switching for existing tab too.
            YasguiComponentDirectiveUtil.getOntotextYasguiElement('#query-editor').openTab(savedQuery);
        }).catch((err) => {
            toastr.error($translate.instant('query.editor.missing.saved.query.data.error', {
                savedQueryName: savedQueryName,
                error: getError(err)
            }));
        });
    };

    const initTabFromSharedQuery = (queryParams) => {
        const queryName = queryParams[RouteConstants.name];
        const query = queryParams[RouteConstants.query];
        const queryOwner = queryParams[RouteConstants.owner];
        const sharedQueryModel = buildQueryModel(query, queryName, queryOwner, true);
        // * Check if there is an open tab with the same query already. If there is one, then open it.
        // * Otherwise open a new tab and load the query in the editor.
        // TODO: Before opening a new tab: check if there is a running query or update and prevent opening it.
        // Same as the above should be checked on tab switching for existing tab too.
        YasguiComponentDirectiveUtil.getOntotextYasguiElement('#query-editor').openTab(sharedQueryModel);
    };

    const setInferAndSameAs = (principal) => {
        $scope.inferUserSetting = principal.appSettings.DEFAULT_INFERENCE;
        $scope.sameAsUserSetting = principal.appSettings.DEFAULT_SAMEAS;
    };

    const exploreVisualGraphYasrToolbarElementBuilder = {
        createElement: (yasr) => {
            const buttonName = document.createElement('span');
            buttonName.classList.add("explore-visual-graph-button-name");
            const exploreVisualButtonWrapperElement = document.createElement('div');
            exploreVisualButtonWrapperElement.classList.add("explore-visual-graph-button");
            exploreVisualButtonWrapperElement.classList.add("icon-data");
            exploreVisualButtonWrapperElement.onclick = function () {
                const paramsToParse = {
                    query: yasr.yasqe.getValue(),
                    sameAs: yasr.yasqe.getSameAs(),
                    inference: yasr.yasqe.getInfer()
                };
                $location.path('graphs-visualizations').search(paramsToParse);
            };
            exploreVisualButtonWrapperElement.appendChild(buttonName);
            return exploreVisualButtonWrapperElement;
        },
        updateElement: (element, yasr) => {
            element.classList.add('hidden');
            if (!yasr.hasResults()) {
                return;
            }
            const queryType = yasr.yasqe.getQueryType();

            if (QueryType.CONSTRUCT === queryType || QueryType.DESCRIBE === queryType) {
                element.classList.remove('hidden');
            }
            element.querySelector('.explore-visual-graph-button-name').innerText = $translate.instant("query.editor.visual.btn");
        },
        getOrder: () => {
            return 2;
        }
    };

    // Initialization and bootstrap
    const init = () => {
        Promise.all([$jwtAuth.getPrincipal(), $repositories.getPrefixes($repositories.getActiveRepository())])
            .then(([principal, usedPrefixes]) => {
                setInferAndSameAs(principal);
                $scope.prefixes = usedPrefixes;
            })
            .finally(() => {
                $scope.updateConfig();
                // check is there is a savedquery or query url parameter and init the editor
                // initViewFromUrlParams();
                // on repo change do the same as above
                // focus on the active editor on init
            });
        // TODO: we should also watch for changes in namespaces
        // scope.$watch('namespaces', function () {});
    };

    // =========================
    // Event handlers
    // =========================

    /**
     * When the repository gets changed through the UI, we need to update the yasgui configuration so that new queries
     * to be issued against the new repository.
     */
    const repositoryIsSetSubscription = $scope.$on('repositoryIsSet', init);

    // Deregister the watcher when the scope/directive is destroyed
    $scope.$on('$destroy', function () {
        repositoryIsSetSubscription();
    });

    // Wait until the active repository object is set, otherwise "canWriteActiveRepo()" may return a wrong result and the "ontotext-yasgui"
    // readOnly configuration may be incorrect.
    const repoIsInitialized = $scope.$watch(function () {
        return $scope.getActiveRepositoryObject();
    }, function (activeRepo) {
        if (activeRepo) {
            init();
            repoIsInitialized();
        }
    });
}
