angular
    .module('graphdb.framework.core.directives', [
        'graphdb.framework.repositories.services'
    ])
    .directive('ontoLoader', ontoLoader)
    .directive('ontoLoaderFancy', ontoLoaderFancy)
    .directive('ontoLoaderNew', ontoLoaderNew)
    .directive('coreErrors', coreErrors)
    .directive('eatClick', eatClick)
    .directive('multiRequired', multiRequired)
    .directive('searchResourceInput', searchResourceInput)
    .directive('keyboardShortcuts', keyboardShortcutsDirective);

ontoLoader.$inject = [];

function ontoLoader() {
    return {
        template: function (elem, attr) {
            return '<object width="' + attr.size + '" height="' + attr.size + '" data="js/angular/templates/loader/ot-loader.svg">Loading...</object>'
        }
    };
}

ontoLoaderFancy.$inject = [];

function ontoLoaderFancy() {
    return {
        template: function (elem, attr) {
            return '<object width="' + attr.size + '" height="' + attr.size + '" data="js/angular/templates/loader/ot-loader.svg"></object>'
                + '<div>Loading...<div>';
        }
    };
}

ontoLoaderNew.$inject = ['$timeout'];

function ontoLoaderNew($timeout) {
    var restartTimeout = function ($timeout, scope) {
        scope.timer = undefined;
        scope.currentMessage = scope.getMessage();
        var time = scope.timeout[scope.index % scope.timeout.length];
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
        link: function (scope, element, attrs) {
            // element.addClass('ot-loader-new');

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

            var triggerFunction = function (show) {
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

            scope.$on('$destroy', function (event) {
                if (scope.timer) {
                    $timeout.cancel(scope.timer);
                }
            });
        },
        template: '<div class="ot-loader-new-content">'
        + '<img width="{{size}}" height="{{size}}" src="js/angular/templates/loader/ot-loader.svg"/>'
        + '<div style="font-size: {{size/4}}px">{{currentMessage}}<div>'
        + '</div>'
    };
}

coreErrors.$inject = ['$timeout'];

function coreErrors($timeout) {
    return {
        // FIXME: Why doesn't require find mainCtrl?
        // require: '^^mainCtrl',
        restrict: 'EA',
        transclude: true,
        templateUrl: 'js/angular/core/templates/core-errors.html',
        link: function (scope, element, attrs) {
            // If the attribute "write" is provided then this directive will require a repository with write access.
            scope.isWriteRequired = attrs.hasOwnProperty('write');

            var previousElement;

            scope.getAccessibleRepositories = function () {
                if (scope.isWriteRequired) {
                    return scope.getWritableRepositories();
                } else {
                    return scope.getReadableRepositories()
                }
            };

            scope.showPopoverForRepo = function (event, repository) {
                scope.hidePopoverForRepo();
                scope.setPopoverRepo(repository);
                $timeout(function () {
                    var element = $(event.toElement).find('.popover-anchor')[0];
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
                    var el = event.relatedTarget;
                    while (el) {
                        if (el.className.indexOf("popover") === 0) {
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
    return function (scope, element, attrs) {
        $(element).click(function (event) {
            event.preventDefault();
            event.stopPropagation();
        });
    }
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
            var setMultiValue = function (value) {

                if (element && element % 1 === 0) {
                    scope.multiRequired[element - 1] = value;
                }
            };
            var checkMultiValueError = function () {
                var filledData = false;
                var emptyData = false;
                for (var i = 0; i < scope.multiRequired.length; i++) {
                    if (scope.multiRequired[i]) {
                        filledData = true;
                    } else {
                        emptyData = true;
                    }
                }
                ngModel.$setValidity('multiRequire', !(filledData && emptyData));
            };
            var element = attrs.multiRequireElement;

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

searchResourceInput.$inject = ['$location', 'toastr', 'ClassInstanceDetailsService', 'AutocompleteService', '$rootScope', '$q'];

function searchResourceInput($location, toastr, ClassInstanceDetailsService, AutocompleteService, $rootScope, $q) {
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
        },
        templateUrl: 'js/angular/core/templates/search-resource-input.html',
        link: function ($scope, scope, element) {
            scope.autoCompleteStatus = undefined;
            scope.autoCompleteWarning = false;
            $scope.empty = false;
            $scope.searchInput = "";
            var MIN_CHAR_LEN = 0;

            // use a global var to keep old uri in order to change it when a new one appears
            var expandedUri;

            var canceler;

            $scope.$watch('namespacespromise', function () {
                if (angular.isDefined($scope.namespacespromise)) {
                    $scope.namespacespromise.success(function (data) {
                        scope.namespaces = data.results.bindings.map(function (e) {
                            return {
                                prefix: e.prefix.value,
                                uri: e.namespace.value
                            };
                        });
                    }).error(function (data) {
                        msg = getError(data);
                        toastr.error(msg, 'Error getting namespaces for repository.');
                    });
                }
            });


            $scope.$watch('autocompletepromisestatus', function () {
                if (angular.isDefined($scope.autocompletepromisestatus)) {
                    $scope.autocompletepromisestatus.success(function (response) {
                        scope.autoCompleteStatus = !!response;
                    }).error(function () {
                        toastr.error("Error attempting to check autocomplete capability!");
                    });
                }
            });

            $scope.$watch('empty', function () {
                $scope.searchInput = '';
                $scope.empty = false;
            })

            var defaultTextCallback = function (params) {
                $location.path('resource').search('uri', params.uri);
            };

            var defaultVisualCallback = function (params) {
                $location.path('graphs-visualizations').search('uri', params.uri);
            };

            if (angular.isUndefined(element.$attr.textCallback)) {
                $scope.textCallback = defaultTextCallback;
            }

            if (angular.isUndefined(element.$attr.visualCallback)) {
                $scope.visualCallback = defaultVisualCallback;
            }

            if (element.$attr.textButton && !$scope.textButton) {
                $scope.textCallback = $scope.visualCallback;
            } else if (element.$attr.visualButton && !$scope.visualButton) {
                $scope.visualCallback = $scope.textCallback;
            }

            if (element.$attr.placeholder) {
                $scope.placeholder = element.$attr.placeholder;
            } else {
                $scope.placeholder = "Search RDF resources...";
            }


            if (angular.isDefined(element.$attr.uriValidation)) {
                $scope.uriValidation = element.$attr.uriValidation;
            } else {
                $scope.uriValidation = 'true';
            }

            if (angular.isDefined(element.$attr.preserveInput)) {
                $scope.preserveInput = element.$attr.preserveInput;
            }

            $scope.searchRdfResource = function (uri, callback) {
                if (uri.type === "prefix") {
                    $scope.searchInput = expandPrefix(uri.value + ':');
                    $scope.autoCompleteUriResults = [];
                } else {
                    var textUri;
                    if (angular.isUndefined(uri)) {
                        textUri = $scope.searchInput;
                    }
                    if (typeof uri === 'object') {
                        textUri = uri.value;
                    } else {
                        textUri = uri;
                    }

                    // Parse the description to determine the label
                    // TODO: we should rather introduce direct support for this in the autocomplete plugin
                    var label = "";
                    if (uri.description) {
                        var suffixedEscapedUri = '&lt;' + textUri + '&gt;';
                        var indexOfSuffixed = uri.description.indexOf(suffixedEscapedUri);
                        if (indexOfSuffixed > 0) {
                            label = uri.description.substring(0, indexOfSuffixed).replace(/<\/?b>/g, "");
                        }
                    }

                    callback({uri: textUri, description: uri.description, label: label});

                    $scope.autoCompleteUriResults = [];
                    if ($scope.preserveInput === 'true') {
                        $scope.searchInput = textUri;
                    } else {
                        $scope.searchInput = "";
                    }
                }
            };

            $scope.searchRdfResourceByEvent = function (uri, event) {
                if (event.ctrlKey || event.metaKey) {
                    $scope.searchRdfResource(uri, $scope.visualCallback);
                } else {
                    $scope.searchRdfResource(uri, $scope.textCallback);
                }
            };

            var checkIfValidAndSearch = function (callback) {
                var uri = $scope.searchInput;
                if (uri === '') {
                    toastr.error('Please fill input field!');
                    return;
                }
                if ($scope.uriValidation !== 'false') {
                    if (scope.autoCompleteStatus && $scope.autoCompleteUriResults && $scope.autoCompleteUriResults.length > 0) {
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
                            toastr.error('Invalid URI');
                        }
                    }
                }
                else {
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
                if (event.ctrlKey || event.metaKey) {
                    checkIfValidAndSearch($scope.visualCallback);
                } else {
                    checkIfValidAndSearch($scope.textCallback);
                }
            };

            $scope.onChange = function () {
                if ($scope.uriValidation !== 'false') {
                    $scope.searchInput = expandPrefix($scope.searchInput);
                    if (scope.autoCompleteStatus) {
                        checkUriAutocomplete($scope.searchInput);
                    }
                }
            };

            $scope.onKeyDown = function (event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    if ($scope.uriValidation !== 'false') {
                        if (scope.autoCompleteStatus) {
                            $scope.checkIfValidAndSearchEvent(event);
                        } else {
                            if (validateRdfUri(event.target.value)) {
                                $scope.searchRdfResourceByEvent(event.target.value, event);
                            } else {
                                toastr.error('Invalid URI');
                            }
                        }
                    } else {
                        $scope.searchRdfResourceByEvent(event.target.value, event);
                    }
                } else if ($scope.searchInput.length > MIN_CHAR_LEN && !scope.autoCompleteWarning && !scope.autoCompleteStatus) {
                    scope.autoCompleteWarning = true;
                    toastr.warning('', '<div class="autocomplete-toast"><a href="autocomplete">Autocomplete is OFF<br>Go to Setup -> Autocomplete</a></div>',
                        {allowHtml: true});
                }

                if (!scope.autoCompleteStatus || angular.isUndefined($scope.autoCompleteUriResults)) {
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
                    $scope.searchInput = '';
                    $scope.autoCompleteUriResults = [];
                }
            };

            $scope.setActiveClassOnHover = function (index) {
                if (!scope.autoCompleteStatus) {
                    return;
                }
                $scope.activeSearchElm = index;
            };


            function scrollContentToBottom() {
                var $autoCompleteWrapper = $("#auto-complete-results-wrapper"),
                    $autoCompleteWrapperDiv = $autoCompleteWrapper.children("div"),
                    $autoCompleteWrappreDivActive = $autoCompleteWrapper.children("div.active");
                if ($autoCompleteWrappreDivActive[0] !== undefined &&
                    ($autoCompleteWrappreDivActive[0].offsetTop - $autoCompleteWrapperDiv.height() - 6) - $autoCompleteWrapper.scrollTop() > 170) {
                    $autoCompleteWrapper.scrollTop($autoCompleteWrappreDivActive[0].offsetTop - $autoCompleteWrapperDiv.height() - 6 - 170);
                }
            }

            function scrollContentToTop() {
                var $autoCompleteWrapper = $("#auto-complete-results-wrapper"),
                    $autoCompleteWrapperDiv = $autoCompleteWrapper.children("div"),
                    $autoCompleteWrappreDivActive = $autoCompleteWrapper.children("div.active");
                if ($autoCompleteWrappreDivActive[0] !== undefined &&
                    $autoCompleteWrappreDivActive[0].offsetTop - $autoCompleteWrapperDiv.height() - 40 <= $autoCompleteWrapper.scrollTop()) {
                    $autoCompleteWrapper.scrollTop($autoCompleteWrapper.scrollTop() - 34);
                }
            }

            function validateRdfUri(value) {
                var hasAngleBrackets = value.indexOf("<") >= 0 && value.indexOf(">") >= 0,
                    noAngleBrackets = value.indexOf("<") === -1 && value.lastIndexOf(">") === -1,
                    validProtocol = /^<?(http|urn).*>?/.test(value) && (hasAngleBrackets || noAngleBrackets),
                    validPath = false;

                if (validProtocol) {
                    if (value.indexOf("http") >= 0) {
                        var schemaSlashesIdx = value.indexOf('//');
                        validPath = schemaSlashesIdx > 4 && value.substring(schemaSlashesIdx + 2).length > 0;
                    } else if (value.indexOf("urn") >= 0) {
                        validPath = value.substring(4).length > 0;
                    }
                }
                return validProtocol && validPath;
            }

            function expandPrefix(str) {
                var ABS_URI_REGEX = /^<?(http|urn).*>?/;
                if (!ABS_URI_REGEX.test(str)) {
                    var uriParts = str.split(':'),
                        uriPart = uriParts[0],
                        localName = uriParts[1];
                    if (!angular.isUndefined(localName)) {
                        var newExpandedUri = ClassInstanceDetailsService.getNamespaceUriForPrefix(scope.namespaces, uriPart);
                        expandedUri = (newExpandedUri !== expandedUri) ? newExpandedUri : expandedUri;
                        if (expandedUri) {
                            $(".view-res-input").val(expandedUri);
                            return expandedUri + localName;
                        }
                    }
                }
                return str;
            }

            function checkUriAutocomplete(searchInput) {
                function handleAbsUris(absUri) {
                    if (absUri.indexOf(';') === -1 && validateRdfUri(absUri)) {
                        absUri = absUri.replace(/<|>/g, '');
                        var localName = /[^/^#]*$/.exec(absUri)[0],
                            uriPart = absUri.split(localName)[0];
                        return uriPart + ";" + localName;
                    }
                    return absUri;
                }

                // add semicolon after the expanded uri in order to filter only by local names for this uri
                searchInput = searchInput.replace(expandedUri, expandedUri + ';');

                if (scope.autoCompleteStatus) {
                    if (searchInput.charAt(0) === ';') {
                        searchInput = searchInput.slice(1);
                    }
                    searchInput = handleAbsUris(searchInput);
                    if (canceler) {
                        canceler.resolve();
                    }
                    canceler = $q.defer();
                    AutocompleteService.getAutocompleteSuggestions(searchInput, canceler.promise)
                        .then(function (results) {
                            canceler = null;
                            $scope.activeSearchElm = 0;
                            $scope.autoCompleteUriResults = results.data.suggestions;
                        });
                }
            }
        }
    };
}

keyboardShortcutsDirective.$inject = ['$document'];

function keyboardShortcutsDirective($document) {
    return {
        restrict: 'AE',
        link: linkFunc,
        template: '<ng-include src="getTemplateUrl()" />',
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
