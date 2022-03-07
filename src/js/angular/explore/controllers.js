import 'angular/utils/file-types';
import YASR from 'lib/yasr.bundled';
import {saveAs} from 'lib/FileSaver-patch';

const modules = [
    'ngCookies',
    'ngRoute',
    'ui.bootstrap',
    'toastr',
    'graphdb.framework.core',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.explore.services',
    'graphdb.workbench.utils.filetypes'
];

angular
    .module('graphdb.framework.explore.controllers', modules)
    .controller('FindResourceCtrl', FindResourceCtrl)
    .controller('ExploreCtrl', ExploreCtrl)
    .controller('EditResourceCtrl', EditResourceCtrl)
    .controller('ViewTrigCtrl', ViewTrigCtrl);

ExploreCtrl.$inject = ['$scope', '$http', '$location', 'toastr', '$routeParams', '$repositories', 'ClassInstanceDetailsService', 'ModalService', 'RDF4JRepositoriesRestService', 'FileTypes', '$jwtAuth'];

function ExploreCtrl($scope, $http, $location, toastr, $routeParams, $repositories, ClassInstanceDetailsService, ModalService, RDF4JRepositoriesRestService, FileTypes, $jwtAuth) {

    // We need to get sameAs and inference for the current user
    const principal = $jwtAuth.getPrincipal();
    $scope.loading = false;

    $scope.getActiveRepository = function () {
        return $repositories.getActiveRepository();
    };

    $scope.isTripleResource = function () {
        return !!$scope.tripleParam;
    };

    // TODO move this to core
    $scope.encodeURIComponent = function (param) {
        return encodeURIComponent(param);
    };

    $scope.getRdfStarLocalNames = function(triple) {
        let localNames = triple.slice();
        const trimmed =  triple.replace(/[<>]+/g, '');
        trimmed.split(' ').forEach(uri => {
            localNames = localNames.replace(uri, ClassInstanceDetailsService.getLocalName(uri));
        });
        return localNames;
    };

    // Defaults
    $scope.role = $location.search().role ? $location.search().role : 'subject';
    // Fixed inference when we're showing the context tab and a named graph
    $scope.inferenceNamed = 'explicit';
    $scope.inferences = [
        {id: 'all', title: 'Explicit and Implicit'},
        {id: 'explicit', title: 'Explicit only'},
        {id: 'implicit', title: 'Implicit only'}
    ];
    $scope.context = '';

    $scope.getLocalName = function (uri) {
        return ClassInstanceDetailsService.getLocalName(uri);
    };

    $scope.blanks = true;

    // Get the predefined settings for sameAs and inference per user
    $scope.inference = principal.appSettings['DEFAULT_INFERENCE'] ? 'all' : 'explicit';
    $scope.sameAs = principal.appSettings['DEFAULT_INFERENCE'] && principal.appSettings['DEFAULT_SAMEAS'];

    $scope.formats = FileTypes;

    let yasr;

    window.editor = {};
    window.editor.getQueryType = function () {
        return 'RESOURCE';
    };

    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function () {
        if ($scope.getActiveRepository()) {
            if ($scope.usedPrefixes) {
                $scope.loadResource();
            } else {
                RDF4JRepositoriesRestService.getNamespaces($scope.getActiveRepository())
                    .success(function (data) {
                        $scope.usedPrefixes = {};
                        data.results.bindings.forEach(function (e) {
                            $scope.usedPrefixes[e.prefix.value] = e.namespace.value;
                        });
                        yasr = YASR(document.getElementById('yasr'), { // eslint-disable-line new-cap
                            //this way, the URLs in the results are prettified using the defined prefixes
                            getUsedPrefixes: $scope.usedPrefixes,
                            persistency: false,
                            hideHeader: true
                        });
                        $scope.loadResource();
                    }).error(function (data) {
                        toastr.error('Cannot get namespaces for repository. View will not work properly; ' + getError(data));
                    });
            }
        }
    });

    $scope.loadResource = function () {
        if ($routeParams.prefix && $routeParams.localName && $scope.usedPrefixes[$routeParams.prefix]) {
            // /resource/PREFIX/LOCAL -> URI = expanded PREFIX + LOCAL
            $scope.uriParam = $scope.usedPrefixes[$routeParams.prefix] + $routeParams.localName;
        } else if ($location.search().uri) {
            // uri parameter -> URI
            $scope.uriParam = $location.search().uri + ($location.hash() ? '#' + $location.hash() : '');
        } else if ($location.search().triple) {
            // uri parameter -> URI
            $scope.tripleParam = $location.search().triple + ($location.hash() ? '#' + $location.hash() : '');
        } else {
            // absolute URI -> URI
            $scope.uriParam = $location.absUrl();
        }
        if ($routeParams.context != null) {
            $scope.context = $routeParams.context;
        }
        // remove angle brackets which were allowed when filling out the search input field
        // but are forbidden when passing the uri as a query parameter
        $scope.uriParam = $scope.uriParam && $scope.uriParam.replace(/<|>/g, "");

        // Get resource details
        $http({
            url: 'rest/explore/details',
            method: 'GET',
            params: {
                uri: $scope.uriParam,
                triple: $scope.tripleParam,
                context: $scope.context
            },
            headers: {
                'Accept': 'application/json'
            }
        }).success(function (data) {
            $scope.details = data;
            $scope.context = $scope.details.context;
            if ($scope.details.uri !== 'object') {
                $scope.details.encodeURI = encodeURIComponent($scope.details.uri);
            }
        }).error(function (data) {
            toastr.error('Cannot get resource details; ' + getError(data));
        });

        $scope.exploreResource();
    };

    $scope.isContextAvailable = function () {
        return $scope.context !== null && $scope.context === "http://rdf4j.org/schema/rdf4j#SHACLShapeGraph";
    };

    $scope.goToGraphsViz = function () {
        $location.path('graphs-visualizations').search('uri', $scope.uriParam);
    };

    const toggleOntoLoader = function (showLoader) {
        const yasrInnerContainer = angular.element(document.getElementById('yasr-inner'));
        const resultsLoader = angular.element(document.getElementById('results-loader'));
        const opacityHideClass = 'opacity-hide';
        /* Angular b**it. For some reason the loader behaved strangely with ng-show not always showing */
        if (showLoader) {
            $scope.loading = true;
            yasrInnerContainer.addClass(opacityHideClass);
            resultsLoader.removeClass(opacityHideClass);
        } else {
            $scope.loading = false;
            yasrInnerContainer.removeClass(opacityHideClass);
            resultsLoader.addClass(opacityHideClass);
        }
    };

    // Get resource table
    $scope.exploreResource = function () {
        toggleOntoLoader(true);
        if ($routeParams.context != null) {
            $scope.context = $routeParams.context;
        }
        const headers = {Accept: 'application/x-graphdb-table-results+json'};
        $.ajax({
            method: 'GET',
            url: 'rest/explore/graph',
            data: {
                uri: $scope.uriParam,
                triple: $scope.tripleParam,
                inference: $scope.inference,
                role: $scope.role,
                bnodes: $scope.blanks,
                sameAs: $scope.sameAs,
                context: $scope.context
            },
            headers: headers
        }).done(function (data, textStatus, jqXhr) {
            toggleOntoLoader(false);
            // Pass the xhr argument first as the yasr expects it that way. See https://ontotext.atlassian.net/browse/GDB-3939
            yasr.setResponse(jqXhr, textStatus);
        }).fail(function (data) {
            toastr.error('Could not get resource; ' + getError(data));
            toggleOntoLoader(false);
        });
    };

    $scope.downloadExport = function (format) {
        let param;
        let encodedURI;
        if ($scope.uriParam) {
            param = 'uri=';
            encodedURI = encodeURIComponent($scope.uriParam);
        } else {
            param = 'triple=';
            encodedURI = encodeURIComponent($scope.tripleParam);
        }

        $http({
            method: 'GET',
            url: 'rest/explore/graph?' + param + encodedURI +
                "&role=" + $scope.role +
                "&inference=" + $scope.inference +
                "&bnodes=" + $scope.blanks +
                "&sameAs=" + $scope.sameAs +
                ($scope.context ? "&context=" + encodeURIComponent($scope.context) : ""),
            headers: {
                'Accept': format.type
            }
        }).success(function (response) {
            let data = response;
            if (format.type.indexOf('json') > -1) {
                data = JSON.stringify(data);
            }
            // TODO: Use bowser library to get the browser type
            const ua = navigator.userAgent.toLowerCase();
            if (ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1) {
                window.open('data:attachment/csv;filename="statements.' + format.extension + '",' + encodeURIComponent(data), 'statements.' + format.extension);
            } else {
                const file = new Blob([data], {type: format.type});
                saveAs(file, 'statements' + format.extension);
            }
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Error');
        });
    };

    $scope.changeRole = function (roleVar) {
        $scope.role = roleVar;
        $scope.exploreResource();
    };

    $scope.changeInference = function (inference) {
        $scope.inference = inference;
        $scope.exploreResource();
    };

    $scope.copyToClipboardResult = function (uri) {
        ModalService.openCopyToClipboardModal(uri);
    };
}

FindResourceCtrl.$inject = ['$scope', '$http', '$location', '$repositories', '$q', '$timeout', 'toastr', 'AutocompleteRestService', 'ClassInstanceDetailsService', '$routeParams', 'RDF4JRepositoriesRestService'];

function FindResourceCtrl($scope, $http, $location, $repositories, $q, $timeout, toastr, AutocompleteRestService, ClassInstanceDetailsService, $routeParams, RDF4JRepositoriesRestService) {
    $scope.submit = submit;
    $scope.getAutocompleteSuggestions = getAutocompleteSuggestions;
    $scope.inputChangedFn = inputChangedFn;
    $scope.selectedUriCallback = selectedUriCallback;

    $scope.selectedUri = {name: ""};

    $scope.autocompleteEnabled = false;

    if (angular.isDefined($routeParams.search)) {
        $timeout(function () {
            $('#resources_finder_value').val($routeParams.search);
            $('.search-button').click();
        }, 500);
    }

    function checkAutocompleteStatus() {
        AutocompleteRestService.checkAutocompleteStatus()
            .success(function (response) {
                if (!response) {
                    toastr.warning('', '<div class="autocomplete-toast"><a href="autocomplete">Autocomplete is OFF<br>Go to Setup -> Autocomplete</a></div>',
                        {allowHtml: true});
                }
                $scope.autocompleteEnabled = response;
            })
            .error(function () {
                toastr.error("Error attempting to check autocomplete capability!");
            });
    }

    function getAllNamespacesForActiveRepository() {
        RDF4JRepositoriesRestService.getNamespaces($repositories.getActiveRepository())
            .success(function (data) {
                $scope.namespaces = data.results.bindings.map(function (e) {
                    return {
                        prefix: e.prefix.value,
                        uri: e.namespace.value
                    };
                });
                $scope.loader = false;
            }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Error');
            $scope.loader = false;
        });
    }

    function validateRdfUri(value) {
        // has a pair of angle brackets and the closing one is the last char of the string
        const hasAngleBrackets = value.indexOf("<") >= 0 && value.lastIndexOf(">") === value.length - 1;

        // does not have a pair of angle bracket - if only one of the is available that is incorrect
        const noAngleBrackets = value.indexOf("<") === -1 && value.lastIndexOf(">") === -1;

        const validProtocol = /^<?[http|urn].*>?$/.test(value) && (hasAngleBrackets || noAngleBrackets);
        let validPath = false;
        if (validProtocol) {
            if (value.indexOf("http") >= 0) {
                const schemaSlashesIdx = value.indexOf('//');
                validPath = schemaSlashesIdx > 4
                    && value.substring(schemaSlashesIdx + 2).length > 0;
            } else if (value.indexOf("urn") >= 0) {
                validPath = value.substring(4).length > 0;
            }
        }
        return validProtocol && validPath;
    }

    let uri;

    function submit(uri) {
        function setFormInvalid(isDirty) {
            // does not work yet
            $timeout(function () {
                if ($scope.form) {
                    $scope.form.$dirty = isDirty;
                }
            });
        }

        if (!uri) {
            uri = document.getElementById("resources_finder_value").value;
        }
        if (uri && validateRdfUri(uri)) {
            setFormInvalid(false);
            $location
                .path('resource')
                .search('uri', uri);
        } else {
            setFormInvalid(true);
            if (uri) {
                toastr.error("Invalid input!");
            }
        }
    }

    if ($scope.getActiveRepository()) {
        checkAutocompleteStatus();
        getAllNamespacesForActiveRepository();
    }

    // use a global var to keep old uri in order to change it when a new one appears
    let expandedUri;

    function getAutocompleteSuggestions(str) {
        // expand prefix to uri only if the last character of the input is a colon and
        // there are no angle brackets because they are allowed only for absolute uris
        const ANGLE_BRACKETS_REGEX = /<|>/;
        if (!ANGLE_BRACKETS_REGEX.test(str) && str.slice(-1) === ':') {
            const newExpandedUri = ClassInstanceDetailsService.getNamespaceUriForPrefix($scope.namespaces, str.slice(0, -1));
            expandedUri = (newExpandedUri !== expandedUri) ? newExpandedUri : expandedUri;
            if (expandedUri) {
                $("#resources_finder_value").val(expandedUri);
            }
        }

        let promise;
        if ($scope.autocompleteEnabled) {
            // add semicolon after the expanded uri in order to filter only by local names for this uri
            const query = str.replace(expandedUri, expandedUri + ';');
            promise = AutocompleteRestService.getAutocompleteSuggestions(query);
        } else {
            // return empty promise
            promise = $q.when($scope.autocompleteEnabled);
        }
        return promise;
    }

    $scope.$on('repositoryIsSet', function () {
        checkAutocompleteStatus();
        getAllNamespacesForActiveRepository();
    });

    function inputChangedFn() {
        uri = document.getElementById("resources_finder_value").value;
        $scope.form.$dirty = !(uri && validateRdfUri(uri));
    }

    function selectedUriCallback(selected) {
        $scope.selectedUri = {name: selected.title};
        submit($scope.selectedUri.name);
    }
}

EditResourceCtrl.$inject = ['$scope', '$http', '$location', 'toastr', '$repositories', '$modal', '$timeout', 'ClassInstanceDetailsService', 'StatementsService', 'RDF4JRepositoriesRestService'];

function EditResourceCtrl($scope, $http, $location, toastr, $repositories, $modal, $timeout, ClassInstanceDetailsService, StatementsService, RDF4JRepositoriesRestService) {
    $scope.uriParam = $location.search().uri;
    $scope.newRow = {
        subject: $scope.uriParam,
        object: {
            type: 'uri',
            datatype: ''
        }
    };
    $scope.newResource = false;
    $scope.datatypeOptions = StatementsService.getDatatypeOptions();

    $scope.activeRepository = function () {
        return $repositories.getActiveRepository();
    };

    $scope.getClassInstancesDetails = getClassInstancesDetails;
    $scope.addStatement = addStatement;
    $scope.removeStatement = removeStatement;
    $scope.getLocalName = getLocalName;
    $scope.checkValid = checkValid;
    $scope.validEditRow = validEditRow;
    $scope.viewTrig = viewTrig;
    $scope.save = save;

    function getClassInstancesDetails() {
        RDF4JRepositoriesRestService.getNamespaces($scope.activeRepository())
            .success(function (data) {
                $scope.namespaces = data.results.bindings.map(function (e) {
                    return {
                        prefix: e.prefix.value,
                        uri: e.namespace.value
                    };
                });
                $scope.loader = false;
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error');
                $scope.loader = false;
            });

        ClassInstanceDetailsService.getDetails($scope.uriParam)
            .success(function (data) {
                $scope.details = data;
                $scope.details.encodeURI = encodeURIComponent($scope.details.uri);
            }).error(function (data) {
                toastr.error('Cannot get resource details; ' + getError(data));
            });

        ClassInstanceDetailsService.getGraph($scope.uriParam)
            .then(function (res) {
                const statements = StatementsService.buildStatements(res, $scope.uriParam);
                $scope.statements = statements;
                $scope.newResource = !statements.length;
            });
    }

    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function () {
        if ($scope.activeRepository()) {
            $scope.getClassInstancesDetails();
        }
    });

    $scope.validateUri = function (val) {
        let check = true;
        const text = val ? val : '';

        if (text.indexOf(':') === -1) {
            check = false;
        } else {
            const prefix = text.substring(0, text.indexOf(':'));
            const uriForPrefixNotAvailable = ClassInstanceDetailsService.getNamespaceUriForPrefix($scope.namespaces, prefix) === '';
            if (uriForPrefixNotAvailable) {
                // TODO: There's this reported useless escape character for this regex, but I'm not sure if and can I fix it.
                if (/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(text) === false) {
                    check = false;
                }

                const count = text.match(/\//g);

                if (count === undefined || count.length < 3) {
                    check = false;
                }
            } else {
                const restText = text.substring(text.indexOf(':') + 1).trim();
                if (restText.length < 1) {
                    check = false;
                }
            }
        }

        return check;
    };

    function addStatement() {
        $scope.newRowPredicate.$setSubmitted();
        $scope.newRowObject.$setSubmitted();
        $scope.newRowContext.$setSubmitted();
        if ($scope.newRowPredicate.$valid && $scope.newRowObject.$valid && $scope.newRowContext.$valid) {
            $scope.statements.push(angular.copy($scope.newRow));
            $scope.newRow = {
                subject: $scope.uriParam,
                object: {
                    type: 'uri',
                    datatype: ''
                }
            };
            $scope.newRowPredicate.$setPristine();
            $scope.newRowPredicate.$setUntouched();
            $scope.newRowObject.$setPristine();
            $scope.newRowObject.$setUntouched();
            $scope.newRowContext.$setPristine();
            $scope.newRowContext.$setUntouched();
        }
    }

    function checkValid(data) {
        if (!angular.isUndefined(data)) {
            return true;
        }
        return "Please enter a valid value.";
    }

    function validEditRow() {
        return $scope.rowform.$valid;
    }

    function removeStatement(idx) {
        $scope.statements.splice(idx, 1);
    }

    function getLocalName(uri) {
        return ClassInstanceDetailsService.getLocalName(uri);
    }

    function viewTrig() {
        $modal.open({
            templateUrl: 'js/angular/explore/templates/viewTrig.html',
            controller: 'ViewTrigCtrl',
            size: 'lg',
            resolve: {
                data: function () {
                    return StatementsService.transformToTrig($scope.statements);
                }
            }
        });
    }

    function save() {
        const method = $scope.newResource ? 'POST' : 'PUT';
        $http({
            method: method,
            url: 'rest/resource?uri=' + encodeURIComponent($scope.uriParam),
            headers: {
                'Content-Type': 'application/x-trig'
            },
            data: StatementsService.transformToTrig($scope.statements)
        }).success(function () {
            toastr.success("Resource saved.");
            const timer = $timeout(function () {
                $location.path('resource').search('uri', $scope.uriParam);
            }, 500);
            $scope.$on("$destroy", function () {
                $timeout.cancel(timer);
            });
        }).error(function (data) {
            toastr.error(getError(data));
        });
    }
}

ViewTrigCtrl.$inject = ['$scope', '$modalInstance', 'data'];

function ViewTrigCtrl($scope, $modalInstance, data) {
    $scope.trig = data;

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}
