import 'angular/utils/local-storage-adapter';
import {decodeHTML} from "../../../app";

angular
    .module('graphdb.framework.core.directives', [
        'graphdb.framework.core.services.repositories',
        'graphdb.framework.utils.localstorageadapter'
    ])
    .directive('ontoLoader', ontoLoader)
    .directive('ontoLoaderFancy', ontoLoaderFancy)
    .directive('ontoLoaderNew', ontoLoaderNew)
    .directive('coreErrors', coreErrors)
    .directive('eatClick', eatClick)
    .directive('multiRequired', multiRequired)
    .directive('searchResourceInput', searchResourceInput)
    .directive('keyboardShortcuts', keyboardShortcutsDirective)
    .directive('inactivePluginDirective', inactivePluginDirective)
    .directive('autoGrow', autoGrowDirective)
    .directive('captureHeight', captureHeightDirective);

ontoLoader.$inject = [];

function ontoLoader() {
    return {
        template: function (elem, attr) {
            return '<object width="' + attr.size + '" height="' + attr.size + '" data="js/angular/templates/loader/ot-loader.svg?v=[AIV]{version}[/AIV]">{{\'common.loading\' | translate}}</object>';
        }
    };
}

ontoLoaderFancy.$inject = [];

function ontoLoaderFancy() {
    return {
        template: function (elem, attr) {
            return '<object width="' + attr.size + '" height="' + attr.size + '" data="js/angular/templates/loader/ot-loader.svg?v=[AIV]{version}[/AIV]"></object>'
                + '<div>{{\'common.loading\' | translate}}<div>';
        }
    };
}

ontoLoaderNew.$inject = ['$timeout'];

function ontoLoaderNew($timeout) {
    const restartTimeout = function ($timeout, scope) {
        scope.timer = undefined;
        scope.currentMessage = scope.getMessage();
        const time = scope.timeout[scope.index % scope.timeout.length];
        if (time) {
            scope.timer = $timeout(function () {
                if (scope.index + 1 < scope.message.length || scope.message.length === 0) {
                    scope.index++;
                    restartTimeout($timeout, scope);
                }
            }, time * 1000);
        }
    };

    return {
        restrict: 'EA',
        scope: {
            size: '@',
            trigger: '@',
            messageAttr: '=*message',
            timeoutAttr: '=*timeout',
            ngShow: '=',
            ngHide: '='
        },
        link: function (scope) {
            scope.message = scope.messageAttr;
            scope.getMessage = function () {
                return scope.message[scope.index];
            };
            if (scope.message === undefined) {
                scope.message = [''];
            } else if (typeof scope.message === 'function') {
                scope.getMessage = scope.message;
                scope.message = []; // empty array = infinite number of messages
            } else if (typeof scope.message !== 'object') {
                scope.message = [scope.message];
            }

            scope.timeout = scope.timeoutAttr;
            if (scope.timeout === undefined) {
                scope.timeout = [0];
            } else if (typeof scope.timeout !== 'object') {
                scope.timeout = [scope.timeout];
            }

            scope.index = 0;
            restartTimeout($timeout, scope);

            const triggerFunction = function (show) {
                if (scope.timer) {
                    $timeout.cancel(scope.timer);
                }
                if (show) {
                    scope.index = 0;
                    restartTimeout($timeout, scope);
                }
            };

            scope.$watch('ngShow', function (value) {
                triggerFunction(value);
            });

            scope.$watch('ngHide', function (value) {
                triggerFunction(!value);
            });

            scope.$on('$destroy', function () {
                if (scope.timer) {
                    $timeout.cancel(scope.timer);
                }
            });
        },
        template: '<div class="ot-loader-new-content">'
        + '<img width="{{size}}" height="{{size}}" src="js/angular/templates/loader/ot-loader.svg?v=[AIV]{version}[/AIV]"/>'
        + '<div style="font-size: {{size/4}}px">{{currentMessage}}<div>'
        + '</div>'
    };
}

coreErrors.$inject = ['$timeout'];

function coreErrors($timeout) {
    return {
        restrict: 'EA',
        transclude: true,
        templateUrl: 'js/angular/core/templates/core-errors.html',
        link: function (scope, element, attrs) {
            // watch for changes in the active repository hide host element of this directive
            scope.$watch('getActiveRepository()', function (newValue) {
                if (newValue && !scope.isRestricted) {
                    element.hide();
                } else {
                    element.show();
                }
            });

            scope.setAttrs(attrs);

            let previousElement;

            scope.showRemoteLocations = false;

            scope.toggleShowRemoteLocations = () => {
                scope.showRemoteLocations = !scope.showRemoteLocations;
            };

            scope.getAccessibleRepositories = function () {
                let remoteLocationsFilter = (repo) => true;
                if (!scope.showRemoteLocations) {
                    remoteLocationsFilter = (repo) => repo.local;
                }
                if (scope.isRestricted) {
                    return scope.getWritableRepositories().filter(remoteLocationsFilter);
                } else {
                    return scope.getReadableRepositories().filter(remoteLocationsFilter);
                }
            };

            scope.showPopoverForRepo = function (event, repository) {
                scope.hidePopoverForRepo();
                scope.setPopoverRepo(repository);
                $timeout(function () {
                    const element = $(event.toElement).find('.popover-anchor')[0];
                    previousElement = element;
                    if (element && !scope.getActiveRepository()) {
                        element.dispatchEvent(new Event('show'));
                    }
                });
                event.stopPropagation();
            };

            scope.hidePopoverForRepo = function (event) {
                if (event) {
                    // Prevents hiding if we move the mouse over the popover
                    let el = event.relatedTarget;
                    while (el) {
                        if (el.className.indexOf('popover') === 0) {
                            return;
                        }
                        el = el.parentElement;
                    }
                }
                if (previousElement) {
                    $timeout(function () {
                        if (previousElement) { // might have been nulled by another timeout
                            previousElement.dispatchEvent(new Event('hide'));
                            previousElement = null;
                        }
                    });
                }
                if (event) {
                    event.stopPropagation();
                }
            };
        }
    };
}

eatClick.$inject = [];

function eatClick() {
    return function (scope, element) {
        $(element).click(function (event) {
            event.preventDefault();
            event.stopPropagation();
        });
    };
}

multiRequired.$inject = [];

function multiRequired() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {
            if (!scope.multiRequired) {
                scope.multiRequired = [];
            }

            const element = attrs.multiRequireElement;

            const setMultiValue = function (value) {

                if (element && element % 1 === 0) {
                    scope.multiRequired[element - 1] = value;
                }
            };
            const checkMultiValueError = function () {
                let filledData = false;
                let emptyData = false;
                for (let i = 0; i < scope.multiRequired.length; i++) {
                    if (scope.multiRequired[i]) {
                        filledData = true;
                    } else {
                        emptyData = true;
                    }
                }
                ngModel.$setValidity('multiRequire', !(filledData && emptyData));
            };

            ngModel.$parsers.unshift(function (value) {
                setMultiValue(value);
                checkMultiValueError();
                return value;
            });

            ngModel.$formatters.unshift(function (value) {
                setMultiValue(value);
                checkMultiValueError();
                return value;
            });

            //Check for error if other [multi-required] elements are updated
            $('[multi-required]').on('blur keyup change focusout', function () {
                checkMultiValueError();
            });
        }
    };
}

const SEARCH_DISPLAY_TYPE = {table: 'table', visual: 'visual'};

searchResourceInput.$inject = ['$location', 'toastr', 'ClassInstanceDetailsService', 'AutocompleteRestService', '$rootScope', '$q', '$sce', 'LocalStorageAdapter', 'LSKeys', '$repositories', '$translate', 'GuidesService', '$licenseService'];

function searchResourceInput($location, toastr, ClassInstanceDetailsService, AutocompleteRestService, $rootScope, $q, $sce, LocalStorageAdapter, LSKeys, $repositories, $translate, GuidesService, $licenseService) {
    return {
        restrict: 'EA',
        scope: {
            namespacespromise: '=',
            autocompletepromisestatus: '=',
            textButton: '@',
            visualButton: '@',
            textCallback: '&',
            visualCallback: '&',
            placeholder: '@',
            uriValidation: '@',
            preserveInput: '@',
            empty: '=',
            clear: '=?clear',
            openInNewTab: '@',
            preserveSearch: '@',
            radioButtons: '@',
            clearInputIcon: '@'
        },
        templateUrl: 'js/angular/core/templates/search-resource-input.html',
        link: function ($scope, element, attrs) {
            element.autoCompleteStatus = undefined;
            element.autoCompleteWarning = false;
            $scope.empty = false;
            $scope.clear = false;
            $scope.searchDisplayType = SEARCH_DISPLAY_TYPE;
            const MIN_CHAR_LEN = 0;
            const IS_SEARCH_PRESERVED = $scope.preserveSearch === 'true';
            const SEARCH_INPUT_FIELD = element.find('.view-res-input');
            $scope.textButtonLabel = $scope.textButton || 'query.editor.table.btn';
            $scope.visualButtonLabel = $scope.visualButton || 'query.editor.visual.btn';

            // use a global var to keep old uri in order to change it when a new one appears
            let expandedUri;
            let canceler;

            $scope.showClearInputIcon = false;
            $scope.searchType = LocalStorageAdapter.get(LSKeys.RDF_SEARCH_TYPE) || SEARCH_DISPLAY_TYPE.table;
            $scope.searchInput = "";

            $scope.changeSearchType = function (type) {
                $scope.searchType = type;
                LocalStorageAdapter.set(LSKeys.RDF_SEARCH_TYPE, $scope.searchType);
            };
            $scope.$on('addStartFixedNodeAutomatically', function (event, args) {
                if (!$scope.searchInput && args.startIRI) {
                    $scope.visualCallback({uri: args.startIRI, label: ''});
                    return;
                }
                $scope.checkIfValidAndSearchText();
            });

            $scope.clearInput = function () {
                $scope.searchInput = '';
                $scope.selectedElementIndex = -1;
                $scope.autoCompleteUriResults = [];
                $scope.showClearInputIcon = false;
                LocalStorageAdapter.remove(LSKeys.RDF_SEARCH_INPUT);
                LocalStorageAdapter.remove(LSKeys.RDF_SEARCH_EXPANDED_URI);
                LocalStorageAdapter.remove(LSKeys.RDF_RESOURCE_DESCRIPTION);
            };

            $scope.$watch('namespacespromise', function () {
                if (angular.isDefined($scope.namespacespromise) && $licenseService.isLicenseValid()) {
                    $scope.namespacespromise.success(function (data) {
                        element.namespaces = data.results.bindings.map(function (e) {
                            return {
                                prefix: e.prefix.value,
                                uri: e.namespace.value
                            };
                        });
                    }).error(function (data) {
                        const msg = getError(data);
                        toastr.error(msg, $translate.instant('error.getting.namespaces.for.repo'));
                    });
                }
            });

            $scope.$watch('autocompletepromisestatus', function () {
                if (!$repositories.isActiveRepoFedXType() && angular.isDefined($scope.autocompletepromisestatus)) {
                    $scope.autocompletepromisestatus.success(function (response) {
                        element.autoCompleteStatus = !!response;
                        if ($scope.searchInput !== '') {
                            $scope.onChange();
                        }
                    }).error(function () {
                        toastr.error($translate.instant('explore.error.autocomplete'));
                    });
                }
            });

            $scope.$watch('empty', function () {
                if (!IS_SEARCH_PRESERVED) {
                    $scope.searchInput = '';
                    $scope.empty = false;
                }
            });

            $scope.$watch('clear', function () {
                if ($scope.clear) {
                    $scope.clearInput();
                    $scope.clear = false;
                }
            });

            $rootScope.$on('$translateChangeSuccess', function () {
                if (attrs.$attr.placeholder) {
                    $scope.placeholder = attrs.$attr.placeholder;
                } else {
                    $scope.placeholder = `${$translate.instant('search.resources.msg')}...`;
                }
            });

            const defaultTextCallback = function (params) {
                const param = params.type || 'uri';
                if ($scope.openInNewTab === 'true') {
                    openInNewWindowTab(false, params);
                } else {
                    $location.path('resource').search(param, params.uri);
                }
            };

            const defaultVisualCallback = function (params) {
                const param = params.type || 'uri';
                if ($scope.openInNewTab === 'true') {
                    openInNewWindowTab(true, params);
                } else {
                    $location.path('graphs-visualizations').search(param, params.uri);
                }
            };

            const openInNewWindowTab = function (visual, params) {
                const view = visual ? 'graphs-visualizations' : 'resource';
                window.open(`${view}?uri=${encodeURIComponent(params.uri)}`);
            };

            if (angular.isUndefined(attrs.$attr.textCallback)) {
                $scope.textCallback = defaultTextCallback;
            }

            if (angular.isUndefined(attrs.$attr.visualCallback)) {
                $scope.visualCallback = defaultVisualCallback;
            }

            if (attrs.$attr.textButton && !$scope.textButton) {
                $scope.textCallback = $scope.visualCallback;
            } else if (attrs.$attr.visualButton && !$scope.visualButton) {
                $scope.visualCallback = $scope.textCallback;
            }

            if (attrs.$attr.placeholder) {
                $scope.placeholder = attrs.$attr.placeholder;
            } else {
                $scope.placeholder = `${$translate.instant('search.resources.msg')}...`;
            }

            if (angular.isDefined(attrs.$attr.uriValidation)) {
                $scope.uriValidation = attrs.$attr.uriValidation;
            } else {
                $scope.uriValidation = 'true';
            }

            if (angular.isDefined(attrs.$attr.preserveInput)) {
                $scope.preserveInput = attrs.$attr.preserveInput;
            }

            $scope.getResultItemHtml = function (resultItem) {
                return $sce.trustAsHtml(resultItem.description);
            };

            $scope.searchRdfResource = function (resource, callback) {
                if (resource.type === 'prefix') {
                    $scope.searchInput = expandPrefix(resource.value + ':');
                    SEARCH_INPUT_FIELD.focus();
                    $scope.onChange();
                } else {
                    let textResource;
                    if (angular.isUndefined(resource)) {
                        textResource = $scope.searchInput;
                    } else if (typeof resource === 'object') {
                        textResource = resource.value;
                    } else {
                        textResource = resource;
                    }

                    // Parse the description to determine the label
                    // TODO: we should rather introduce direct support for this in the autocomplete plugin
                    let label = '';
                    if (resource.description) {
                        const indexOfSuffixed = resource.description.indexOf('&lt;' + textResource + '&gt;');
                        if (indexOfSuffixed > 0) {
                            label = resource.description.substring(0, indexOfSuffixed).replace(/<\/?b>/g, "");
                        }
                    }

                    callback({uri: textResource, description: resource.description, label: label, type: resource.type});

                    if (IS_SEARCH_PRESERVED) {
                        $scope.selectedElementIndex = $scope.activeSearchElm;
                        LocalStorageAdapter.set(LSKeys.RDF_SEARCH_EXPANDED_URI, expandedUri);
                        LocalStorageAdapter.set(LSKeys.RDF_SEARCH_INPUT, $scope.searchInput);
                        LocalStorageAdapter.set(LSKeys.RDF_RESOURCE_DESCRIPTION, resource.description);
                    } else if ($scope.preserveInput === 'true') {
                        $scope.searchInput = textResource;
                        $scope.autoCompleteUriResults = [];
                    } else {
                        $scope.searchInput = "";
                        $scope.autoCompleteUriResults = [];
                    }
                }
            };

            $scope.searchRdfResourceByEvent = function (uri, event) {
                if ($scope.searchType === SEARCH_DISPLAY_TYPE.visual || event.ctrlKey || event.metaKey) {
                    $scope.searchRdfResource(uri, $scope.visualCallback);
                } else {
                    $scope.searchRdfResource(uri, $scope.textCallback);
                }
            };

            const checkIfValidAndSearch = function (callback) {
                const uri = $scope.searchInput;
                if (uri === '') {
                    toastr.error($translate.instant('fill.input.field.msg'));
                    return;
                }
                if ($scope.uriValidation !== 'false') {
                    if (element.autoCompleteStatus && $scope.autoCompleteUriResults && $scope.autoCompleteUriResults.length > 0) {
                        if ($scope.autoCompleteUriResults[$scope.activeSearchElm].type === 'prefix') {
                            $scope.searchInput = expandPrefix($scope.autoCompleteUriResults[$scope.activeSearchElm].value + ':');
                            $scope.autoCompleteUriResults = [];
                        } else {
                            $scope.searchRdfResource($scope.autoCompleteUriResults[$scope.activeSearchElm], callback);
                        }
                    } else {
                        if (validateRdfUri(uri)) {
                            $scope.searchRdfResource(uri, callback);
                        } else {
                            toastr.error($translate.instant('invalid.uri.msg'));
                        }
                    }
                } else {
                    $scope.searchRdfResource(uri, callback);
                }
            };

            $scope.checkIfValidAndSearchText = function () {
                checkIfValidAndSearch($scope.textCallback);
            };

            $scope.checkIfValidAndSearchVisual = function () {
                checkIfValidAndSearch($scope.visualCallback);
            };

            $scope.checkIfValidAndSearchEvent = function (event) {
                if ($scope.searchType === SEARCH_DISPLAY_TYPE.visual || event.ctrlKey || event.metaKey) {
                    checkIfValidAndSearch($scope.visualCallback);
                } else {
                    checkIfValidAndSearch($scope.textCallback);
                }
            };

            $scope.onChange = function () {
                $scope.showClearInputIcon = $scope.clearInputIcon;
                if (IS_SEARCH_PRESERVED) {
                    LocalStorageAdapter.set(LSKeys.RDF_SEARCH_INPUT, $scope.searchInput);
                }
                if ($scope.uriValidation !== 'false') {
                    $scope.searchInput = expandPrefix($scope.searchInput);
                    if (element.autoCompleteStatus) {
                        return checkUriAutocomplete($scope.searchInput);
                    }
                }
                return Promise.resolve();
            };

            $scope.onKeyDown = function (event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    if (GuidesService.isActive()) {
                        return;
                    }
                    if ($scope.uriValidation !== 'false') {
                        if (element.autoCompleteStatus) {
                            $scope.checkIfValidAndSearchEvent(event);
                        } else {
                            if (validateRdfUri(event.target.value)) {
                                $scope.searchRdfResourceByEvent(event.target.value, event);
                            } else {
                                toastr.error($translate.instant('invalid.uri.msg'));
                            }
                        }
                    } else {
                        $scope.searchRdfResourceByEvent(event.target.value, event);
                    }
                } else if ($scope.searchInput.length > MIN_CHAR_LEN && !element.autoCompleteWarning && !element.autoCompleteStatus) {
                    element.autoCompleteWarning = true;
                    const warningMsg = decodeHTML($translate.instant('explore.autocomplete.warning.msg'));
                    toastr.warning('', `<div class="autocomplete-toast"><a href="autocomplete">${warningMsg}</a></div>`,
                        {allowHtml: true});
                }

                if (!element.autoCompleteStatus || angular.isUndefined($scope.autoCompleteUriResults)) {
                    return;
                }
                if (event.keyCode === 40 && $scope.activeSearchElm < $scope.autoCompleteUriResults.length - 1) {
                    $scope.activeSearchElm++;
                    $scope.searchInput = $scope.autoCompleteUriResults[$scope.activeSearchElm].value;
                    scrollContentToBottom();
                }
                if (event.keyCode === 38 && $scope.activeSearchElm > 0) {
                    event.preventDefault();
                    $scope.activeSearchElm--;
                    $scope.searchInput = $scope.autoCompleteUriResults[$scope.activeSearchElm].value;
                    scrollContentToTop();
                }
                if (event.keyCode === 27) {
                    if (IS_SEARCH_PRESERVED) {
                        return;
                    }
                    $scope.searchInput = '';
                    $scope.autoCompleteUriResults = [];
                }

                if (!$scope.searchInput) {
                    $scope.clearInput();
                }
            };

            function isAutocompleteResultsLoaded() {
                return new Promise((resolve) => {
                    const dropDown = document.getElementById('auto-complete-results-wrapper');
                    const rect = dropDown.getBoundingClientRect();
                    setTimeout(() => {
                        resolve(rect.top >= 0 && rect.left >= 0 &&
                            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                            rect.right <= (window.innerWidth || document.documentElement.clientWidth));
                    });
                });
            }

            function scrollToPreviouslySelectedEl() {
                const dropDown = $('#auto-complete-results-wrapper');
                const automaticScroll = $('#auto_' + $scope.selectedElementIndex);
                dropDown.animate({
                    scrollTop: automaticScroll.offset().top - dropDown.offset().top +
                        dropDown.scrollTop()
                });
            }

            function loadStoredSearchData() {
                if (IS_SEARCH_PRESERVED) {
                    $scope.preserveInput = 'true';
                    $scope.searchInput = LocalStorageAdapter.get(LSKeys.RDF_SEARCH_INPUT) || "";
                    expandedUri = LocalStorageAdapter.get(LSKeys.RDF_SEARCH_EXPANDED_URI);
                    return $scope.onChange();
                }
                // Usually when this function is called search is preserved
                return Promise.resolve();
            }

            function findPreviousSearchResultIndex() {
                let index = -1;
                const focused = LocalStorageAdapter.get(LSKeys.RDF_RESOURCE_DESCRIPTION);
                if (focused && $scope.autoCompleteUriResults) {
                    index = $scope.autoCompleteUriResults.findIndex((el) => el.description === focused);
                    $scope.selectedElementIndex = index;

                    isAutocompleteResultsLoaded()
                        .then(function () {
                            scrollToPreviouslySelectedEl();
                        }).catch(function (err) {
                        toastr.error(getError(err), $translate.instant('no.prev.search.element'));
                    });
                }

                $scope.activeSearchElm = index === -1 ? 0 : index;
            }

            function loadAutocompleteData() {
                loadStoredSearchData()
                    .then(function () {
                        findPreviousSearchResultIndex();
                    });
            }

            $scope.$on('rdfResourceSearchExpanded', loadAutocompleteData);

            $scope.setActiveClassOnMouseMove = function (index) {
                if (!element.autoCompleteStatus) {
                    return;
                }
                $scope.activeSearchElm = index;
            };

            function scrollContentToBottom() {
                const $autoCompleteWrapper = $("#auto-complete-results-wrapper");
                const $autoCompleteWrapperDiv = $autoCompleteWrapper.children("div");
                const $autoCompleteWrappreDivActive = $autoCompleteWrapper.children("div.active");
                if ($autoCompleteWrappreDivActive[0] !== undefined &&
                    ($autoCompleteWrappreDivActive[0].offsetTop - $autoCompleteWrapperDiv.height() - 6) - $autoCompleteWrapper.scrollTop() > 170) {
                    $autoCompleteWrapper.scrollTop($autoCompleteWrappreDivActive[0].offsetTop - $autoCompleteWrapperDiv.height() - 6 - 170);
                }
            }

            function scrollContentToTop() {
                const $autoCompleteWrapper = $("#auto-complete-results-wrapper");
                const $autoCompleteWrapperDiv = $autoCompleteWrapper.children("div");
                const $autoCompleteWrappreDivActive = $autoCompleteWrapper.children("div.active");
                if ($autoCompleteWrappreDivActive[0] !== undefined &&
                    $autoCompleteWrappreDivActive[0].offsetTop - $autoCompleteWrapperDiv.height() - 40 <= $autoCompleteWrapper.scrollTop()) {
                    $autoCompleteWrapper.scrollTop($autoCompleteWrapper.scrollTop() - 34);
                }
            }

            function validateRdfUri(value) {
                const hasAngleBrackets = value.indexOf("<") >= 0 && value.indexOf(">") >= 0;
                const noAngleBrackets = value.indexOf("<") === -1 && value.lastIndexOf(">") === -1;
                const validProtocol = /^<?(http|urn).*>?/.test(value) && (hasAngleBrackets || noAngleBrackets);
                let validPath = false;

                if (validProtocol) {
                    if (value.indexOf("http") >= 0) {
                        const schemaSlashesIdx = value.indexOf('//');
                        validPath = schemaSlashesIdx > 4 && value.substring(schemaSlashesIdx + 2).length > 0;
                    } else if (value.indexOf("urn") >= 0) {
                        validPath = value.substring(4).length > 0;
                    }
                }
                return validProtocol && validPath;
            }

            function expandPrefix(str) {
                const ABS_URI_REGEX = /^<?(http|urn).*>?/;
                if (!ABS_URI_REGEX.test(str)) {
                    const uriParts = str.split(':');
                    const uriPart = uriParts[0];
                    const localName = uriParts[1];
                    if (!angular.isUndefined(localName)) {
                        const newExpandedUri = ClassInstanceDetailsService.getNamespaceUriForPrefix(element.namespaces, uriPart);
                        expandedUri = (newExpandedUri !== expandedUri) ? newExpandedUri : expandedUri;
                        if (expandedUri) {
                            SEARCH_INPUT_FIELD.val(expandedUri);
                            return expandedUri + localName;
                        }
                    }
                }
                return str;
            }

            function checkUriAutocomplete(searchInput) {
                function handleAbsUris(absUri) {
                    let uri = absUri;
                    if (uri.indexOf(';') === -1 && validateRdfUri(uri)) {
                        uri = uri.replace(/<|>/g, '');
                        const localName = /[^/^#]*$/.exec(uri)[0];
                        const uriPart = uri.split(localName)[0];
                        return uriPart + ";" + localName;
                    }
                    return uri;
                }

                // add semicolon after the expanded uri in order to filter only by local names for this uri
                let search = searchInput.replace(expandedUri, expandedUri + ';');

                if (element.autoCompleteStatus) {
                    if (search.charAt(0) === ';') {
                        search = search.slice(1);
                    }
                    search = handleAbsUris(search);
                    if (canceler) {
                        canceler.resolve();
                    }
                    canceler = $q.defer();
                    return AutocompleteRestService.getAutocompleteSuggestions(search, canceler.promise)
                        .then(function (results) {
                            canceler = null;
                            // if (showDropDown) {
                            $scope.autoCompleteUriResults = results.data.suggestions;
                            // }
                            $scope.activeSearchElm = 0;
                        });
                }
                return Promise.resolve();
            }
        }
    };
}

keyboardShortcutsDirective.$inject = ['$document'];

function keyboardShortcutsDirective($document) {
    return {
        restrict: 'AE',
        link: linkFunc,
        template: '<ng-include src="getTemplateUrl()" />'
    };

    function linkFunc(scope, element, attrs) {
        scope.getTemplateUrl = function () {
            return attrs.templateUrl;
        };
        scope.shortcutsVisible = false;
        scope.toggleCheatSheet = toggleCheatSheet;

        function escapeEvent(event) {
            if (event.keyCode === 27) { // escape
                scope.toggleCheatSheet();
                scope.$apply();
            }
        }

        function toggleCheatSheet() {
            scope.shortcutsVisible = !scope.shortcutsVisible;
            if (scope.shortcutsVisible) {
                $document.on('keydown', escapeEvent);
            } else {
                $document.off('keydown', escapeEvent);
            }
        }
    }
}
inactivePluginDirective.$inject = ['toastr', 'RDF4JRepositoriesRestService', 'ModalService', '$repositories', '$licenseService', '$translate'];
function inactivePluginDirective(toastr, RDF4JRepositoriesRestService, ModalService, $repositories, $licenseService, $translate) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            loadSaved: '&',
            setPluginActive: '&',
            pluginName: '@',
            humanReadablePluginName: '@'
        },
        templateUrl: 'js/angular/core/templates/inactive-plugin-warning-page.html',

        link: linkFunc
    };

    function linkFunc($scope) {
        $scope.pluginIsActive = true;

        function checkPluginIsActive() {
            // Should not check if plugin is active if no valid license is set,
            // or there isn't active repository, or repository is of type ontop or fedx
            if (!$licenseService.isLicenseValid() ||
                !$repositories.getActiveRepository() ||
                $repositories.isActiveRepoOntopType() ||
                $repositories.isActiveRepoFedXType()) {
                return;
            }
            return RDF4JRepositoriesRestService.checkPluginIsActive($scope.pluginName, $repositories.getActiveRepository())
                .then(function ({data}) {
                    $scope.pluginIsActive = data.indexOf('true') > 0;
                    $scope.setPluginActive({isPluginActive: $scope.pluginIsActive});
                })
                .catch(function (data) {
                    toastr.error(getError(data), $translate.instant('check.active.plugin.failure'));
                });
        }

        $scope.activatePlugin = function () {
            const activatePluginWarning= decodeHTML($translate.instant('activate.plugin.warning.msg', {humanReadablePluginName: $scope.humanReadablePluginName}));
            ModalService.openSimpleModal({
                title: $translate.instant('activate.plugin.confirmation'),
                message: `<p>${activatePluginWarning}</p>`,
                warning: true
            }).result
                .then(function () {
                    RDF4JRepositoriesRestService.activatePlugin($scope.pluginName, $repositories.getActiveRepository())
                        .then(function () {
                            $scope.pluginIsActive = true;
                            $scope.setPluginActive({isPluginActive: $scope.pluginIsActive});
                            $scope.loadSaved();
                        })
                        .catch(function (data) {
                            toastr.error(getError(data), $translate.instant('activate.plugin.failure'));
                        });
                });
        };

        const repoIsSetListener = $scope.$on('repositoryIsSet', function () {
            checkPluginIsActive();
        });

        window.addEventListener('beforeunload', removeRepoIsSetListener);

        function removeRepoIsSetListener() {
            repoIsSetListener();
            window.removeEventListener('beforeunload', removeRepoIsSetListener);
        }

        $scope.$on('checkIsActive', checkPluginIsActive);

        checkPluginIsActive();
    }
}

function autoGrowDirective() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
            const updateHeight = function() {
                const value = ngModelCtrl.$viewValue;
                if (!value || value.trim() === '') {
                    element[0].style.height = '26px';
                } else {
                    element[0].style.height = '0px'; // Reset height to calculate new scrollHeight
                    element[0].style.height = element[0].scrollHeight + 'px';
                }
                element[0].style.overflow = 'hidden';
            };

            scope.$watch(function() {
                return ngModelCtrl.$viewValue;
            }, function() {
                updateHeight();
            });

            element.bind('input change', function() {
                updateHeight();
            });
        }
    };
}

function captureHeightDirective() {
    return {
        restrict: 'A',
        scope: {
            rowIndex: '=captureHeight'
        },
        link: function(scope, element, attrs) {
            scope.$watch(function() {
                return element[0].offsetHeight;
            }, function(newHeight) {
                // Use the rowIndex to store the height for each row specifically
                scope.$parent.rowHeights[scope.rowIndex] = newHeight + 'px!important';
            });
        }
    };
}
