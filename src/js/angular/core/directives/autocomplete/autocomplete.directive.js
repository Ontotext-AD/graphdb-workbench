import {decodeHTML} from "../../../../../app";
import {mapUriAsNtripleAutocompleteResponse} from "../../../rest/mappers/autocomplete-mapper";

angular
    .module('graphdb.framework.core.directives.autocomplete', [])
    .directive('autocomplete', autocomplete);

autocomplete.$inject = ['$location', 'toastr', 'ClassInstanceDetailsService', 'AutocompleteRestService', '$q', '$sce', '$repositories', '$translate', '$timeout'];

function autocomplete($location, toastr, ClassInstanceDetailsService, AutocompleteRestService, $q, $sce, $repositories, $translate, $timeout) {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            ngModel: '=',
            namespaces: '=',
            autocompleteStatusLoader: '=',
            placeholder: '@',
            styleClass: '@',
            multiline: '@',
            defaultresults: '=',
            onModelChange: '&',
            keypress: '&',
            required: '=?',
            validateUri: '=?',
            validateSimpleRdfStarValue: '=?',
            validateLiteralValue: '=?',
            validateDefaultValue: '=?'
        },
        templateUrl: 'js/angular/core/directives/autocomplete/templates/autocomplete.html',
        link: linkFunction
    };

    function linkFunction($scope, element, attrs, ngModel) {

        //
        // Private variables
        //

        /**
         * The minimum characters that must be typed into the autocomplete field before autocomplete to be triggered.
         * @type {number}
         */
        const MIN_CHAR_LEN = 0;

        /**
         * An instance of the input field wrapped by this component.
         */
        let SEARCH_INPUT_FIELD = element.find('.autocomplete-input');

        /**
         * Keeps the old uri in order to change it when a new one appears.
         */
        let expandedUri;

        /**
         * An http canceler function which might be invoked in order to stop old requests if new one starts.
         */
        let canceler;

        //
        // Public variables
        //

        /**
         * The search term value which will be displayed in the input field either when the user types it in the field
         * or it's passed as default value from the parent.
         * @type {string}
         */
        $scope.searchInput = $scope.ngModel || '';

        /**
         * The placeholder which will be displayed inside the input field.
         */
        $scope.placeholder = attrs.$attr.placeholder || $translate.instant('search.resources.msg');

        element.autoCompleteStatus = undefined;

        element.autoCompleteWarning = false;

        //
        // Public methods
        //

        /**
         * Handle blur event in a timeout in order to allow if it was triggered by a click on the dropdown menu itself.
         * Hiding the menu immediately otherwise would cause the selection to fail because the blur event happens before
         * the click.
         */
        $scope.onBlur = () => {
            setTimeout(() => {
                $scope.autoCompleteUriResults = [];
            }, 0);
        };

        $scope.onChange = () => {
            $scope.searchInput = expandPrefix($scope.searchInput);
            if (element.autoCompleteStatus) {
                return checkUriAutocomplete($scope.searchInput);
            }
            return Promise.resolve();
        };

        $scope.onKeyDown = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (isAutocomplete()) {
                    checkIfValidAndSearch();
                } else {
                    $scope.keypress({$event: event});
                }
            } else if ($scope.searchInput && $scope.searchInput.length > MIN_CHAR_LEN && !element.autoCompleteWarning && !element.autoCompleteStatus) {
                element.autoCompleteWarning = true;
                const warningMsg = decodeHTML($translate.instant('explore.autocomplete.warning.msg'));
                toastr.warning('', `<div class="autocomplete-toast"><a href="autocomplete">${warningMsg}</a></div>`,
                    {allowHtml: true});
            }

            if (!element.autoCompleteStatus || angular.isUndefined($scope.autoCompleteUriResults)) {
                return;
            }
            if (event.key === 'ArrowDown' && $scope.activeSearchElm < $scope.autoCompleteUriResults.length - 1) {
                $scope.activeSearchElm++;
                scrollContentToBottom();
            }
            if (event.key === 'ArrowUp' && $scope.activeSearchElm > 0) {
                event.preventDefault();
                $scope.activeSearchElm--;
                scrollContentToTop();
            }
            if (event.key === 'Escape') {
                $scope.autoCompleteUriResults = [];
            }

            if (!$scope.searchInput) {
                clearInput();
            }
        };

        /**
         * Sanitizes the description so that it can be rendered safely in the UI.
         * @param {{description: string}} resultItem
         * @return {*}
         */
        $scope.getResultItemHtml = (resultItem) => {
            return $sce.trustAsHtml(resultItem.description);
        };

        $scope.selectResource = (resource) => {
            if (resource.type === 'prefix') {
                $scope.searchInput = expandPrefix(resource.value + ':');
                SEARCH_INPUT_FIELD.focus();
                $scope.onChange();
            } else if (resource.type === 'default') {
                $scope.searchInput = resource.value;
                $scope.autoCompleteUriResults = [];
                SEARCH_INPUT_FIELD.focus();
            } else if (resource && typeof resource === 'string' && validateRdfUri(resource)) {
                $scope.searchInput = resource;
                $scope.autoCompleteUriResults = [];
            } else {
                $scope.searchInput = '<' + resource.value + '>';
                $scope.autoCompleteUriResults = [];
        }
        };

        $scope.setActiveItemIndex = (index) => {
            if (!element.autoCompleteStatus) {
                return;
            }
            $scope.activeSearchElm = index;
        };

        /**
         * Adjusts the position of the autocomplete dropdown relative to the viewport's width,
         * or resets its position based on the `reset` parameter.
         *
         * When `reset` is true, the function clears any inline styles for the 'left' and 'right'
         * properties of the dropdown, effectively resetting its position to default. If `reset` is false
         * or not provided, and if the dropdown's current style for the 'right' property is not set to 'auto',
         * the function exits early to avoid repositioning elements unnecessarily.
         *
         * If repositioning is needed, the function calculates the position of the `.autocomplete-results-wrapper`
         * element by comparing the right edges of the dropdown and the viewport. If the dropdown extends
         * beyond the viewport, it adjusts the CSS to align the dropdown's right edge with the right edge
         * of the `edit-rule-row` element, taking into account the relative position of the `autocomplete-select`
         * input. This adjustment ensures that the dropdown does not extend outside the viewport.
         *
         * If there's sufficient space in the viewport, the dropdown's left edge is aligned with the left edge
         * of its container. This logic ensures the dropdown is fully visible within the current viewport,
         * enhancing the user interface experience.
         *
         * This function is executed within a `$timeout` to ensure that any DOM updates are completed
         * before calculating positions and applying adjustments. Additionally, an angular watch
         * on `autoCompleteUriResults` triggers this function to either reposition the dropdown or
         * reset its position, depending on the presence or absence of autocomplete results.
         *
         * @param {boolean} reset - Indicates whether to reset the dropdown's position.
         */
        $scope.positionAutocompleteWrapper = function(reset) {
            $timeout(() => {
                const dropdownElement = element.find('.autocomplete-results-wrapper');
                const dropdown = dropdownElement.get(0);
                if (reset) {
                    dropdown.style.left = 'auto';
                    dropdown.style.right = 'auto';
                    return;
                }
                if (dropdown && dropdown.style.right !== 'auto') {
                    return;
                }

                const autocompleteInputRect = dropdownElement.parent().find('.autocomplete-select')[0].getBoundingClientRect();
                const rowRect = document.body.getElementsByClassName('edit-rule-row')[0].getBoundingClientRect();
                const bodyRect = document.body.getBoundingClientRect();
                const dropdownRect = dropdown.getBoundingClientRect();

                if (dropdown && dropdownRect.right >= bodyRect.width) {
                    const offset = rowRect.right - autocompleteInputRect.right;
                    dropdown.style.left = 'auto';
                    dropdown.style.right = `-${offset}px`;
                } else if (dropdown && dropdownRect.right < bodyRect.width) {
                    dropdown.style.right = 'auto';
                    dropdown.style.left = '0px';
                }
            }, 0);
        };

        $scope.$watch('autoCompleteUriResults', function(results) {
            const shouldReset = !results || results && results.length === 0;
            $scope.positionAutocompleteWrapper(shouldReset);
        });

        //
        // Validators
        //
        ngModel.$validators.custom = function(modelValue) {
            if (!$scope.validateUri && !$scope.validateLiteralValue && !$scope.validateDefaultValue) {
                return true;
            }

            if ($scope.validateUri && validateRdfUri(modelValue)) {
                element.find('.autocomplete-editable').removeClass('invalid');
                return true;
            }
            if ($scope.validateSimpleRdfStarValue && validateSimpleRdfStar(modelValue)) {
                element.find('.autocomplete-editable').removeClass('invalid');
                return true;
            }
            if ($scope.validateLiteralValue && validateLiteral(modelValue)) {
                element.find('.autocomplete-editable').removeClass('invalid');
                return true;
            }
            if ($scope.validateDefaultValue && validateDefault(modelValue)) {
                element.find('.autocomplete-editable').removeClass('invalid');
                return true;
            }
            element.find('.autocomplete-editable').addClass('invalid');
            return false;
        };

        //
        // Private methods
        //

        const validateRdfUri = (value) => {
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
        };

        const expandPrefix = (str) => {
            if (!str) {
                return;
            }
            const ABS_URI_REGEX = /^<?(http|urn).*>?/;
            if (!ABS_URI_REGEX.test(str)) {
                const uriParts = str.split(':');
                const uriPart = uriParts[0];
                const localName = uriParts[1];
                if (!angular.isUndefined(localName)) {
                    const newExpandedUri = ClassInstanceDetailsService.getNamespaceUriForPrefix($scope.namespaces, uriPart);
                    expandedUri = (newExpandedUri !== expandedUri) ? newExpandedUri : expandedUri;
                    if (expandedUri) {
                        SEARCH_INPUT_FIELD.val(expandedUri);
                        return '<' + expandedUri + localName + '>';
                    }
                }
            }
            return str;
        };


        /**
         * Validates if the given value is a RDF* (RDF Star) statement.
         * This function checks whether the value strictly starts with '<<' and ends with '>>',
         * indicating a basic RDF* pattern. It does not validate the internal structure of the RDF* statement.
         *
         * @param {string} value - The string value to be validated as a simple RDF* statement.
         * @return {boolean} Returns `true` if the value matches the simple RDF* pattern, otherwise `false`.
         */
        const validateSimpleRdfStar = (value) => {
            const rdfStarWrapper = /^<<.*>>$/;
            return rdfStarWrapper.test(value);
        };

        const validateDefault = (value) => {
            return $scope.defaultresults.some((element) => element.value === value);
        };

        const validateLiteral = (value) => {
            const rdfLiteralRegex = /^"([^"\\]*(?:\\.[^"\\]*)*)"(@[a-zA-Z]+(-[a-zA-Z0-9]+)*)?(\^\^[^\s]+)?$/;
            return rdfLiteralRegex.test(value);
        };

        const clearInput = () => {
            $scope.searchInput = '';
            $scope.selectedElementIndex = -1;
            $scope.autoCompleteUriResults = [];
        };

        const checkIfValidAndSearch = () => {
            if (isAutocomplete()) {
                if ($scope.autoCompleteUriResults[$scope.activeSearchElm].type === 'prefix') {
                    $scope.searchInput = expandPrefix($scope.autoCompleteUriResults[$scope.activeSearchElm].value + ':');
                    $scope.autoCompleteUriResults = [];
                } else {
                    const selectedResource = $scope.autoCompleteUriResults[$scope.activeSearchElm];
                    $scope.selectResource({
                        type: selectedResource.type,
                        value: selectedResource.value,
                        description: selectedResource.description
                    });
                }
            } else {
                const fieldValue = $scope.searchInput;
                if (validateRdfUri(fieldValue)) {
                    $scope.selectResource(fieldValue);
                } else {
                    toastr.error($translate.instant('invalid.uri.msg'));
                }
            }
        };

        // autocomplete is enabled and autocomplete results are loaded
        const isAutocomplete = () => element.autoCompleteStatus && $scope.autoCompleteUriResults && $scope.autoCompleteUriResults.length > 0;

        const handleAbsUris = (absUri) => {
            let uri = absUri;
            if (uri.indexOf(';') === -1 && validateRdfUri(uri)) {
                uri = uri.replace(/<|>/g, '');
                const localName = /[^/^#]*$/.exec(uri)[0];
                const uriPart = uri.split(localName)[0];
                return uriPart + ";" + localName;
            }
            return uri;
        };

        const checkUriAutocomplete = (searchInput) => {
            if (!searchInput) {
                return;
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
                    .then(mapUriAsNtripleAutocompleteResponse)
                    .then((suggestions) => {
                        canceler = null;
                        if ($scope.defaultresults && $scope.defaultresults.length > 0) {
                            $scope.autoCompleteUriResults = filterAndCombineDefaultResults(
                                $scope.defaultresults,
                                $scope.searchInput,
                                suggestions
                            );
                        } else {
                            $scope.autoCompleteUriResults = suggestions;
                        }
                        $scope.activeSearchElm = 0;
                    });
            }
            return Promise.resolve();
        };

        const scrollContentToBottom = () => {
            const $autoCompleteWrapper = element.find('.autocomplete-results-wrapper');
            const $autoCompleteWrapperDiv = $autoCompleteWrapper.children('div');
            const $autoCompleteWrappreDivActive = $autoCompleteWrapper.children('div.active');

            if ($autoCompleteWrappreDivActive[0] !== undefined &&
                ($autoCompleteWrappreDivActive[0].offsetTop - $autoCompleteWrapperDiv.height() - 6) - $autoCompleteWrapper.scrollTop() > 90) {
                $autoCompleteWrapper.scrollTop($autoCompleteWrappreDivActive[0].offsetTop - $autoCompleteWrapperDiv.height() - 6 - 90);
            }
        };

        const scrollContentToTop = () => {
            const $autoCompleteWrapper = element.find('.autocomplete-results-wrapper');
            const $autoCompleteWrapperDiv = $autoCompleteWrapper.children('div');
            const $autoCompleteWrappreDivActive = $autoCompleteWrapper.children('div.active');

            if ($autoCompleteWrappreDivActive[0] !== undefined &&
                $autoCompleteWrappreDivActive[0].offsetTop - $autoCompleteWrapperDiv.height() + 6 <= $autoCompleteWrapper.scrollTop() - 34) {
                $autoCompleteWrapper.scrollTop($autoCompleteWrapper.scrollTop() - 34);
            }
        };

        const autocompletePromiseHandler = () => {
            if (!$repositories.isActiveRepoFedXType() && angular.isDefined($scope.autocompleteStatusLoader)) {
                $scope.autocompleteStatusLoader.then((response) => {
                    element.autoCompleteStatus = !!response.data;
                    // trigger onChange only if the value was manually populated by the user
                    if ($scope.searchInput !== '' && !$scope.ngModel) {
                        $scope.onChange();
                    }
                }).catch(() => {
                    toastr.error($translate.instant('explore.error.autocomplete'));
                });
            }
        };

        const ngModelUpdater = (newValue) => {
            if ($scope.autoexpand) {
                $scope.adjustTextareaHeight();
            }
            $scope.ngModel = newValue;
            $scope.onModelChange();
        };

        const unsubscribeListeners = () => {
            subscriptions.forEach((subscription) => subscription());
        };

        //
        // Watchers
        //
        const subscriptions = [];
        subscriptions.push($scope.$watch('autocompleteStatusLoader', autocompletePromiseHandler));
        subscriptions.push($scope.$watch('searchInput', ngModelUpdater));
        subscriptions.push($scope.$on('$destroy', unsubscribeListeners));

        $scope.isMultiline = attrs.multiline === 'true';
        if ($scope.isMultiline) {
            SEARCH_INPUT_FIELD = element.find('.autocomplete-textarea');
        }
        $scope.initialRows = attrs.initialRows || 1;
        $scope.autoexpand = attrs.autoexpand || false;

        // Auto-expand logic
        $scope.adjustTextareaHeight = () => {
            if ($scope.isMultiline) {
                // run after DOM updates
                $timeout(() => {
                    const textarea = SEARCH_INPUT_FIELD[0];
                    textarea.style.overflow = 'hidden';
                    textarea.style.height = '0px';
                    textarea.style.height = textarea.scrollHeight + 'px';
                }, 0);
            }
        };

        const filterAndCombineDefaultResults = (defaultResults, currentInput, backendSuggestions) => {
            // Filter default words based on current input
            const filteredDefaultResults = defaultResults.filter((result) =>
                result && result.value.toLowerCase().includes(currentInput.toLowerCase())
            ).map((result) => ({
                type: result.type,
                value: result.value,
                description: highlightMatch($translate.instant(result.description), currentInput)
            }));

            // Concatenate filtered default words with backend suggestions
            return filteredDefaultResults.concat(backendSuggestions);
        };

        const highlightMatch = (word, match) => {
            const matchStart = word.toLowerCase().indexOf(match.toLowerCase());
            if (matchStart === -1) return word; // If no match found, return word as is

            const matchEnd = matchStart + match.length;
            return word.substring(0, matchStart) + '<b>' + word.substring(matchStart, matchEnd) + '</b>' + word.substring(matchEnd);
        };
    }
}
