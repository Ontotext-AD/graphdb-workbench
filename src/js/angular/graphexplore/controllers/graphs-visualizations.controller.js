import 'angular/core/services';
import D3 from 'lib/common/d3-utils.js';
import d3tip from 'lib/d3-tip/d3-tip-patch';

const modules = [
    'ui.scroll.jqlite',
    'ui.scroll',
    'toastr',
    'ui.bootstrap',
    'ngTagsInput'
];

angular
    .module('graphdb.framework.graphexplore.controllers.graphviz', modules)
    .controller('GraphsVisualizationsCtrl', GraphsVisualizationsCtrl)
    .controller('SaveGraphModalCtrl', SaveGraphModalCtrl)
    .config(['$tooltipProvider', function ($tooltipProvider) {
        $tooltipProvider.options({appendToBody: true});
    }]);


GraphsVisualizationsCtrl.$inject = ["$scope", "$rootScope", "$repositories", "toastr", "$timeout", "$http", "ClassInstanceDetailsService", "AutocompleteService", "$q", "$location", "UiScrollService", "ModalService", "$modal", "$window", "localStorageService", "SavedGraphsService", "GraphConfigService"];

function GraphsVisualizationsCtrl($scope, $rootScope, $repositories, toastr, $timeout, $http, ClassInstanceDetailsService, AutocompleteService, $q, $location, UiScrollService, ModalService, $modal, $window, localStorageService, SavedGraphsService, GraphConfigService) {

    $scope.languageChanged = false;
    $scope.propertiesObj = {};
    $scope.propertiesQueryObj = {};

    $scope.propertiesObj.items = [];
    $scope.propertiesNotFiltered = [];
    $scope.searchVisible = false;
    $scope.nodeSelected = false;
    $scope.queryResultsMode = false;
    $scope.embedded = $location.search().embedded;
    $scope.openedNodeInfoPanel = undefined;

    // embedded and other params when the controller is initialized
    if ($scope.embedded && ($location.search().query ||
            $location.search().uri ||
            $location.search().config ||
            $location.search().saved)) {

        $scope.noGoHome = true;
    }

    // creating datasource for class properties data
    var datasource = {},
        position = 0,
        current = 0;

    $rootScope.key = "";

    datasource.get = function (index, count, success) {
        return UiScrollService.initLazyList(index, count, success, position, $scope.propertiesObj.items);
    };

    $rootScope.$watch(function () {
        return $rootScope.key;
    }, function () {
        position = 0;
        _.each($scope.propertiesObj.items, function (item) {
            if ($rootScope.key > item) {
                position++;
            }
        });
        current++;
    });

    datasource.revision = function () {
        return current;
    };

    $scope.datasource = datasource;

    // adapter implementation for ui-scroll directive
    $scope.adapterContainer = {adapter: {remain: true}};

    $scope.propertiesQueryObj.query = '';
    $scope.propertiesSearchPlaceholder = "Search instance properties";
    $scope.propertiesFilterFunc = propertiesFilterFunc;

    $scope.resetState = function () {
        $scope.searchVisible = false;
        $scope.nodeSelected = false;
        $scope.configLoaded = null;
        $scope.queryResultsMode = false;
        $scope.lastSavedGraphName = null;
        $scope.lastSavedGraphId = null;
        $scope.numberOfPinnedNodes = 0;

        // Reset type colours
        type2color = {};
        colorIndex = 0;
    };

    $scope.pushHistory = function (searchParams, state) {
        if ($scope.embedded) {
            searchParams.embedded = true;
        }
        $location.search(searchParams);
        $location.state(state);
    };

    $scope.goToHome = function () {
        $scope.resetState();
        $location.url("graphs-visualizations");
    };

    $scope.shouldShowSettings = function () {
        return $scope.configLoaded && $scope.configLoaded.id === $scope.defaultGraphConfig.id;
    };

    $scope.shouldDisableSameAs = function () {
        let sameAsCheckbox = $('#sameAsCheck');
        if ($scope.settings && !$scope.settings['includeInferred'] && sameAsCheckbox.prop('checked')) {
            sameAsCheckbox.prop("checked", false);
            $scope.settings['sameAsState'] = false;
        }

        return $scope.settings && !$scope.settings['includeInferred'];
    };

    function propertiesFilterFunc(item) {
        return item.key
            .toLowerCase()
            .indexOf($scope.propertiesQueryObj.query.toLowerCase()) >= 0;
    }


    $scope.$watch('propertiesObj.items', function () {
        if (angular.isDefined($scope.propertiesObj.items) && $scope.propertiesObj.items.length > 0) {
            $timeout(function () {
                $scope.adapterContainer.adapter.reload();
            }, 500);
        }
    });

    $scope.toggleMoreInfo = function (ev) {
        angular.element(ev.currentTarget).parent().next().toggle(200);
        angular.element(ev.currentTarget).children('span').toggleClass("icon-caret-down").toggleClass("icon-caret-up");
    };

    function updatePredicateLabels() {
        if (!$scope.saveSettings['showLinksText']) {
            d3.selectAll("svg .link-wrapper text")
                .style("display", "none");
        } else {
            d3.selectAll("svg .link-wrapper text")
                .style("display", "block");
        }

    }

    function updateNodeLabels(nodeLabels) {
        nodeLabels.each(function (d) {
            d.fontSize = D3.Text.calcFontSizeRaw(d.labels[0].label, d.size, nodeLabelMinFontSize, true);
            // TODO: get language and set it on the label html tag
        })
            .attr("height", function (d) {
                return d.fontSize * 3;
            })
            // if this was kosher we would use xhtml:body here but if we do that angular (or the browser)
            // goes crazy and resizes/messes up other unrelated elements. div seems to work too.
            .append("xhtml:div")
            .attr("class", "node-label-body")
            .style("font-size", function (d) {
                return d.fontSize + 'px';
            })
            .append('xhtml:div')
            .text(function (d) {
                return d.labels[0].label;
            });

        // Our own implementation of what browsers should really do but they either can't or don't do properly.
        // This code will look at each node's label element and check if the text fits. This is achieved by
        // checking the DOM properties scrollHeight/-Width and clientHeight/-Width. Generally if the scroll ones
        // are bigger than the client ones the content doesn't fit.
        $timeout(function () {
            $('.node-label-body div').each(function (i, e) {
                // Initial text is minus one character as we'll be adding a one-character suffix if we need to truncate
                var text = e.textContent.substring(0, e.textContent.length - 1);
                var suffixToInsert = '…';
                var endlessLoopGuard = 0;

                // Loop until the text fits
                while (endlessLoopGuard < 200 && (e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth)) {
                    // Take previous text minus one character
                    text = text.substring(0, text.length - 1);

                    // Set the new text + suffix as textContent
                    e.textContent = text + suffixToInsert;

                    endlessLoopGuard++;
                }
            });
        }, 50);
    }


    $scope.copyToClipboard = copyToClipboard;

    function copyToClipboard(uri) {
        ModalService.openCopyToClipboardModal(uri);
    }

    $scope.defaultSettings = {
        linksLimit: 20,
        includeInferred: false,
        sameAsState: false,
        languages: ['en'],
        showLinksText: true,
        preferredTypes: [],
        rejectedTypes: [],
        preferredPredicates: [],
        rejectedPredicates: [],
        preferredTypesOnly: false,
        preferredPredicatesOnly: false
    };

    $scope.saveSettings = angular.copy($scope.defaultSettings);

    var localStorageSettings = localStorageService.get('graphs-viz');
    if (localStorageSettings && typeof localStorageSettings === 'object') {
        try {
            $scope.saveSettings = localStorageSettings;
        } catch (e) {
            $scope.saveSettings = angular.copy($scope.defaultSettings);
            localStorageService.set('graphs-viz', $scope.saveSettings);
        }
    }

    $scope.resetSettings = function () {
        $scope.settings = angular.copy($scope.defaultSettings);
    };

    $scope.changeLimit = function (delta) {
        var linksLimit = $scope.settings.linksLimit + delta;
        if (linksLimit < 1) {
            linksLimit = 1;
        }
        if (linksLimit > 1000) {
            linksLimit = 1000;
        }
        $scope.settings.linksLimit = linksLimit;
    };

    $scope.showSettings = function () {
        $scope.showInfoPanel = true;
        $scope.showFilter = true;
        $scope.showNodeInfo = false;
        $scope.showPredicates = false;
        if (!$scope.saveSettings) {
            $scope.settings = angular.copy($scope.defaultSettings);
        } else {
            $scope.settings = angular.copy($scope.saveSettings);
        }
        $scope.settings.languagesMap = _.map($scope.settings.languages, function (v) {
            return {'text': v};
        });

        $scope.settings.preferredTypesMap = _.map($scope.settings.preferredTypes, function (v) {
            return {'text': v};
        });

        $scope.settings.rejectedTypesMap = _.map($scope.settings.rejectedTypes, function (v) {
            return {'text': v};
        });

        $scope.settings.preferredPredicatesMap = _.map($scope.settings.preferredPredicates, function (v) {
            return {'text': v};
        });

        $scope.settings.rejectedPredicatesMap = _.map($scope.settings.rejectedPredicates, function (v) {
            return {'text': v};
        });
    };


    $scope.reExpandNode = function () {
        if ($scope.rootNodeIri) {
            $scope.$broadcast("onRootNodeChange", $scope.rootNodeIri);
        }
    };

    $scope.updateSettings = function () {
        $scope.saveSettings = $scope.settings;
        $scope.saveSettings.languages = _.map($scope.saveSettings['languagesMap'], function (s) {
            return s['text'];
        });

        $scope.saveSettings.preferredTypes = _.map($scope.saveSettings['preferredTypesMap'], function (t) {
            return t['text'];
        });
        $scope.saveSettings.rejectedTypes = _.map($scope.saveSettings['rejectedTypesMap'], function (t) {
            return t['text'];
        });

        $scope.saveSettings.preferredPredicates = _.map($scope.saveSettings['preferredPredicatesMap'], function (t) {
            return t['text'];
        });
        $scope.saveSettings.rejectedPredicates = _.map($scope.saveSettings['rejectedPredicatesMap'], function (t) {
            return t['text'];
        });

        // TODO
        // reexpand root node
        if ($scope.rootNodeIri) {
            $scope.reExpandNode($scope.rootNodeIri);
        } else if ($scope.queryResultsMode && $location.search().query) {
            loadGraphForQuery($location.search().query,
                $location.search().sameAs,
                $location.search().inference);
        } else if ($scope.configLoaded.startMode === 'query') {
            $scope.loadGraphConfig($scope.configLoaded);
        }

        updatePredicateLabels();

        $scope.showInfoPanel = false;
        $scope.showFilter = false;

        localStorageService.set('graphs-viz', $scope.saveSettings);
    };

    $scope.showInfoPanel = false;

    function Graph() {
        this.nodes = [];
        this.links = [];

        this.addNode = function (node, x, y) {
            node.x = x;
            node.y = y;
            this.nodes.push(node);
            return node;
        };

        // computes a "connectedness" metric on each link, which is then used to hint for longer links.
        // this results in improved clustering and appearance.
        this.computeConnectedness = function () {
            // count the the number of times a given node is connected to other nodes
            // (only for nodes connected to more than one node)
            var counts = {};
            var seenLinks = {};
            _.each(this.links, function (link) {
                var i1 = link.source.iri;
                var i2 = link.target.iri;
                var seenKey = _.min([i1, i2]) + "|" + _.max([i1, i2]);
                if (!seenLinks[seenKey]) {
                    seenLinks[seenKey] = 1;
                    counts[i1] = (counts[i1] || 0) + 1;
                    counts[i2] = (counts[i2] || 0) + 1;
                }
            });

            // computes the connectedness of each link based on the number of times its nodes were connected
            // (only for links to/from nodes connected to more than one node)
            _.each(this.links, function (link) {
                if (counts[link.source.iri] > 1 && counts[link.target.iri] > 1) {
                    link.connectedness = Math.min(5, Math.max(counts[link.source.iri], counts[link.target.iri]) - 1);
                } else {
                    link.connectedness = 0;
                }
            });
        };

        this.addAndMatchLinks = function (newLinks) {
            var nodes = this.nodes;
            Array.prototype.push.apply(this.links, matchLinksToNodes(newLinks, nodes));

            this.computeConnectedness();
        };

        var countLinks = function (d, links) {
            return findLinksForNode(d, links).length;
        };

        this.countLinks = countLinks;

        function findLinksForNode(d, links) {
            return _.filter(links, function (l) {
                return l.source.iri === d.iri || l.target.iri === d.iri
            });
        }

        function linksTypes(d, links) {
            var linksForNode = findLinksForNode(d, links);
            var types = _.map(linksForNode, function (l) {
                return (l.source.iri === d.iri ) ? l.target.types : l.source.types;
            });
            return _.uniq(_.flatten(types));
        }

        function linksPredicates(d, links) {
            var linksForNode = findLinksForNode(d, links);
            var predicates = _.map(linksForNode, function (l) {
                return l.predicates;
            });
            return _.uniq(_.flatten(predicates));
        }

        this.linksTypes = linksTypes;

        this.linksPredicates = linksPredicates;

        this.removeNode = function (d) {
            this.links = _.reject(this.links, function (l) {
                return l.source.iri === d.iri || l.target.iri === d.iri;
            });
            var links = this.links;
            this.nodes = _.reject(this.nodes, function (n) {
                return countLinks(n, links) === 0;
            });
            if (this.nodes.length === 0) {
                $scope.nodeSelected = false;
            }

            this.computeConnectedness();
        };

        this.removeNodeLeafLinks = function (d) {
            var links = this.links;
            this.links = _.reject(this.links, function (l) {
                if ((l.source.iri === d.iri && countLinks(l.target, links) === 1) ||
                    (l.target.iri === d.iri && countLinks(l.source, links) === 1)) {
                    return true;
                }
                var targetLinks;
                if (l.source.iri === d.iri && countLinks(l.target, links) === 2) {
                    targetLinks = findLinksForNode(l.target, links);
                } else if (l.target.iri === d.iri && countLinks(l.source, links) === 2) {
                    targetLinks = findLinksForNode(l.source, links);
                }
                if (!targetLinks)
                    return;

                // the node to which (or from which) d has link to has only two links, check if the second one is to d also
                return (targetLinks[0].source.iri === d.iri || targetLinks[0].target.iri) &&
                    (targetLinks[1].source.iri === d.iri || targetLinks[1].target.iri);


            });
            links = this.links;
            this.nodes = _.reject(this.nodes, function (n) {
                return countLinks(n, links) === 0 && n.iri !== d.iri;
            });

            this.computeConnectedness();
        };

        function matchLinksToNodes(newLinks, nodes) {
            return _.map(newLinks, function (link) {
                return {
                    "source": _.find(nodes, function (o) {
                        return o.iri === link.source;
                    }),
                    "target": _.find(nodes, function (o) {
                        return o.iri === link.target;
                    }),
                    "predicates": link.predicates
                };
            });
        }

        this.copyState = function () {
            var nodesCopy = _.map(this.nodes, function (node) {
                return {
                    iri: node.iri,
                    size: node.size,
                    labels: angular.copy(node.labels),
                    types: angular.copy(node.types),
                    rdfRank: node.rdfRank,
                    x: node.x,
                    y: node.y,
                    fixed: node.fixed
                };
            });
            var linksCopy = _.map(this.links, function (link) {
                return {
                    source: link.source.iri,
                    target: link.target.iri,
                    predicates: link.predicates
                };
            });

            return {
                nodes: nodesCopy,
                links: linksCopy,
                colorIndex: colorIndex,
                type2color: type2color,
                scale: panAndZoom.scale(),
                translate: panAndZoom.translate()
            };
        };

        this.restoreState = function (state) {
            $scope.nodeSelected = true;
            $scope.searchVisible = false;

            this.nodes = angular.copy(state.nodes);
            this.links = [];
            this.addAndMatchLinks(state.links);

            _.each(this.nodes, function (d) {
                if (d.fixed) {
                    $scope.numberOfPinnedNodes++;
                }
            });

            if (angular.isDefined(state.colorIndex) && angular.isDefined(state.type2color)) {
                colorIndex = state.colorIndex;
                type2color = angular.copy(state.type2color);
            }

            if (angular.isDefined(state.translate) && angular.isDefined(state.scale)) {
                transformValues = "translate(" + state.translate[0] + ", " + state.translate[1] + ") scale(" + state.scale + ")";
                panAndZoom.translate(state.translate);
                panAndZoom.scale(state.scale);
            }

            draw();
        }
    }

    var graph = new Graph();

    $scope.defaultGraphConfig = {
        id: 'default',
        name: 'Easy graph',
        startMode: 'search'
    };

    // Graph Config
    $scope.getGraphConfigs = function (graphCallback) {
        GraphConfigService.getGraphConfigs()
            .success(function (data) {
                $scope.graphConfigs = data;
                if (graphCallback) {
                    graphCallback();
                }
            }).error(function (data) {
            toastr.error(getError(data), 'Could not get graph configs');
        });

    };

    $scope.loadConfigForId = function (configId, successCallback) {
        if (configId === $scope.defaultGraphConfig.id) {
            $scope.loadGraphConfig($scope.defaultGraphConfig);
        } else {
            GraphConfigService.getConfig(configId)
                .success(function (data) {
                    $scope.loadGraphConfig(data);
                    successCallback();
                })
                .error(function (data) {
                    toastr.error(getError(data), 'Could not load config ' + configId);
                });
        }
    };

    $scope.findConfigById = function (configId) {
        if (configId === $scope.defaultGraphConfig.id) {
            return $scope.defaultGraphConfig;
        }
        return $.grep($scope.graphConfigs, function (e) {
            return e.id === configId
        })[0];
    };

    $scope.easyGraphSearch = function (iri) {
        $scope.configLoaded = $scope.defaultGraphConfig;
        $scope.openUri(iri);
    };

    $scope.loadGraphConfig = function (config) {
        $scope.configLoaded = config;
        if (config.startMode === 'search') {
            $scope.searchVisible = true;
        } else if (config.startMode === 'node' && config.startIRI) {
            $timeout(function () {
                $scope.openUri(config.startIRI, true);
            }, 0);
        } else if (config.startMode === 'query' && config.startGraphQuery) {
            $scope.loading = true;
            GraphConfigService.loadGraphForConfig(config, config.startQueryIncludeInferred, $scope.saveSettings['linksLimit'], config.startQuerySameAs)
                .then(function (response) {
                    // Node drawing will turn off loader
                    initGraphFromResponse(response);
                }, function (data) {
                    $scope.loading = false;
                    toastr.error(getError(data), 'Could not load graph from config');
                });
        }
    };

    $scope.deleteConfig = function (config) {
        ModalService.openSimpleModal({
            title: 'Confirm',
            message: 'Are you sure you want to delete the graph config ' + '\'' + config.name + '\'?',
            warning: true
        }).result
            .then(function () {
                GraphConfigService.deleteGraphConfig(config)
                    .success(function () {
                        $scope.getGraphConfigs();
                        $scope.refreshSavedGraphs();
                    }).error(function (data) {
                    toastr.error(getError(data), 'Could not delete graph config');
                });
            });
    };

    $scope.goToGraphConfig = function (config) {
        $scope.pushHistory({config: config.id}, {config: config});
        $scope.resetState();
        $scope.loadGraphConfig(config);
    };

    $window.onpopstate = function (event) {
        $scope.resetState();

        if (event.state) {
            if (event.state.config) {
                $scope.loadGraphConfig(event.state.config);
                if (event.state.uri) {
                    $scope.openUri(event.state.uri, true);
                }
            } else if (event.state.savedGraph) {
                $scope.loadSavedGraph(event.state.savedGraph, true);
            }
        }
    };

    var loadGraphForQuery = function (queryString, sameAsParam, inferredParam) {
        var sendSameAs = (sameAsParam === undefined) ? ($scope.saveSettings['sameAsState']) : sameAsParam === true;
        var sendInferred = (inferredParam === undefined) ? ($scope.saveSettings['includeInferred']) : inferredParam === true;

        $scope.loading = true;
        $http({
            url: 'rest/explore-graph/graph',
            method: 'GET',
            params: {
                query: queryString,
                linksLimit: $scope.saveSettings['linksLimit'],
                languages: !$scope.shouldShowSettings() ? [] : $scope.saveSettings['languages'],
                includeInferred: sendInferred,
                sameAsState: sendSameAs
            }
        }).then(function (response) {
            // Node draw will turn off loader
            initGraphFromResponse(response);
        }, function (response) {
            $scope.loading = false;
            toastr.error(getError(response.data), 'Cannot load visual graph!');
        });
    };

    var loadGraphFromQueryParam = function () {
        // view graph config
        if ($location.search().config) {
            $scope.loadConfigForId($location.search().config, initGraphFromQueryParam);
        } else if ($location.search().query || $location.search().uri) {
            $scope.loadGraphConfig($scope.defaultGraphConfig);
            initGraphFromQueryParam();
        } else {
            initGraphFromQueryParam();
        }
    };

    var initGraphFromQueryParam = function () {
        // view sparql
        if ($location.search().query) {
            $scope.searchVisible = false;
            $scope.queryResultsMode = true;
            loadGraphForQuery($location.search().query,
                $location.search().sameAs,
                $location.search().inference);
        } else {
            // broadcasted event from view resource directive to take input value
            $scope.$on('onRootNodeChange', function (e, inputValue) {
                $scope.loading = true;
                if (angular.isDefined(inputValue)) {
                    $scope.rootNodeIri = inputValue;
                    $http({
                        url: 'rest/explore-graph/node',
                        method: 'GET',
                        params: {
                            iri: inputValue,
                            config: $scope.configLoaded ? $scope.configLoaded.id : $scope.defaultGraphConfig.id,
                            languages: !$scope.shouldShowSettings() ? [] : $scope.saveSettings['languages'],
                            includeInferred: $scope.saveSettings['includeInferred'],
                            sameAsState: $scope.saveSettings['sameAsState']
                        }
                    }).then(function (response) {
                        $scope.nodeSelected = true;
                        $scope.searchVisible = false;
                        if (response.data.types === null) {
                            response.data.types = "greyColor";
                        }
                        graph = new Graph();
                        var rootNode = graph.addNode(response.data, width / 2, height / 2);

                        transformValues = "translate(0, -70) scale(1)";
                        panAndZoom.translate([0, -70]);
                        panAndZoom.scale(1);

                        expandNode(rootNode, true);
                    }).catch(function (err) {
                        $scope.loading = false;
                        toastr.error(getError(err), 'Could not load visual graph');
                    });
                }
            });
        }

        if ($location.search().uri) {
            $scope.openUri($location.search().uri);
        }

        if ($location.search().saved) {
            SavedGraphsService.getSavedGraph($location.search().saved)
                .success(function (data) {
                    $scope.loadSavedGraph(data);
                })
                .error(function (data) {
                    var msg = getError(data);
                    toastr.error(msg, 'Error! Could not open saved graph');
                });
        }
    };


    $scope.replaceIRIWithPrefix = function (iri) {
        var namespaces = $scope.namespaces;
        var namespacePrefix = _.findLast(namespaces, function (o) {
            return iri.indexOf(o.uri) === 0
        });
        return namespacePrefix ? (namespacePrefix.prefix + ":" + iri.substring(namespacePrefix.uri.length)) : iri;
    };

    function expandPrefix(str, namespaces) {
        var ABS_URI_REGEX = /^<?(http|urn).*>?/;
        if (!ABS_URI_REGEX.test(str)) {
            var uriParts = str.split(':'),
                uriPart = uriParts[0],
                localName = uriParts[1];
            if (!angular.isUndefined(localName)) {
                var expandedUri = ClassInstanceDetailsService.getNamespaceUriForPrefix(namespaces, uriPart);
                if (expandedUri) {
                    return expandedUri + localName;
                }
            }
        }
        return str;
    }

    $scope.addingTag = function (tag) {
        tag.text = expandPrefix(tag.text, $scope.namespaces);
        $scope.pageslideExpanded = true;
        return tag;
    };

    $scope.getActiveRepository = function () {
        return $repositories.getActiveRepository();
    };

    function initForRepository() {
        if (!$repositories.getActiveRepository()) {
            return;
        }

        // Inits namespaces for repo
        $http.get('repositories/' + $scope.getActiveRepository() + '/namespaces').success(function (data) {
            var nss = _.map(data.results.bindings, function (o) {
                return {"uri": o.namespace.value, "prefix": o.prefix.value}
            });
            $scope.namespaces = _.sortBy(nss, function (n) {
                return n.uri.length
            });

            $scope.getNamespacesPromise = ClassInstanceDetailsService.getNamespaces($scope.getActiveRepository());
            $scope.getAutocompletePromise = AutocompleteService.checkAutocompleteStatus();
        }).error(function (data) {
            toastr.error(getError(data), 'Cannot get namespaces for repository. View will not work properly!');
        });
    }

    $scope.$on('repositoryIsSet', function (event, args) {
        initForRepository();

        // New repo set from dropdown, clear state and go to home page
        if (args.newRepo) {
            $scope.resetState();
            // Quick-n-dirty way to get rid of the existing vis
            $('.graph-visualization svg').empty();

            // When we come from the sparql view and then change the repo though the dropdown,
            // should goToHome and reinit the view, for the search to view on the home page
            if ($location.search().query) {
                $scope.goToHome();
                initGraphFromQueryParam();
            }

        }
    });

    $scope.getGraphConfigs(loadGraphFromQueryParam);

    // when the view is initialized without the page refresh
    if (!$scope.getNamespacesPromise || !$scope.getAutocompletePromise) {
        initForRepository();
    }


    var multiClickDelay = 500; // max delay between clicks for multiple click events

    // build svg element
    var width = 1000,
        height = 1000;

    var nodeLabelRectScaleX = 1.75;
    var nodeLabelMinFontSize = 16; // pixels

    var color1 = d3.scale.linear()
        .domain([0, 9])
        .range(["hsl(0, 100%, 75%)", "hsl(360, 90%, 82%)"])
        .interpolate(d3.interpolateHslLong);

    var color2 = d3.scale.linear()
        .domain([0, 9])
        .range(["hsl(180, 50%, 75%)", "hsl(540, 40%, 82%)"])
        .interpolate(d3.interpolateHslLong);

    var type2color = {};
    var colorIndex = 0;

    $scope.getColor = function (type) {
        if (angular.isUndefined(type2color[type])) {
            type2color[type] = colorIndex;
            colorIndex++;
        }

        var index = type2color[type];
        if (index > 39) {
            return "#c2c2c2"
        } else if (index % 2 === 0) {
            return color1(index / 2);
        } else {
            return color2(index / 2);
        }
    };

    var force = d3.layout.force()
        .gravity(0.07)
        .size([width, height]);

    var svg = d3.select(".main-container .graph-visualization").append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid meet");

    var transformValues;

    // define zoom and drag behavior; keep this out of draw() to preserve state when nodes are added/removed
    var panAndZoom = d3.behavior.zoom()
        .scaleExtent([0.5, 10]);

    function draw(resetRootNode) {
        // remove all group elements and rec to rebuild the graph when the user clicks on it
        d3.selectAll("svg g").remove();
        d3.selectAll("svg rect").remove();
        d3.selectAll('.d3-tip').remove();
        d3.selectAll('.menu-events').remove();

        // zoom and drag event
        panAndZoom.on("zoom", panAndZoomed);

        // building rectangular so we can bind zoom and drag effects
        var rect = svg.append("rect")
            .attr("width", width * 10)
            .attr("height", height * 10)
            .attr("x", -(width * 10 - width) / 2)
            .attr("y", -(height * 10 - height) / 2)
            .style("fill", "none")
            .style("pointer-events", "all")
            .call(panAndZoom)
            .on("click", function (d) {
                d3.event.stopPropagation();
                removeMenuIfVisible();
                // Clicking outside the graph stops the layout
                force.stop();
            });


        var container = svg.append("g").attr("class", "nodes-container")
            .attr("transform", function () {
                if (angular.isDefined(transformValues) && !resetRootNode) {
                    return transformValues;
                }
                return '';
            });

        var tip = d3tip()
            .attr('class', 'd3-tip')
            .customPosition(function (d) {
                var bbox = tipElement.getBoundingClientRect();
                return {
                    top: (bbox.bottom + 10) + 'px',
                    left: (bbox.left - 30) + 'px'
                }
            })
            .html(function (d) {
                var html = '';

                if (d.fixed) {
                    // add pin icon if pinned down
                    html += '<i class="icon-pin"></i>&nbsp;&nbsp;';
                }

                if (d.types.length > 0) {
                    // mid-dot delimited types
                    html += _.join(_.map(d.types, function (t) {
                        return $scope.replaceIRIWithPrefix(t)
                    }), ' \u00B7 ');
                } else {
                    html += '<i>No types</i>';
                }

                return html;
            });

        var numberOfPredLeft = function (d) {
            return d.predicates.length - 10;
        };

        var calculateWidth = function (d) {
            var text = createTipText(d);
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            ctx.font = "13px Arial";

            if (d.predicates.length < 10) {
                return ctx.measureText(text).width;
            } else {
                return ctx.measureText(text).width / 2;
            }
        };

        // This will create text that will appear in d3tip
        var createTipText = function (d) {
            var html = '';
            html += _.join(_.map(d.predicates, function (p, index) {
                if (index === 0) {
                    return getShortPredicate(p);
                    // If we have less than or ten predicates should show them with middle dot separated
                } else if (index < 10) {
                    return ' \u00B7 ' + getShortPredicate(p);
                    // On eleventh predicate just append how many more predicates left to show to the user
                } else if (index == 10) {
                    var numOfPredLeft = numberOfPredLeft(d);
                    // Show how many predicates left
                    var textToShow = numOfPredLeft > 1 ? numOfPredLeft + ' predicates'
                        : numOfPredLeft + ' predicate';
                    return ' \u00B7 ' + 'more ' + textToShow + ' to show';
                }
            }), '');

            return html;
        };

        var tipPredicates = d3tip()
            .attr('class', 'd3-tip')
            .customPosition(function (d) {
                var bbox = tipPredicateElement.getBoundingClientRect();
                var textWidth = calculateWidth(d);
                return {
                    top: (bbox.top - 30) + 'px',
                    left: (bbox.left - 30) + 'px',
                    width: textWidth + 'px'
                }
            })
            .html(function (d) {
                return createTipText(d);
            });

        var tipTimer;
        var tipElement;
        // Shows the tooltip for a node but with a slight delay
        var showTipForNode = function (d, event) {
            $timeout.cancel(tipTimer);
            var thisTipElement = tipElement = event.target;
            $timeout(function () {
                if (tipElement === thisTipElement) {
                    tip.show(d, tipElement);
                }
            }, 300);
        };

        // Hides the tooltip for the node and resets some variables
        var hideTipForNode = function (d) {
            $timeout.cancel(tipTimer);
            $timeout.cancel(showNodeTipAndIconsTimer);
            tipElement = null;
            tip.hide();
            removeIconsTimer = $timeout(function () {
                removeMenuIfVisible();
            }, 500);
        };

        // Updates the text in the tooltip if already visible
        var updateTipForNode = function (d) {
            if (tipElement) {
                tip.show(d, tipElement);
            }
        };

        svg.call(tip);


        var tipPredicateTimer;
        var tipPredicateElement;
        // Shows like tooltip list of predicates but with a slight delay
        var showPredicateToolTip = function (d) {
            $timeout.cancel(tipPredicateTimer);
            var thisPredicateTipElement = tipPredicateElement = d3.event.target;
            $timeout(function () {
                if (tipPredicateElement === thisPredicateTipElement && d.predicates.length > 1) {
                    tipPredicates.show(d, tipPredicateElement);
                }
            }, 300);
        };

        // Hides the tooltip with predicates and resets some variables
        var hidePredicateToolTip = function (d) {
            $timeout.cancel(tipPredicateTimer);
            tipPredicateElement = null;
            tipPredicates.hide();
        };

        svg.call(tipPredicates);

        var link = svg.selectAll(".link"),
            node = svg.selectAll(".node");

        force.nodes(graph.nodes).charge(-3000);

        force.links(graph.links).linkDistance(function (link) {
            // link distance depends on length of text with an added bonus for strongly connected nodes,
            // i.e. they will be pushed further from each other so that their common nodes can cluster up
            return getPredicateTextLength(link) + 30 * link.connectedness;
        });

        // arrow markers
        container.append("defs").selectAll("marker")
            .data(force.links())
            .enter().append("marker")
            .attr("class", "arrow-marker")
            .attr("id", function (d) {
                return d.target.size;
            })
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", function (d) {
                return d.target.size + 11;
            })
            .attr("refY", 0)
            .attr("markerWidth", 10)
            .attr("markerHeight", 10)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5");

        // add the links, nodes, predicates and node labels
        var link = container.selectAll(".link")
            .data(graph.links)
            .enter().append("g")
            .attr("class", "link-wrapper")
            .attr("id", function (d) {
                return d.source.iri + '>' + d.target.iri;
            })
            .append("line")
            .attr("class", "link")
            .style("stroke-width", 1)
            .style("fill", "transparent")
            .style("marker-end", function (d) {
                return "url(" + $location.absUrl() + "#" + d.target.size + ")";
            });

        var predicate = container.selectAll(".link-wrapper")
            .append("text")
            .text(function (d, index) {
                return getPredicate(d, index);
            })
            .attr("class", function (d) {
                if (d.predicates.length > 1) {
                    return "predicates";
                }
                return "predicate";
            })
            .attr("dy", "-0.5em")
            .style("text-anchor", "middle")
            .style("display", $scope.saveSettings.showLinksText ? "" : "none")
            .on("mouseover", function (d) {
                d3.event.stopPropagation();
                showPredicateToolTip(d);
            })
            .on('mouseout', hidePredicateToolTip)
            .on("click", function (d) {
                d3.event.stopPropagation();
                openPredicates(d);
            });

        // node events and variables
        var mouseEventTimer;
        var upEventLast = 0;
        var virtualClickEventTimer = 0;
        var moveEventCount = 0;

        // tracks mousedown and touchstart events in order to count single or double click
        // (checked in upEventHandler)
        var downEventHandler = function (d) {
            if (d3.event.button && d3.event.button !== 0) {
                return;
            }

            hideTipForNode();
            $timeout.cancel(mouseEventTimer);
            $scope.showPredicates = false;
            if (d3.event.timeStamp - upEventLast < multiClickDelay) {
                virtualClickEventTimer++;
            } else {
                virtualClickEventTimer = 1;
            }

            upEventLast = d3.event.timeStamp;

            d3.event.preventDefault();
        };

        // builds upon downEventHandler and adds additional functionality for touch devices
        var touchStartEventHandler = function (d) {
            downEventHandler(d);

            // for touch devices we track touch and hold for 1s in order to remove a node
            moveEventCount = 0;
            mouseEventTimer = $timeout(function () {
                if (moveEventCount < 5) {
                    // remove the node only if not many move events were fired,
                    // this avoids conflict with dragging nodes
                    hideNode(d);
                }
                mouseEventTimer = null;
                virtualClickEventTimer = 0;
            }, 1000);
        };

        // tracks the number of move events (checked in the touchend event handler)
        var moveEventHandler = function (d) {
            moveEventCount++;
        };

        var showNodeTipAndIcons = function (d) {
            if (!d.isBeingDragged) {
                var event = d3.event;
                $timeout.cancel(removeIconsTimer);
                showNodeTipAndIconsTimer = $timeout(() => {
                    if (expandNodeIcons(d, this)) {
                        showTipForNode(d, event);
                    }
                }, 400);
            }
        };

        var upEventHandler = function (d) {
            if (d3.event.button && d3.event.button !== 0) {
                return;
            }

            $timeout.cancel(mouseEventTimer);

            var event = d3.event;
            var element = this;
            if (d3.event.timeStamp - upEventLast < multiClickDelay) {
                if (virtualClickEventTimer === 1) {
                    mouseEventTimer = $timeout(function () {
                        clickedNode(d, element, event);
                    }, 40 + multiClickDelay - (d3.event.timeStamp - upEventLast));
                } else if (virtualClickEventTimer === 2) {
                    // expand node
                    var shownLinks = graph.countLinks(d, graph.links);
                    if (!(shownLinks >= $scope.saveSettings['linksLimit'])) {
                        expandNode(d, false, element.parentNode);
                    }
                    $scope.closeInfoPanel();
                }
            }

            d3.event.preventDefault();
        };

        // Shows growing or shrinking pin animation
        function showPinAnimation(d, type) {
            var startSize, endSize, startOpacity, endOpacity,
                animate = true;

            if (type === 'down') {
                startSize = d.size * 2;
                endSize = d.size / 3;
                startOpacity = 0.8;
                endOpacity = 0.3;
            } else if (type === 'down-fixed') {
                startSize = d.size * 2;
                endSize = d.size;
                startOpacity = 0.8;
                endOpacity = 0.66;
            } else if (type === 'up') {
                startSize = d.size / 3;
                endSize = d.size * 2;
                startOpacity = 0.3;
                endOpacity = 0.8;
            } else if (type === 'fixed') {
                startSize = d.size;
                startOpacity = 0.66;
                animate = false;
            } else {
                return; // unknown
            }

            var pin = container.selectAll('.node-wrapper')
                .filter(function (innerD) {
                    return innerD === d;
                })
                .append('text')
                .text('\ue90f') // pin icon
                .classed('icon-any pinned', true)
                .style('font-size', startSize + 'px')
                .attr('x', function (d) {
                    return d.x;
                })
                .attr('y', function (d) {
                    return d.y;
                })
                .attr('opacity', startOpacity);

            if (type === 'fixed' || type === 'down-fixed') {
                d.pin = pin;
            }

            if (animate) {
                pin = pin.transition()
                    .duration(1000)
                    .style('font-size', function (d) {
                        return endSize + 'px';
                    })
                    .attr('opacity', endOpacity);

                if (type !== 'down-fixed') {
                    pin.remove();
                }
            }
        }

        function removePin() {
            d3.select('.pinned').remove();
        }

        // Unfixes nodes that were dragged previously
        var rightClickHandler = function (d) {
            if (d3.event.shiftKey) {
                // Do nothing with shift key, use to access context menu
                return;
            }

            d3.event.preventDefault();

            removeMenuIfVisible();
            $scope.closeInfoPanel();

            if (d.fixed) {
                // unpin
                $scope.numberOfPinnedNodes--;
                d.fixed = false;
                showPinAnimation(d, 'up');
                force.resume();
            } else {
                // pin down
                $scope.numberOfPinnedNodes++;
                d.fixed = true;
                showPinAnimation(d, 'down');
            }
            // update pin in tooltip
            updateTipForNode(d);
        };

        var drag = d3.behavior.drag()
            .origin(function (d) {
                return d;
            })
            .on("dragstart", dragstarted)
            .on("drag", dragged)
            .on("dragend", dragended);


        function dragstarted(d) {
            if (d3.event.sourceEvent.button === 0) {
                d.fixedBeforeDrag = d.fixed;
                d.isBeingDragged = true;
                d.beginDragging = true;
                removeMenuIfVisible();
                d3.event.sourceEvent.stopPropagation();
                d3.select(this).classed("dragging", true);
            }
        }

        function dragged(d) {
            if (d.isBeingDragged) {
                // reset click counter to avoid conflicts between clicks and drags
                virtualClickEventTimer = 0;

                d.px = d3.event.x;
                d.py = d3.event.y;
                if (!d.fixed) {
                    $scope.numberOfPinnedNodes++;
                    d.fixed = true;
                    showPinAnimation(d, 'down-fixed');
                } else if (d.beginDragging) {
                    showPinAnimation(d, 'fixed');
                }
                d.pinWasFixed = true;
                d.beginDragging = null;

                force.resume();
            }
        }

        function dragended(d) {
            if (d.isBeingDragged) {
                if (d.pinWasFixed) {
                    d.pinWasFixed = null;
                    removePin();
                }
                d.isBeingDragged = false;
                d3.select(this).classed("dragging", false);
            }
        }

        var node = container.selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node-wrapper")
            .attr("id", function (d) {
                return d.iri;
            })
            .append("circle")
            .attr("class", "node")
            .attr("r", function (d) {
                return d.size;
            })
            .style("fill", function (d) {
                if (d.types === "greyColor") {
                    return "c2c2c2";
                }
                return $scope.getColor(d.types[0]);
            })
            .call(drag)
            .on('mouseover', showNodeTipAndIcons)
            .on('mouseout', hideTipForNode)
            .on("mousedown", downEventHandler)
            .on("touchstart", touchStartEventHandler)
            // no need to track move for mouse
            .on("touchmove", moveEventHandler)
            .on("mouseup", upEventHandler)
            .on("touchend", upEventHandler)
            .on("contextmenu", rightClickHandler);

        var nodeLabels = container.selectAll(".node-wrapper").append("foreignObject")
            .style("pointer-events", "none")
            .attr("width", function (d) {
                return d.size * 2 * nodeLabelRectScaleX;
            });
        // height will be computed by updateNodeLabels

        var menuEventsWrapper = container.insert("g")
            .attr("class", "menu-events");

        updateNodeLabels(nodeLabels);

        force.on("tick", function () {
            // recalculate nodes positions and repel them if they collide
            var q = d3.geom.quadtree(graph.nodes),
                i = 0,
                n = graph.nodes.length;
            // FIXME while (++i < n) q.visit(collide(graph.nodes[i]));

            // recalculate links attributes
            link.attr("x1", function (d) {
                return d.source.x;
            }).attr("y1", function (d) {
                return d.source.y;
            }).attr("x2", function (d) {
                return d.target.x;
            }).attr("y2", function (d) {
                return d.target.y;
            });

            // recalculate predicates attributes
            predicate.attr("x", function (d) {
                return d.x = (d.source.x + d.target.x) * 0.5;
            }).attr("y", function (d) {
                return d.y = (d.source.y + d.target.y) * 0.5;
            }).attr("transform", function (d) {
                var angle;
                if (d.direction === 'double') {
                    angle = findAngleBetweenNodes(d, d.direction);
                    return "rotate(" + angle + ", " + d.x + ", " + d.y + ")";
                } else {
                    angle = findAngleBetweenNodes(d, d.direction);
                    return "rotate(" + angle + ", " + d.x + ", " + d.y + ")";
                }

            });

            // recalculate nodes attributes
            node.attr("cx", function (d) {
                return d.x;
            }).attr("cy", function (d) {
                return d.y;
            });

            // update node loader position
            container.select(".node-loader").attr("x", function (d) {
                return d.x - d.size + 3; //square svg is not perfectly centered and need +3 units on x ordinate to fit in circle
            }).attr("y", function (d) {
                return d.y - d.size;
            });

            container.select(".loader-container").attr("cx", function (d) {
                return d.x;
            }).attr("cy", function (d) {
                return d.y;
            });

            nodeLabels.attr("x", function (d) {
                return d.x - (d.size * nodeLabelRectScaleX);
            }).attr("y", function (d) {
                // the height of the nodeLabel box is 3 times the fontSize computed by updateNodeLabels
                // and we want to offset it so that its middle matches the centre of the circle, hence divided by 2
                return d.y - 3 * d.fontSize / 2;
            });

            // Update position of shrinking pin animation (if any)
            d3.select('.pinned').attr("x", function (d) {
                return d.x;
            }).attr("y", function (d) {
                return d.y;
            });
        });

        function panAndZoomed() {
            transformValues = "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")";
            container.attr("transform", transformValues);
        }

        if (angular.isDefined(loader)) {
            loader.setLoadingState(false);
        }

        if ($scope.loading) {
            $scope.loading = false;
        }

        d3.selectAll('.link-wrapper').each(function () {
            var source = $(this).attr("id").split(">")[0];
            var target = $(this).attr("id").split(">")[1];
            d3.selectAll('.link').each(function (link) {
                if (link.source.iri === target && link.target.iri === source) {
                    var twoWayLinkID = link.source.iri;
                    twoWayLinkID += ">";
                    twoWayLinkID += link.target.iri;
                    var textNode = document.createTextNode('  \u27F6');
                    document.getElementById(twoWayLinkID).lastChild.appendChild(textNode);
                    link.direction = "double";
                }
            });
        });

        d3.selectAll('.d3-actions-tip').remove();

        force.start();

    }

    /* FIXME
    // check for collision of the nodes
    function collide(node, bigger) {
        return function (quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== node)) {
                var x = node.x - quad.point.x,
                    y = node.y - quad.point.y,
                    l = Math.sqrt(x * x + y * y),
                    r = node.size + quad.point.size;
                if (l < r) {
                    l = (l - r) / l * .5;
                    node.x -= x *= l;
                    node.y -= y *= l;
                    quad.point.x += x;
                    quad.point.y += y;
                }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        };
    }
    */

    draw();

    // find angle between pair of nodes so we can position predicates
    function findAngleBetweenNodes(linkedNodes, direction) {
        var sourceNode = linkedNodes.source;
        var targetNode = linkedNodes.target;

        var p1 = {
            x: sourceNode.x,
            y: sourceNode.y
        };

        var p2 = {
            x: targetNode.x,
            y: targetNode.y
        };
        if (direction) {
            return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        }
        else {
            var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
            if (angleDeg <= 90 && angleDeg >= -90) {
                return angleDeg;
            }
            return (angleDeg > 0 ? -1 : 1) * (180 - Math.abs(angleDeg));
        }
    }

    var menuEvents = new MenuEvents();

    // expanding and collapsing of the nodes
    function clickedNode(d, element, event) {
        $scope.showInfoPanel = false;
        $scope.showPredicates = false;
        $scope.showNodeInfo = false;

        // shift + ctrl/cmd + click focuses node
        if (event.shiftKey && (event.ctrlKey || event.metaKey)) {
            $rootScope.$broadcast("onRootNodeChange", d.iri);
            return;
        }

        // ctrl/cmd + click hides the node
        if (event.ctrlKey || event.metaKey) {
            hideNode(d);
            return;
        }

        // If value of openedNodeInfoPanel is different than "undefined"
        // we evaluate if clicked node value is the same and close it
        if (typeof $scope.openedNodeInfoPanel !== "undefined" && $scope.openedNodeInfoPanel === d) {
            $scope.pageslideExpanded = false;
            $scope.openedNodeInfoPanel = undefined;
            return;
        }

        showNodeInfo(d);
    }

    function expandNodeIcons(d, element) {
        if ($scope.showInfoPanel) {
            return false;
        }

        if (menuEvents.closeIcon || menuEvents.expandIcon || menuEvents.focusIcon || menuEvents.copyURIIcon) {
            menuEvents.removeIcons();
        }

        // If nodes are still rearranging result of force.alpha() is more than 0.05
        // and we don't want to show node's icons on mouse over and stop rearrangement
        if (force.alpha() < 0.05) {
            menuEvents.initIcons(d, element.parentNode);
            force.stop();

            return true;
        }

        return false;
    }

    function hideNode(d) {
        graph.removeNode(d);
        draw();
    }

    function collapseNode(d) {
        d.isExpanded = false;
        graph.removeNodeLeafLinks(d);
        draw();
    }

    var loader = new Loader();

    function initGraph(response) {
        $scope.nodeSelected = true;
        if (response.data.types === null) {
            response.data.types = "greyColor";
        }
        graph = new Graph();
        transformValues = "translate(0, -70) scale(1)";
        panAndZoom.translate([0, -70]);
        panAndZoom.scale(1);
    }

    function initGraphFromResponse(response) {
        initGraph(response);
        renderGraphFromResponse(response);
    }

    function renderGraphFromResponse(response, d, isStartNode) {
        var linksFound = response.data;
        // filter existing links
        linksFound = _.filter(linksFound, function (newLink) {
            return _.findIndex(graph.links,
                function (existingLink) {
                    return newLink.source === existingLink.source.iri && newLink.target === existingLink.target.iri
                }) === -1;
        });
        // filter reflexive links until we find a way to render them  GDB-1853
        linksFound = _.filter(linksFound, function (newLink) {
            return newLink.source !== newLink.target;
        });
        var nodesFromLinks = _.union(_.flatten(_.map(response.data, function (d) {
            return [d.source, d.target];
        })));
        var existingNodes = _.map(graph.nodes, function (n) {
            return n.iri;
        });
        var newNodes = _.reject(nodesFromLinks, function (n) {
            return _.includes(existingNodes, n);
        });

        if (newNodes.length === 0) {
            if (isStartNode) {
                toastr.info('This node has no visible connections.');
            } else if (linksFound.length === 0) {
                toastr.info('This node has no other visible connections.');
            }

            graph.addAndMatchLinks(linksFound);
            draw();
        } else {
            var promises = [];
            var newNodesData = [];

            _.forEach(newNodes, function (newNode, index) {
                promises.push($http({
                    url: 'rest/explore-graph/node',
                    method: 'GET',
                    params: {
                        iri: newNode,
                        config: $scope.configLoaded.id,
                        includeInferred: $scope.saveSettings['includeInferred'],
                        sameAsState: $scope.saveSettings['sameAsState']
                    }
                }).then(function (response) {
                    // Save the data for later
                    newNodesData[index] = response.data;
                }));
            });

            // Waits for all of the collected promises and then:
            // - adds each new node
            // - redraws the graph
            $q.all(promises).then(function () {
                _.forEach(newNodesData, function (newNodeData, index) {
                    // Calculate initial positions for the new nodes based on spreading them evenly
                    // on a circle around the node we came from.
                    var theta = 2 * Math.PI * index / newNodesData.length;
                    var x = (d ? d.x : 0) + Math.cos(theta) * height / 3;
                    var y = (d ? d.y : 0) + Math.sin(theta) * height / 3;
                    graph.addNode(newNodeData, x, y);
                });

                graph.addAndMatchLinks(linksFound);
                if (d) {
                    d.isExpanded = true;
                }
                draw();
            });
        }
    }

    function expandNode(d, isStartNode, parentNode) {
        if (loader.getLoadingState()) {
            return;
        }
        loader.init(d, parentNode);

        var expandIri = d.iri;
        $http({
            url: 'rest/explore-graph/links',
            method: 'GET',
            params: {
                iri: expandIri, linksLimit: $scope.saveSettings['linksLimit'],
                includeInferred: $scope.saveSettings['includeInferred'],
                config: $scope.configLoaded.id,
                preferredTypes: !$scope.shouldShowSettings() ? [] : $scope.saveSettings['preferredTypes'],
                rejectedTypes: !$scope.shouldShowSettings() ? [] : $scope.saveSettings['rejectedTypes'],
                preferredPredicates: !$scope.shouldShowSettings() ? [] : $scope.saveSettings['preferredPredicates'],
                rejectedPredicates: !$scope.shouldShowSettings() ? [] : $scope.saveSettings['rejectedPredicates'],
                preferredTypesOnly: !$scope.shouldShowSettings() ? [] : $scope.saveSettings['preferredTypesOnly'],
                preferredPredicatesOnly: !$scope.shouldShowSettings() ? [] : $scope.saveSettings['preferredPredicatesOnly'],
                languages: !$scope.shouldShowSettings() ? [] : $scope.saveSettings['languages'],
                sameAsState: $scope.saveSettings['sameAsState']
            }
        }).then(function (response) {
            renderGraphFromResponse(response, d, isStartNode);
        }, function (response) {
            var msg = getError(response.data);
            toastr.error(msg, 'Error exploring node');
            $scope.loading = false;
            loader.setLoadingState(false);
        });
    }

    function removeMenuIfVisible() {
        if (angular.isDefined(menuEvents) && menuEvents.expandedState) {
            menuEvents.removeIcons();
        }
    }

    var showNodeTipAndIconsTimer = 0;
    var removeIconsTimer = 0;

    function MenuEvents() {
        this.closeIcon = undefined;
        this.expandIcon = undefined;
        this.collapseIcon = undefined;
        this.focusIcon = undefined;
        this.copyURIIcon = undefined;
        this.actionsTip = undefined;

        this.removeIcons = function () {
            this.closeIcon.remove("g");
            if (this.expandIcon) {
                this.expandIcon.remove("g");
            }

            if (this.collapseIcon) {
                this.collapseIcon.remove("g");
            }

            this.focusIcon.remove("g");
            this.copyURIIcon.remove("g");
            this.closeIcon = undefined;
            this.expandIcon = undefined;
            this.collapseIcon = undefined;
            this.focusIcon = undefined;
            this.copyURIIcon = undefined;

            this.expandedState = false;
        };

        this.expandedState = false;

        function getPositionAndAngle(angle, d) {
            var x = d.x - 14 + (d.size + 15) * Math.cos(angle * Math.PI / 180 - Math.PI / 2);
            var y = d.y - 14 + (d.size + 15) * Math.sin(angle * Math.PI / 180 - Math.PI / 2);
            return "translate(" + x + "," + y + ")";
        }

        this.initIcons = function (node, parentNode) {
            // init action tips on hover of the icons
            var actionsTip = d3tip()
                .attr('class', 'd3-tip d3-actions-tip')
                .customPosition(function () {
                    var bbox = d3.event.target.getBoundingClientRect();
                    return {
                        top: (bbox.top - 20) + 'px',
                        left: (bbox.right + 10) + 'px'
                    };
                })
                .html(function (name) {
                    return name;
                });
            svg.call(actionsTip);
            var angle = 20;
            if (node.isExpanded) {
                this.collapseIcon = d3.select('.menu-events').append("g")
                    .attr("class", "collapse-icon")
                    .attr("name", "collapse")
                    .attr("transform", function () {
                        return getPositionAndAngle(angle, node);
                    });
                this.collapseIcon.append("circle")
                    .attr("cx", 14)
                    .attr("cy", 14)
                    .attr("r", 13)
                    .style("fill", "#eee");
                this.collapseIcon.append("path")
                    .attr("d", "M22.67,12a.59.59,0,0,1-.53.65l-6.88.72H15.2a.59.59,0,0,1-.59-.65l.72-6.88A.58.58,0,0,1,16,5.33a.59.59,0,0,1,.53.65L16,11.11,21.3,5.79a.64.64,0,0,1,.91.91L16.89,12,22,11.49A.59.59,0,0,1,22.67,12ZM12.59,14.75l-6.75.85a.59.59,0,0,0-.51.66.58.58,0,0,0,.66.51l4.95-.62-5.2,5.2a.64.64,0,1,0,.91.91l5.2-5.2L11.23,22a.59.59,0,0,0,.51.66h.07a.59.59,0,0,0,.59-.52l.85-6.75a.59.59,0,0,0-.17-.49A.58.58,0,0,0,12.59,14.75Z")
                    .style("fill", "#ed4f2f");

                this.collapseIcon.on("click", function () {
                    collapseNode(node);
                }).on('mouseover', function () {
                    actionsTip.show(this.getAttribute("name"));
                    $timeout.cancel(showNodeTipAndIconsTimer);
                    $timeout.cancel(removeIconsTimer);
                }).on('mouseout', function () {
                    actionsTip.hide();
                    removeIconsTimer = $timeout(function () {
                        removeMenuIfVisible();
                    }, 500);
                });
            } else {
                this.expandIcon = d3.select('.menu-events').append("g")
                    .attr("class", "expand-icon")
                    .attr("name", "expand")
                    .attr("transform", function () {
                        return getPositionAndAngle(angle, node);
                    });
                this.expandIcon.append("circle")
                    .attr("cx", 14)
                    .attr("cy", 14)
                    .attr("r", 13)
                    .style("fill", "#eee");
                this.expandIcon.append("path")
                    .attr("d", "M22.37,6.28l-.72,6.88a.59.59,0,0,1-.59.53H21a.59.59,0,0,1-.53-.65L21,7.9l-5.32,5.32a.64.64,0,0,1-.91-.91L20.1,7,15,7.53a.59.59,0,0,1-.12-1.18l6.88-.72a.59.59,0,0,1,.65.65ZM12.89,20.34,7.95,21l5.2-5.2a.64.64,0,0,0-.91-.91L7,20.05l.62-4.95A.59.59,0,0,0,6.48,15l-.85,6.75a.59.59,0,0,0,.59.67h.07L13,21.52a.59.59,0,1,0-.15-1.18Z")
                    .style("fill", "#ed4f2f");

                this.expandIcon.on("click", function () {
                    expandNode(node, false, parentNode);
                }).on('mouseover', function () {
                    actionsTip.show(this.getAttribute("name"));
                    $timeout.cancel(removeIconsTimer);
                    $timeout.cancel(showNodeTipAndIconsTimer);
                }).on('mouseout', function () {
                    actionsTip.hide();
                    removeIconsTimer = $timeout(function () {
                        removeMenuIfVisible();
                    }, 500);
                });
            }


            this.focusIcon = d3.select('.menu-events').append("g")
                .attr("class", "focus-icon")
                .attr("name", "focus")
                .attr("transform", function () {
                    return getPositionAndAngle(angle, node);
                });
            this.focusIcon.append("circle")
                .attr("cx", 14)
                .attr("cy", 14)
                .attr("r", 13)
                .style("fill", "#eee");
            this.focusIcon.append("path")
                .attr("d", "M14.2,23.81a9.8,9.8,0,1,1,6.93-2.87h0A9.74,9.74,0,0,1,14.2,23.81Zm0-18.17a8.37,8.37,0,1,0,5.92,14.29h0A8.37,8.37,0,0,0,14.2,5.64Zm1.42,6.95a2,2,0,1,0,0,2.85A2,2,0,0,0,15.62,12.59Z")
                .style("fill", "#ed4f2f");

            this.focusIcon.on("click", function () {
                $rootScope.$broadcast("onRootNodeChange", node.iri);
            }).on('mouseover', function () {
                actionsTip.show(this.getAttribute("name"));
                $timeout.cancel(removeIconsTimer);
                $timeout.cancel(showNodeTipAndIconsTimer);
            }).on('mouseout', function () {
                actionsTip.hide();
                removeIconsTimer = $timeout(function () {
                    removeMenuIfVisible();
                }, 500);
            });


            this.copyURIIcon = d3.select('.menu-events').append("g")
                .attr("class", "icon-link")
                .attr("name", "link")
                .attr("transform", function () {
                    return getPositionAndAngle(angle, node);
                });
            this.copyURIIcon.append("circle")
                .attr("cx", 14)
                .attr("cy", 14)
                .attr("r", 13)
                .style("fill", "#eee");
            this.copyURIIcon.append("path")
                .attr("d", "M 13.457031 10.164062 C 13.648438 10.164062 13.820312 10.242188 13.941406 10.363281 L 15.492188 11.859375 C 15.984375 12.332031 16.292969 12.992188 16.292969 13.714844 C 16.292969 14.441406 15.984375 15.097656 15.492188 15.574219 L 10.394531 20.496094 C 9.902344 20.972656 9.222656 21.265625 8.472656 21.265625 C 7.71875 21.265625 7.039062 20.972656 6.546875 20.496094 L 4.996094 19 C 4.507812 18.523438 4.203125 17.867188 4.203125 17.144531 C 4.203125 16.421875 4.507812 15.765625 4.996094 15.289062 L 7.542969 12.824219 C 7.667969 12.707031 7.84375 12.628906 8.035156 12.628906 C 8.417969 12.628906 8.726562 12.929688 8.726562 13.300781 C 8.726562 13.484375 8.648438 13.652344 8.523438 13.773438 L 5.976562 16.234375 C 5.738281 16.46875 5.589844 16.792969 5.589844 17.148438 C 5.589844 17.503906 5.738281 17.824219 5.976562 18.058594 L 7.527344 19.566406 C 7.773438 19.792969 8.105469 19.929688 8.472656 19.929688 C 8.835938 19.929688 9.167969 19.792969 9.414062 19.566406 L 14.511719 14.644531 C 14.753906 14.410156 14.90625 14.089844 14.90625 13.730469 C 14.90625 13.375 14.753906 13.054688 14.511719 12.820312 L 12.964844 11.324219 C 12.839844 11.203125 12.761719 11.039062 12.761719 10.855469 C 12.761719 10.488281 13.070312 10.1875 13.449219 10.1875 Z M 17.082031 3.976562 C 17.082031 3.976562 17.085938 3.976562 17.085938 3.976562 C 17.824219 3.976562 18.492188 4.261719 18.980469 4.722656 L 20.535156 6.203125 C 21.042969 6.679688 21.355469 7.34375 21.355469 8.082031 C 21.355469 8.792969 21.058594 9.441406 20.582031 9.914062 L 18.0625 12.402344 C 17.9375 12.527344 17.761719 12.605469 17.566406 12.605469 C 17.183594 12.605469 16.875 12.304688 16.875 11.9375 C 16.875 11.753906 16.949219 11.589844 17.070312 11.46875 L 19.605469 8.984375 C 19.847656 8.75 19.996094 8.429688 19.996094 8.070312 C 19.996094 7.714844 19.847656 7.394531 19.605469 7.160156 L 18.019531 5.667969 C 17.773438 5.445312 17.4375 5.304688 17.070312 5.300781 C 16.703125 5.304688 16.367188 5.453125 16.128906 5.691406 L 11.085938 10.667969 C 10.84375 10.898438 10.695312 11.222656 10.695312 11.578125 C 10.695312 11.933594 10.84375 12.257812 11.085938 12.488281 L 12.675781 13.980469 C 12.804688 14.101562 12.882812 14.273438 12.882812 14.457031 C 12.882812 14.828125 12.574219 15.128906 12.191406 15.128906 C 12.003906 15.128906 11.832031 15.054688 11.707031 14.9375 L 10.140625 13.457031 C 9.636719 12.980469 9.324219 12.316406 9.324219 11.582031 C 9.324219 10.863281 9.621094 10.214844 10.101562 9.742188 L 15.140625 4.765625 C 15.625 4.285156 16.304688 3.980469 17.054688 3.976562 Z M 17.082031 3.976562")
                .style("fill", "#ed4f2f");

            this.copyURIIcon.on("click", function () {
                copyToClipboard(node.iri);
                removeMenuIfVisible();
                actionsTip.hide();
            }).on('mouseover', function () {
                actionsTip.show("<div style='text-align: center;'><b>Copy to ClipBoard</b><br>" + node.iri + "</div>");
                $timeout.cancel(removeIconsTimer);
                $timeout.cancel(showNodeTipAndIconsTimer);
            }).on('mouseout', function () {
                actionsTip.hide();
                removeIconsTimer = $timeout(function () {
                    removeMenuIfVisible();
                }, 500);
            });

            this.closeIcon = d3.select('.menu-events').append("g")
                .attr("class", "close-icon")
                .attr("name", "remove")
                .attr("transform", function () {
                    return getPositionAndAngle(angle, node);
                });
            this.closeIcon.append("circle")
                .attr("cx", 14)
                .attr("cy", 14)
                .attr("r", 13)
                .style("fill", "#eee");
            this.closeIcon.append("path")
                .attr("d", "M14.94,14l5.87-5.87a.66.66,0,1,0-.94-.94L14,13.06,8.13,7.19a.66.66,0,0,0-.94.94L13.06,14,7.19,19.87a.66.66,0,1,0,.94.94L14,14.94l5.87,5.87a.66.66,0,1,0,.94-.94Z")
                .style("fill", "#ed4f2f");

            this.closeIcon.on("click", function () {
                hideNode(node);
            }).on('mouseover', function () {
                actionsTip.show(this.getAttribute("name"));
                $timeout.cancel(removeIconsTimer);
                $timeout.cancel(showNodeTipAndIconsTimer);
            }).on('mouseout', function () {
                actionsTip.hide();
                removeIconsTimer = $timeout(function () {
                    removeMenuIfVisible();
                }, 500);
            });

            this.animateMenu(node);
        };

        this.animateMenu = function (node) {
            var animationDuration = 100;
            var easeEffects = ["linear", "quad", "cubic", "sin", "exp", "circle", "elastic", "back", "bounce"]; // https://github.com/d3/d3-3.x-api-reference/blob/master/Transitions.md#easing
            var easeEffect = easeEffects[3];
            var delay = 0;
            var dellayAddition = 35;
            var angle = 20; // angle of the first icon 0 is at 12 o'clock

            if (this.expandIcon) {
                this.expandIcon
                    .transition()
                    .duration(animationDuration)
                    .style("opacity", 1)
                    .ease(easeEffect)
                    .attr("transform", function (d) {
                        return getPositionAndAngle(angle, node);
                    })
                    .delay(delay += dellayAddition);
            }

            if (this.collapseIcon) {
                this.collapseIcon
                    .transition()
                    .duration(animationDuration)
                    .style("opacity", 1)
                    .ease(easeEffect)
                    .attr("transform", function (d) {
                        return getPositionAndAngle(angle, node);
                    })
                    .delay(delay += dellayAddition);
            }

            this.copyURIIcon
                .transition()
                .duration(animationDuration)
                .style("opacity", 1)
                .ease(easeEffect)
                .attr("transform", function (d) {
                    angle += 30;
                    return getPositionAndAngle(angle, node);
                })
                .delay(delay += dellayAddition);

            this.focusIcon
                .transition()
                .duration(animationDuration)
                .style("opacity", 1)
                .ease(easeEffect)
                .attr("transform", function (d) {
                    angle += 30;
                    return getPositionAndAngle(angle, node);
                })
                .delay(delay += dellayAddition);


            this.closeIcon
                .transition()
                .duration(animationDuration)
                .style("opacity", 1)
                .ease(easeEffect)
                .attr("transform", function (d) {
                    angle += 30;
                    return getPositionAndAngle(angle, node);
                })
                .delay(delay += dellayAddition);

            this.expandedState = true;
        };
    }

    function Loader() {
        this.state = false;

        this.setLoadingState = function (state) {
            this.state = state;
        };

        this.getLoadingState = function () {
            return this.state;
        };

        this.init = function (node, parentNode) {
            d3.select(parentNode).append("circle")
                .attr("cx", function () {
                    return node.x;
                })
                .attr("cy", function () {
                    return node.y;
                })
                .attr("class", "loader-container")
                .attr("r", function () {
                    return node.size;
                })
                .style("fill", "fff")
                .style("opacity", "0.7");

            d3.select(parentNode).append("image")
                .attr("xlink:href", "js/angular/templates/loader/ot-loader.svg")
                .attr("x", function () {
                    return node.x - node.size + 5;
                })
                .attr("y", function () {
                    return node.y - node.size;
                })
                .attr("width", function () {
                    return node.size * 2;
                })
                .attr("height", function () {
                    return node.size * 2;
                })
                .attr("class", "node-loader");
        };
    }

    function showNodeInfo(d) {
        force.stop();
        // Assign value of node, which info panel has been opened
        $scope.openedNodeInfoPanel = d;
        $scope.showNodeInfo = true;
        $scope.showFilter = false;
        $scope.showPredicates = false;
        $scope.nodeLabels = d.labels;
        $scope.nodeTypes = d.types;
        $scope.rdfRank = d.rdfRank;
        $scope.nodeIri = d.iri;
        $scope.encodedIri = encodeURI(d.iri);
        $scope.showInfoPanel = true;

        $scope.rdfsLabel = d.labels[0].label;
        $scope.rdfsComment = d.comment;
        $scope.expanded = false;

        $scope.propertiesQueryObj.query = '';
        $scope.dataNodeKeysQuery = '';
        $http.get('rest/explore-graph/properties', {
            params: {
                iri: d.iri,
                config: $scope.configLoaded.id,
                languages: !$scope.shouldShowSettings() ? [] : $scope.saveSettings['languages'],
                includeInferred: $scope.saveSettings['includeInferred'],
                sameAsState: $scope.saveSettings['sameAsState']
            }
        }).then(function (response) {
            $scope.data = _.mapKeys(response.data, function (value, key) {
                return $scope.replaceIRIWithPrefix(key);
            });
            $scope.propertiesObj.items = [];

            _.forEach($scope.data, function (value, key) {
                $scope.propertiesObj.items.push({key: key, value: value});
            });
            $scope.nodeImage = undefined;

            $scope.propertiesNotFiltered = $scope.propertiesObj.items;

            var imageVal = _.find($scope.propertiesObj.items, function (o) {
                return o.key === 'image';
            });
            if (imageVal) {
                $scope.nodeImage = imageVal['value'][0].v;
            }
            $scope.propertiesObj.items = _.reject($scope.propertiesObj.items, function (o) {
                return o.key === 'image';
            });
            $scope.propertiesNotFiltered = $scope.propertiesObj.items;
        }, function (response) {
            toastr.warning(getError(response.data), "Error");
        });
    }

    $scope.toggleSidePanel = function () {
        $scope.pageslideExpanded = !$scope.pageslideExpanded;
    };

    $scope.closeInfoPanel = function () {
        $scope.pageslideExpanded = false;
        $scope.openedNodeInfoPanel = undefined;
        // o, angular, o, miracle
        $timeout(function () {
            $scope.showInfoPanel = false;
        });
    };

    // open predicates sidebar if they are more than one
    function openPredicates(d) {
        $scope.showNodeInfo = false;
        $scope.showPredicates = true;
        $scope.showFilter = false;

        if (d.predicates.length > 1) {
            $scope.predicates = _.map(d.predicates, function (p) {
                return getShortPredicate(p)
            });
            $scope.showInfoPanel = true;
        }
    }

    // get each predicate and check if there are more than one for same source and target
    function getPredicate(d, index) {
        if (d.predicates.length > 1) {
            return d.predicates.length + " predicates";
        }
        return getShortPredicate(d.predicates[0]);

    }

    function getShortPredicate(p) {
        var shortIRI = $scope.replaceIRIWithPrefix(p);
        if (shortIRI.length === p.length) {
            return p.split('/')[p.split('/').length - 1];
        } else {
            return shortIRI;
        }
    }

    // calculate predicate text length so we can have dynamic link lengths
    function getPredicateTextLength(link) {
        var span = $('<span></span>'),
            splitedLink = link.predicates[0].split('/'),
            predicateText = splitedLink[splitedLink.length - 1];
        span.addClass('predicate-text').text(predicateText);
        $('body').append(span);
        var textLength = span.width() + link.source.size * 2 + link.target.size * 2 + 50;
        span.remove();
        return textLength * 0.75;
    }

    $scope.splitPredicate = function (predicate) {
        return predicate.split('/')[predicate.split('/').length - 1];
    };

    $scope.getActiveRepository = function () {
        return $repositories.getActiveRepository();
    };

    $scope.isLoadingLocation = function () {
        return $repositories.isLoadingLocation();
    };

    $scope.hasActiveLocation = function () {
        return $repositories.hasActiveLocation();
    };

    $scope.rotate = function (isLeft) {
        removeMenuIfVisible();

        // compute common rotation math such as the angle, its sine and cosine and the pivot point
        var theta = (isLeft ? 1 : -1) * 2 * Math.PI / 180; // + rotates left, - rotates right
        var cos = Math.cos(theta);
        var sin = Math.sin(theta);
        var pivotX = width / 2; // i.e. centre of viewport
        var pivotY = height / 2;

        // rotates each node around the pivot
        d3.selectAll(".node-wrapper")
            .each(function (d) {
                d.x = pivotX + (cos * (d.x - pivotX) + sin * (d.y - pivotY));
                d.y = pivotY + (-sin * (d.x - pivotX) + cos * (d.y - pivotY));
                if (d.fixed) {
                    // Fixed nodes need their px and py updated too
                    d.px = d.x;
                    d.py = d.y;
                }
            });

        force.resume();
    };

    $scope.openUri = function (uri, noHistory) {
        if (!noHistory) {
            var searchParams = {};
            if ($scope.configLoaded.id !== $scope.defaultGraphConfig.id) {
                searchParams.config = $scope.configLoaded.id;
            }
            searchParams.uri = uri;
            $scope.pushHistory(searchParams, {uri: uri, config: $scope.configLoaded});
        }
        $scope.$broadcast("onRootNodeChange", uri);
    };

    function saveGraphHttp(graph) {
        if ($scope.configLoaded) {
            graph.config = $scope.configLoaded.id;
        }
        SavedGraphsService.addNewSavedGraph(graph)
            .success(function (data, status, headers) {
                $scope.lastSavedGraphName = graph.name;
                $scope.lastSavedGraphId = headers()['x-saved-graph-id'];
                $scope.refreshSavedGraphs();
                toastr.success('Saved graph ' + graph.name + ' was saved.');
            })
            .error(function (data, status) {
                if (status === 422) {
                    $scope.saveGraphModal('new', graph, true);
                } else {
                    var msg = getError(data);
                    toastr.error(msg, 'Error! Cannot create saved graph');
                }
            });
    }

    $scope.saveOrUpdateGraph = function () {
        var data = JSON.stringify(graph.copyState());
        var graphToSave = {id: $scope.lastSavedGraphId, name: $scope.lastSavedGraphName, data: data};

        if (graphToSave.id) {
            $scope.saveGraphModal('update', graphToSave);
        } else {
            $scope.saveGraphModal('new', graphToSave);
        }
    };

    $scope.renameSavedGraph = function (graphToRename) {
        // By not sending the 'data' part of a graph we only change the name
        $scope.saveGraphModal('rename', {id: graphToRename.id, name: graphToRename.name, config: graphToRename.config});
    };

    $scope.saveGraphModal = function (mode, graphToSave, graphExists) {
        var modalInstance = $modal.open({
            templateUrl: 'js/angular/graphexplore/templates/modal/save-graph.html',
            controller: 'SaveGraphModalCtrl',
            resolve: {
                data: function () {
                    return {
                        mode: mode,
                        graph: graphToSave,
                        graphExists: graphExists
                    }
                }
            }
        });

        modalInstance.result.then(function (data) {
            if (data.restart) {
                $scope.saveGraphModal(data.mode, data.graph, false);
                return;
            }
            switch (data.mode) {
                case 'new':
                    saveGraphHttp(data.graph);
                    break;
                case 'update':
                    editSavedGraphHttp(data.graph);
                    break;
                case 'rename':
                    editSavedGraphHttp(data.graph);
                    break;
            }
        }, function () {
        });
    };

    $scope.refreshSavedGraphs = function () {
        SavedGraphsService.getSavedGraphs()
            .success(function (data) {
                $scope.savedGraphs = data;
            })
            .error(function (data) {
                var msg = getError(data);
                toastr.error(msg, 'Error! Could not get saved graphs');
            });
    };


    $scope.loadSavedGraph = function (graphToLoad, noHistory) {
        if (graphToLoad.owner) {
            // Own saved graph
            $scope.lastSavedGraphName = graphToLoad.name;
            $scope.lastSavedGraphId = graphToLoad.id;
            $scope.configLoaded = $scope.findConfigById(graphToLoad.config);
        } else {
            // Someone else's saved graph
            $scope.lastSavedGraphName = null;
            $scope.lastSavedGraphId = null;
        }

        if (!$scope.configLoaded) {
            // Fallback to default config, either because config is gone or because graph isn't owned
            $scope.configLoaded = $scope.defaultGraphConfig;
        }

        graph.restoreState(JSON.parse(graphToLoad.data));
        if (!noHistory) {
            $scope.pushHistory({saved: graphToLoad.id}, {savedGraph: graphToLoad});
        }
    };

    $scope.copyToClipboardSavedGraph = function (savedGraph) {
        var url = [location.protocol, '//', location.host, location.pathname, '?saved=', savedGraph.id].join('');
        copyToClipboard(url);
    };

    function deleteSavedGraphHttp(savedGraph) {
        SavedGraphsService.deleteSavedGraph(savedGraph)
            .success(function () {
                $scope.refreshSavedGraphs();
                toastr.success('Saved graph ' + savedGraph.name + ' was deleted.');
            })
            .error(function (data) {
                var msg = getError(data);
                toastr.error(msg, 'Error! Cannot delete saved graph');
            });
    }

    $scope.deleteSavedGraph = function (savedGraph) {
        ModalService.openSimpleModal({
            title: 'Confirm',
            message: 'Are you sure you want to delete the saved graph ' + '\'' + savedGraph.name + '\'?',
            warning: true
        }).result
            .then(function () {
                deleteSavedGraphHttp(savedGraph);
            });
    };

    var editSavedGraphHttp = function (savedGraph) {
        SavedGraphsService.editSavedGraph(savedGraph)
            .success(function () {
                $scope.lastSavedGraphName = savedGraph.name;
                $scope.refreshSavedGraphs();
                toastr.success('Saved graph ' + savedGraph.name + ' was edited.');
            })
            .error(function (data) {
                var msg = getError(data);
                toastr.error(msg, 'Error! Cannot edit saved graph');
            });
    };

    $scope.openIRI = function (link, event) {
        if (event.shiftKey) {
            $scope.$broadcast("onRootNodeChange", link);
        } else {
            window.open(link, '_blank');
        }
        return false;
    };

    $scope.togglePinAllNodes = function () {
        removeMenuIfVisible();

        var value = $scope.numberOfPinnedNodes > 0 ? false : true;

        $scope.numberOfPinnedNodes = 0;
        d3.selectAll('.node').each(function (d) {
            d.fixed = value;
            if (value) {
                $scope.numberOfPinnedNodes++;
            }
        });

        force.resume();
    };

    // event for capturing left and right arrows used for rotation
    $('body').on("keydown", function (event) {
        if (event.target.nodeName === 'input' || !$scope.nodeSelected) {
            // don't do anything when the target is an input field or no node is selected
        } else if (event.keyCode === 37) {
            // left arrow rotates left
            $scope.rotate(true);
        } else if (event.keyCode === 39) {
            // right arrow rotates right
            $scope.rotate(false);
        }
    });
}

SaveGraphModalCtrl.$inject = ['$scope', '$modalInstance', 'data'];

function SaveGraphModalCtrl($scope, $modalInstance, data) {
    $scope.mode = data.mode;
    $scope.graph = angular.copy(data.graph);
    $scope.graphExists = data.graphExists;

    switch ($scope.mode) {
        case 'new':
            $scope.title = 'Create new saved graph';
            $scope.okButtonText = 'Create';
            break;
        case 'update':
            $scope.title = 'Update saved graph';
            $scope.okButtonText = 'Save';
            break;
        case 'rename':
            $scope.title = 'Rename saved graph';
            $scope.okButtonText = 'Save';
    }

    $scope.ok = function () {
        if ($scope.form.$valid) {
            $modalInstance.close({graph: $scope.graph, mode: $scope.mode});
        }
    };

    $scope.saveNew = function () {
        $scope.graph.name = $scope.graph.name + ' (new)';
        $modalInstance.close({graph: $scope.graph, mode: 'new', restart: true});
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}
