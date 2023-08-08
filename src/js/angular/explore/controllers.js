import 'angular/utils/file-types';
import 'angular/rest/explore.rest.service';
import {saveAs} from 'lib/FileSaver-patch';
import {decodeHTML} from "../../../app";
import {ResourceInfo} from "../models/resource/resource-info";
import {ContextType, ContextTypes} from "../models/resource/context-type";
import {RoleType} from "../models/resource/role-type";
import {RenderingMode} from "../models/ontotext-yasgui/rendering-mode";
import {DISABLE_YASQE_BUTTONS_CONFIGURATION} from "../core/directives/yasgui-component/yasgui-component-directive.util";

const modules = [
    'ngCookies',
    'ngRoute',
    'ui.bootstrap',
    'toastr',
    'graphdb.framework.core',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.explore.services',
    'graphdb.workbench.utils.filetypes',
    'graphdb.framework.rest.explore.rest.service'
];

angular
    .module('graphdb.framework.explore.controllers', modules)
    .controller('FindResourceCtrl', FindResourceCtrl)
    .controller('ExploreCtrl', ExploreCtrl)
    .controller('EditResourceCtrl', EditResourceCtrl)
    .controller('ViewTrigCtrl', ViewTrigCtrl);

ExploreCtrl.$inject = [
    '$scope',
    '$location',
    'toastr',
    '$routeParams',
    '$repositories',
    'ClassInstanceDetailsService',
    'ModalService',
    'RDF4JRepositoriesRestService',
    'FileTypes',
    '$jwtAuth',
    '$translate',
    '$languageService',
    '$q',
    'ExploreRestService'];

function ExploreCtrl(
    $scope,
    $location,
    toastr,
    $routeParams,
    $repositories,
    ClassInstanceDetailsService,
    ModalService,
    RDF4JRepositoriesRestService,
    FileTypes,
    $jwtAuth,
    $translate,
    $languageService,
    $q,
    ExploreRestService) {

    $scope.ContextTypes = ContextTypes;
    $scope.contextTypes = ContextType.getAllType();
    $scope.currentContextType = ContextTypes.EXPLICIT;
    $scope.roles = [RoleType.SUBJECT, RoleType.PREDICATE, RoleType.OBJECT, RoleType.CONTEXT, RoleType.ALL];

    $scope.resourceInfo = undefined;

    // Defaults
    $scope.loading = false;
    $scope.formats = FileTypes;

    // TODO remove it
    let principalRequestPromise;

    // =========================
    // Public functions
    // =========================
    window.editor = {};
    window.editor.getQueryType = function () {
        return 'RESOURCE';
    };

    $scope.toggleSameAs = () => {
        $scope.resourceInfo.sameAs = !$scope.resourceInfo.sameAs;
        $scope.exploreResource();
    };

    $scope.getActiveRepository = () => {
        return $repositories.getActiveRepository();
    };

    $scope.isTripleResource = () => {
        return !!$scope.resourceInfo.triple;
    };

    // TODO move this to core
    $scope.encodeURIComponent = (param) => {
        return encodeURIComponent(param);
    };

    $scope.getRdfStarLocalNames = (triple) => {
        let localNames = triple.slice();
        const trimmed = triple.replace(/[<>]+/g, '');
        trimmed.split(' ').forEach((uri) => {
            localNames = localNames.replace(uri, ClassInstanceDetailsService.getLocalName(uri));
        });
        return localNames;
    };

    $scope.getLocalName = (uri) => {
        return ClassInstanceDetailsService.getLocalName(uri);
    };

    const initResourceReference = () => {
        if ($routeParams.prefix && $routeParams.localName && $scope.usedPrefixes[$routeParams.prefix]) {
            // /resource/PREFIX/LOCAL -> URI = expanded PREFIX + LOCAL
            $scope.resourceInfo.uri = $scope.usedPrefixes[$routeParams.prefix] + $routeParams.localName;
        } else if ($location.search().uri) {
            // uri parameter -> URI
            $scope.resourceInfo.uri = $location.search().uri + ($location.hash() ? '#' + $location.hash() : '');
        } else if ($location.search().triple) {
            // uri parameter -> URI
            $scope.resourceInfo.triple = $location.search().triple + ($location.hash() ? '#' + $location.hash() : '');
        } else {
            // absolute URI -> URI
            $scope.resourceInfo.uri = $location.absUrl();
        }
        // remove angle brackets which were allowed when filling out the search input field
        // but are forbidden when passing the uri as a query parameter
        $scope.resourceInfo.uri = $scope.resourceInfo.uri && $scope.resourceInfo.uri.replace(/<|>/g, "");
    };

    $scope.loadResource = () => {
        // Get resource details
        ExploreRestService.getResourceDetails($scope.resourceInfo.uri, $scope.resourceInfo.triple, $scope.resourceInfo.context)
            .success((data) => {
                $scope.resourceInfo.details = data;
                $scope.resourceInfo.context = $scope.resourceInfo.details.context;
                if ($scope.resourceInfo.uri !== 'object') {
                    $scope.resourceInfo.details.encodeURI = encodeURIComponent($scope.resourceInfo.details.uri);
                }
            })
            .error((data) => toastr.error($translate.instant('explore.error.resource.details', {data: getError(data)})));

        $scope.exploreResource();
    };

    $scope.isContextAvailable = () => {
        return $scope.resourceInfo.context !== null && $scope.resourceInfo.context === "http://rdf4j.org/schema/rdf4j#SHACLShapeGraph";
    };

    $scope.goToGraphsViz = () => {
        $location.path('graphs-visualizations').search('uri', $scope.resourceInfo.uri);
    };

    // Get resource table
    $scope.exploreResource = () => {
        toggleOntoLoader(true);
        if ($routeParams.context != null) {
            $scope.resourceInfo.context = $routeParams.context;
        }
        // Remember the role in the URL so the URL is stable and leads back to the same view
        $location.search('role', $scope.resourceInfo.role);
        // Changing the URL parameters adds a history entry in the browser history, and this causes incorrect behavior of the browser's back button functionality.
        // To resolve this issue, we replace the current URL without adding a new history entry.
        $location.replace();
        // wait for principal request if it has not finished and then fetch graph
        Promise.resolve(principalRequestPromise)
            .then(() => getGraph());
    };

    $scope.downloadExport = (format) => {
        ExploreRestService.getGraph($scope.resourceInfo, format.type)
            .then((data) => {
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
            })
            .catch((error) => {
                toastr.error(getError(error), $translate.instant('common.error'));
            })
            .finally(() => {
                toggleOntoLoader(false);
            });
    };

    $scope.changeRole = (role) => {
        $scope.resourceInfo.role = role;
        if ($scope.resourceInfo.role === RoleType.CONTEXT) {
            $scope.resourceInfo.contextType = ContextTypes.EXPLICIT;
        }
        $scope.exploreResource();
    };

    $scope.changeInference = (contextTypeId) => {
        $scope.resourceInfo.contextType = ContextType.getContextType(contextTypeId);
        $scope.exploreResource();
    };

    $scope.copyToClipboardResult = (uri) => {
        ModalService.openCopyToClipboardModal(uri);
    };

    // =========================
    // Private functions
    // =========================
    const initComponent = () => {
        Promise.all([$jwtAuth.getPrincipal(), $repositories.getPrefixes($repositories.getActiveRepository())])
            .then(([principal, usedPrefixes]) => {
                init();
                setInferAndSameAs(principal);
                $scope.usedPrefixes = usedPrefixes;
                $scope.loadResource();
            })
            .catch((error) => {
                toastr.error($translate.instant('get.namespaces.error.msg', {error: getError(error)}));
            });
    };

    const init = () => {
        if ($scope.resourceInfo) {
            return;
        }
        $scope.resourceInfo = new ResourceInfo();
        initResourceReference($scope.resourceInfo);

        if ($routeParams.context != null) {
            $scope.resourceInfo.context = $routeParams.context;
        }

        $scope.resourceInfo.role = $location.search().role ? $location.search().role : RoleType.SUBJECT;
    };

    const toggleOntoLoader = (showLoader) => {
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

    const updateYasguiConfiguration = (additionalConfiguration = {}) => {
        const config = {};
        angular.extend(config, $scope.yasguiConfig || getDefaultYasguiConfiguration(), additionalConfiguration);
        $scope.yasguiConfig = config;
    };

    const getDefaultYasguiConfiguration = () => {
        return {
            showEditorTabs: false,
            showToolbar: false,
            showResultTabs: false,
            showResultInfo: false,
            downloadAsOn: false,
            showQueryButton: false,
            componentId: 'resource-view-component',
            prefixes: $scope.usedPrefixes,
            maxPersistentResponseSize: 0,
            render: RenderingMode.YASR,
            showYasqeActionButtons: false,
            yasqeActionButtons: DISABLE_YASQE_BUTTONS_CONFIGURATION
        };
    };

    const getGraph = () => {
        ExploreRestService.getGraph($scope.resourceInfo)
            .then((data) => {
                updateYasguiConfiguration({sparqlResponse: data});
            })
            .catch((error) => {
                toastr.error($translate.instant('explore.error.resource', {data: getError(error)}));
            })
            .finally(() => {
                toggleOntoLoader(false);
            });
    };

    const setInferAndSameAs = (principal) => {
        // Get the predefined settings for sameAs and inference per user
        // TODO why inference depends on context?
        $scope.resourceInfo.contextType = principal.appSettings['DEFAULT_INFERENCE'] && !$scope.resourceInfo.role === RoleType.CONTEXT ? ContextTypes.ALL : ContextTypes.EXPLICIT;
        $scope.resourceInfo.sameAs = principal.appSettings['DEFAULT_INFERENCE'] && principal.appSettings['DEFAULT_SAMEAS'];
    };

    const removeAllListeners = () => {
        subscriptions.forEach((subscription) => subscription());
    };

    // =========================
    // Event handler functions
    // =========================

    $scope.$on('$destroy', removeAllListeners);
    const subscriptions = [];

    // Wait until the active repository object is set, otherwise "canWriteActiveRepo()" may return a wrong result and the "ontotext-yasgui"
    // readOnly configuration may be incorrect.
    subscriptions.push($scope.$watch(function () {
        return $scope.getActiveRepositoryObject();
    }, function (activeRepo) {
        if (activeRepo) {
            initComponent();
        }
    }));
}

FindResourceCtrl.$inject = ['$scope', '$http', '$location', '$repositories', '$q', '$timeout', 'toastr', 'AutocompleteRestService', 'ClassInstanceDetailsService', '$routeParams', 'RDF4JRepositoriesRestService', '$translate'];

function FindResourceCtrl($scope, $http, $location, $repositories, $q, $timeout, toastr, AutocompleteRestService, ClassInstanceDetailsService, $routeParams, RDF4JRepositoriesRestService, $translate) {
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
                    const warningMsg = decodeHTML($translate.instant('explore.autocomplete.warning.msg'));
                    toastr.warning('', `<div class="autocomplete-toast"><a href="autocomplete">${warningMsg}</a></div>`,
                        {allowHtml: true});
                }
                $scope.autocompleteEnabled = response;
            })
            .error(function () {
                toastr.error($translate.instant('explore.error.autocomplete'));
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
            toastr.error(msg, $translate.instant('common.error'));
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
                toastr.error($translate.instant('explore.error.invalid.input'));
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

EditResourceCtrl.$inject = ['$scope', '$http', '$location', 'toastr', '$repositories', '$uibModal', '$timeout', 'ClassInstanceDetailsService', 'StatementsService', 'RDF4JRepositoriesRestService', '$translate'];

function EditResourceCtrl($scope, $http, $location, toastr, $repositories, $uibModal, $timeout, ClassInstanceDetailsService, StatementsService, RDF4JRepositoriesRestService, $translate) {
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
            toastr.error(msg, $translate.instant('common.error'));
            $scope.loader = false;
        });

        ClassInstanceDetailsService.getDetails($scope.uriParam)
            .success(function (data) {
                $scope.details = data;
                $scope.details.encodeURI = encodeURIComponent($scope.details.uri);
            }).error(function (data) {
            toastr.error($translate.instant('explore.error.resource.details', {data: getError(data)}));
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
            $scope.statements.push(_.cloneDeep($scope.newRow));
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
        return $translate.instant('explore.validation');
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
        $uibModal.open({
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
            toastr.success($translate.instant('explore.resource.saved'));
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

ViewTrigCtrl.$inject = ['$scope', '$uibModalInstance', 'data'];

function ViewTrigCtrl($scope, $uibModalInstance, data) {
    $scope.trig = data;

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}
