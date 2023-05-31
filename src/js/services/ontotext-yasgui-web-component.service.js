import {QueryType} from "../../models/ontotext-yasgui/query-type";

const modules = [];

angular
    .module('graphdb.framework.ontotext-yasgui-web-component', modules)
    .factory('OntotextYasguiWebComponentService', OntotextYasguiWebComponentService);

OntotextYasguiWebComponentService.$inject = ['MonitoringRestService', 'RDF4JRepositoriesRestService', '$repositories', 'toastr', '$translate', '$location'];

function OntotextYasguiWebComponentService(MonitoringRestService, RDF4JRepositoriesRestService, $repositories, toastr, $translate, $location) {

    const supportedLanguages = ['en', 'fr'];
    let allTranslations;

    const onQueryAborted = (req) => {
        if (req) {
            const repository = req.url.substring(req.url.lastIndexOf('/') + 1);
            const currentTrackAlias = req.header['X-GraphDB-Track-Alias'];
            return MonitoringRestService.deleteQuery(currentTrackAlias, repository)
                .then(() => Promise.resolve());
        }
    };

    const getRepositoryStatementsCount = () => {
        // A promise is returned because the $http of  angularjs use HttpPromise and its behavior is different than we expect.
        // Here is an article that describes the problems AngularJS HttpPromise methods break promise chain {@link https://medium.com/@ExplosionPills/angularjs-httppromise-methods-break-promise-chain-950c85fa1fe7}
        return RDF4JRepositoriesRestService.getRepositorySize($repositories.getActiveRepository())
            .then((response) => Promise.resolve(parseInt(response.data)))
            .catch(function (data) {
                const params = {
                    repo: $repositories.getActiveRepository(),
                    error: getError(data)
                };
                toastr.warning($translate.instant('query.editor.repo.size.error', params));
            });
    };

    /**
     * Handles {@link EventDataType.EXPLORE_VISUAL_GRAPH} event emitted by "ontotext-yasgui-web-component".
     * The event is fired when the "Visual" button is clicked on.
     *
     * @param {ExploreVisualGraphEvent} exploreVisualGraphEvent - the "ontotext-yasgui-web-component" event.
     */
    const exploreVisualGraphHandler = (exploreVisualGraphEvent) => {
        const paramsToParse = {
            query: exploreVisualGraphEvent.query,
            sameAs: exploreVisualGraphEvent.sameAs,
            inference: exploreVisualGraphEvent.inference
        };

        $location.path('graphs-visualizations').search(paramsToParse);
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
    }

    const getTranslations = () => {
        if (!this.allTranslations) {
            this.allTranslations = {}
            supportedLanguages.forEach((langKey) => {
                return this.allTranslations[langKey] = $translate.getTranslationTable(langKey);
            });
        }
        return this.allTranslations;
    }

    const getDisableYasqeActionButtonsConfiguration = () => {
        return [
            {
                name: 'createSavedQuery',
                visible: false
            }, {
                name: 'showSavedQueries',
                visible: false
            }, {
                name: 'shareQuery',
                visible: false
            }, {
                name: 'includeInferredStatements',
                visible: false
            }
        ];
    };

    const autocompleteLocalNames = (term, canceler) => {
        return AutocompleteRestService.getAutocompleteSuggestions(term, canceler.promise)
            .then(function (results) {
                canceler = null;
                return results.data;
            });
    };

    return {
        onQueryAborted,
        getRepositoryStatementsCount,
        exploreVisualGraphYasrToolbarElementBuilder,
        getTranslations,
        getDisableYasqeActionButtonsConfiguration,
        autocompleteLocalNames
    };
}
