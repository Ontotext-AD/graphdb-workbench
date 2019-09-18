import YASR from 'lib/yasr.bundled';

angular
    .module('graphdb.framework.similarity.controllers.list', [])
    .controller('SimilarityCtrl', SimilarityCtrl)
    .controller('EditSearchQueryCtrl', EditSearchQueryCtrl);

SimilarityCtrl.$inject = ['$scope', '$http', '$interval', 'toastr', '$repositories', 'ModalService', '$modal', '$timeout', 'SimilarityService', 'ClassInstanceDetailsService', 'AutocompleteService', 'productInfo'];

function SimilarityCtrl($scope, $http, $interval, toastr, $repositories, ModalService, $modal, $timeout, SimilarityService, ClassInstanceDetailsService, AutocompleteService, productInfo) {

    var PREFIX = 'http://www.ontotext.com/graphdb/similarity/';
    var PREFIX_PREDICATION = 'http://www.ontotext.com/graphdb/similarity/psi/';
    var PREFIX_INSTANCE = PREFIX + 'instance/';
    var ANY_PREDICATE = PREFIX_PREDICATION + "any";


    $scope.info = productInfo;
    $scope.pluginDisabled = false;

    $scope.getActiveRepository = function () {
        return $repositories.getActiveRepository();
    };


    $scope.checkPluginEnabled = function () {
        if (!$scope.getActiveRepository()) {
            return;
        }
        SimilarityService.checkPluginEnabled()
            .done(function (data, textStatus, jqXhrOrErrorString) {
                $scope.pluginDisabled = data.indexOf("false") > 0;
            })
            .fail(function (data) {
                toastr.error(getError(data), 'Could not check plugin enabled!');
            });
    };

    $scope.enabledSimilarityPlugin = function () {
        SimilarityService.enableSimilarityPlugin()
            .done(function (data, textStatus, jqXhrOrErrorString) {
                $scope.pluginDisabled = false;
                $scope.getSimilarityIndexes();
            })
            .fail(function (data) {
                toastr.error(getError(data), 'Could not enable plugin!');
            });
    };

    SimilarityService.getSearchQueries().success(function (data) {
        $scope.searchQueries = data;
    }).error(function (data) {
        let msg = getError(data);
        toastr.error(msg, 'Could not get search queries');
    });

    $scope.encodeURIComponent = function (param) {
        return encodeURIComponent(param);
    };

    // get similarity indexes
    $scope.getSimilarityIndexes = function () {
        if (!$scope.getActiveRepository() || $scope.pluginDisabled) {
            return;
        }
        SimilarityService.getIndexes()
            .success(function (data) {
                $scope.similarityIndexes = data;
            })
            .error(function (data, status, headers, config) {
                msg = getError(data);
                toastr.error(msg, 'Could not get indexes');
            });
    };

    $scope.pullList = function () {
        if (!$scope.getActiveRepository() || $scope.pluginDisabled) {
            return;
        }
        $scope.getSimilarityIndexes();
        var timer = $interval(function () {
            if ($('#indexes-table').attr("aria-expanded") != "false") {
                $scope.getSimilarityIndexes()
            }
        }, 5000);
        $scope.$on("$destroy", function (event) {
            $interval.cancel(timer);
        });
    };

    $scope.$on('repositoryIsSet', function () {
        $scope.checkPluginEnabled();
        $scope.pullList();
    });
    if ($scope.getActiveRepository()) {
        $scope.checkPluginEnabled();
        $scope.pullList();
    }

    var yasr;

    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function () {
        if ($scope.getActiveRepository()) {
            $http.get('repositories/' + $scope.getActiveRepository() + '/namespaces').success(function (data) {
                $scope.getNamespacesPromise = ClassInstanceDetailsService.getNamespaces($scope.getActiveRepository());
                $scope.getAutocompletePromise = AutocompleteService.checkAutocompleteStatus();
                $scope.usedPrefixes = {};
                data.results.bindings.forEach(function (e) {
                    $scope.usedPrefixes[e.prefix.value] = e.namespace.value;
                });
                yasr = YASR(document.getElementById("yasr"), {
                    //this way, the URLs in the results are prettified using the defined prefixes
                    getUsedPrefixes: $scope.usedPrefixes,
                    persistency: false,
                    hideHeader: true
                });
            }).error(function (data) {
                toastr.error(getError(data), 'Cannot get namespaces for repository. View will not work properly;');
            });
        }
    });

    $scope.loading = false;

    $scope.selected = undefined;
    $scope.searchType = 'searchTerm';
    $scope.resultType = 'termResult';

    $scope.$watch('searchType', function () {
        $scope.empty = true;
    });

    $scope.goToSimilarityIndex = function (index) {
        if (!('BUILT' == index.status || 'OUTDATED' == index.status)) {
            return;
        }
        $scope.empty = true;
        if ($scope.selected !== index) {
            $scope.lastSearch = undefined;
            $scope.selected = index;
        }
        if (index.type === 'text') {
            $scope.searchType = 'searchTerm';
        } else if (index.type === 'predication') {
            $scope.searchType = 'searchEntity';
        }
        if (index.type === 'text' || index.type === 'predication') {
            $('#indexes-table').collapse('hide')
        }
    };

    var toggleOntoLoader = function (showLoader) {
        var yasrInnerContainer = angular.element(document.getElementById("yasr-inner"));
        var resultsLoader = angular.element(document.getElementById("results-loader"));
        /* Angular b**it. For some reason the loader behaved strangely with ng-show not always showing */
        if (showLoader) {
            $scope.loading = true;
            yasrInnerContainer.addClass("opacity-hide");
            resultsLoader.removeClass("opacity-hide");
        } else {
            $scope.loading = false;
            yasrInnerContainer.removeClass("opacity-hide");
            resultsLoader.addClass("opacity-hide");
        }
    };

    $scope.performSearch = function (index, uri, searchType, resultType, parameters) {

        toggleOntoLoader(true);

        // this is either the search term or the iri for the subject
        var termOrSubject = uri;

        $scope.lastSearch = {};
        $scope.lastSearch.type = searchType;

        if (searchType == 'searchEntityPredicate') {
            termOrSubject = $scope.psiSubject;
            $scope.lastSearch.predicate = uri;
        }

        if (searchType === 'searchTerm') {
            termOrSubject = literalForQuery(termOrSubject);
        } else {
            termOrSubject = iriForQuery(termOrSubject);
        }

        $scope.lastSearch.termOrSubject = termOrSubject;

        var headers = {Accept: 'application/sparql-results+json'};
        var sparqlQuery;
        if (searchType == 'searchAnalogical') {
            sparqlQuery = ($scope.selected.analogicalQuery) ? $scope.selected.analogicalQuery : $scope.searchQueries['analogical'];
        } else {
            sparqlQuery = ($scope.selected.searchQuery) ? $scope.selected.searchQuery : $scope.searchQueries[$scope.selected.type];
        }
        var sendData = {
            query: sparqlQuery,
            $index: iriForQuery(PREFIX_INSTANCE + index),
            $query: termOrSubject,
            $searchType: iriForQuery(($scope.selected.type === 'text' ? PREFIX : PREFIX_PREDICATION) + (searchType === 'searchEntityPredicate' ? 'searchEntity' : searchType)),
            $resultType: iriForQuery($scope.selected.type === 'text' ? PREFIX + resultType : PREFIX_PREDICATION + 'entityResult'),
            $parameters: literalForQuery(parameters),
        };

        if (searchType == 'searchEntityPredicate') {
            sendData.$psiPredicate = $scope.lastSearch.predicate ? iriForQuery($scope.lastSearch.predicate) : iriForQuery(ANY_PREDICATE);
        }

        if (searchType == 'searchAnalogical') {
            $scope.searchSubject = uri;
            sendData.$givenSubject = iriForQuery($scope.analogicalSubject);
            sendData.$givenObject = iriForQuery($scope.analogicalObject);
            sendData.$searchSubject = iriForQuery(uri);
        }

        $.ajax({
            method: 'GET',
            url: 'repositories/' + $repositories.getActiveRepository(),
            data: sendData,
            headers: headers
        }).done(function (data, textStatus, jqXhrOrErrorString) {
            toggleOntoLoader(false);
            yasr.setResponse(data, textStatus, jqXhrOrErrorString);
        }).fail(function (data) {
            toastr.error(getError(data), 'Could not get resource!');
            toggleOntoLoader(false);
        });
    };

    $scope.viewSearchQuery = function () {
        var queryTemplate;
        if ($scope.lastSearch.type == 'searchAnalogical') {
            queryTemplate = ($scope.selected.analogicalQuery) ? $scope.selected.analogicalQuery : $scope.searchQueries['analogical'];
        } else {
            queryTemplate = ($scope.selected.searchQuery) ? $scope.selected.searchQuery : $scope.searchQueries[$scope.selected.type];
        }
        var replacedQuery = queryTemplate
            .replace('?index', 'inst:' + $scope.selected.name)
            .replace('?query', $scope.lastSearch.termOrSubject)
            .replace('?searchType', ($scope.selected.type === 'text' ? ':' : 'psi:') + ($scope.lastSearch.type === 'searchEntityPredicate' ? 'searchEntity' : $scope.lastSearch.type))
            .replace('?resultType', $scope.selected.type === 'text' ? ':' + $scope.resultType : 'psi:entityResult')
            .replace('?parameters', literalForQuery((!$scope.searchParameters) ? '' : $scope.searchParameters))
            .replace('?psiPredicate', $scope.lastSearch.predicate ? iriForQuery($scope.lastSearch.predicate) : iriForQuery(ANY_PREDICATE))
            .replace('?givenSubject', iriForQuery($scope.analogicalSubject))
            .replace('?givenObject', iriForQuery($scope.analogicalObject))
            .replace('?searchSubject', iriForQuery($scope.searchSubject));

        var modal = $modal.open({
            templateUrl: 'pages/viewQuery.html',
            controller: 'ViewQueryCtrl',
            resolve: {
                query: function () {
                    return replacedQuery;
                }
            }
        });
    };


    $scope.deleteIndex = function (index) {
        ModalService.openSimpleModal({
            title: 'Confirm',
            message: 'Are you sure you want to delete the index ' + '\'' + index.name + '\'?',
            warning: true
        }).result
            .then(function () {
                SimilarityService.deleteIndex(index)
                    .then(function (res) {
                        $scope.getSimilarityIndexes();
                    }, function (err) {
                        toastr.error(getError(err));
                    })
            });
    };

    $scope.viewCreateQuery = function (index) {
        $http.get("/rest/similarity/query",
            {
                params: {
                    name: index.name,
                    options: index.options,
                    selectQuery: index.selectQuery,
                    stopList: index.stopList,
                    infer: index.infer,
                    sameAs: index.sameAs,
                    type: index.type,
                    analyzer: index.analyzer
                }
            }).success(function (query) {
            var modal = $modal.open({
                templateUrl: 'pages/viewQuery.html',
                controller: 'ViewQueryCtrl',
                resolve: {
                    query: function () {
                        return query;
                    }
                }
            });
        })
    };

    $scope.rebuildIndex = function (index) {
        // Migration
        if (!index.searchQuery) {
            index.searchQuery = index.type ? $scope.searchQueries[index.type] : $scope.searchQueries.text;
        }
        ModalService.openSimpleModal({
            title: 'Confirm',
            message: 'Are you sure you want to rebuild the whole index ' + '\'' + index.name + '\'?',
            warning: true
        }).result
            .then(function () {
                index.status = 'BUILDING';
                SimilarityService.rebuildIndex(index)
                    .then(function (res) {
                    }, function (err) {
                        toastr.error(getError(err));
                    });
            });
    };

    $scope.copyToClipboardResult = function (uri) {
        ModalService.openCopyToClipboardModal(uri);
    };

    var iriForQuery = function (iri) {
        return '<' + iri + '>';
    };

    var literalForQuery = function (literal) {
        return '"' + literal + '"';
    };

    $scope.editSearchQuery = function (index) {
        var modal = $modal.open({
            templateUrl: 'pages/editSearchQuery.html',
            controller: 'EditSearchQueryCtrl',
            resolve: {
                index: function () {
                    return index;
                }
            }
        });
    };

    $scope.trimIRI = function (iri) {
        return _.trim(iri, "<>");
    }

}

EditSearchQueryCtrl.$inject = ['$scope', '$modalInstance', 'index', 'toastr'];

function EditSearchQueryCtrl($scope, $modalInstance, index, toastr) {
    $scope.index = index;
    $scope.tabNum = 1;
    $scope.currentQuery = $scope.index.searchQuery;

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    // This method will resize height of textArea until the max-height property
    let autoExpand = function (field) {

        // Reset field height
        field.style.height = 'inherit';

        // Get the computed styles for the element
        var computed = window.getComputedStyle(field);

        // Calculate the height
        var height = parseInt(computed.getPropertyValue('border-top-width'), 10)
            + parseInt(computed.getPropertyValue('padding-top'), 10)
            + field.scrollHeight
            + parseInt(computed.getPropertyValue('padding-bottom'), 10)
            + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

        field.style.height = height + 'px';

    };

    document.addEventListener('input', function (event) {
        if (event.target.tagName.toLowerCase() !== 'textarea') return;
        autoExpand(event.target);
    }, false);

    $scope.changeTab = function (tabNum) {
        if (tabNum === 1) {
            $scope.currentQuery = $scope.index.searchQuery;
        }
        if (tabNum === 2) {
            $scope.currentQuery = $scope.index.analogicalQuery;
        }

        $scope.tabNum = tabNum;
    };

    $scope.saveSearchQuery = function () {
        let data = {
            name: $scope.index.name,
            changedQuery: $scope.currentQuery,
            isSearchQuery: $scope.tabNum === 1
        };

        $.ajax({
            type: "put",
            url: "/rest/similarity/search-query",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (result) {
                toastr.success($scope.tabNum === 1 ? 'Changed Search query' : 'Changed Analogical query');
            },
            error: function () {
                toastr.error(getError(data), 'Could not change query!');
            }
        });
        $modalInstance.close(true);
    };
}
