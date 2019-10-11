angular
    .module('graphdb.framework.rest.autocomplete.service', [])
    .factory('AutocompleteRestService', AutocompleteRestService);

AutocompleteRestService.$inject = ['$http'];

function AutocompleteRestService($http) {
    return {
        checkAutocompleteStatus: checkAutocompleteStatus,
        refreshIndexStatus: refreshIndexStatus,
        refreshLabelConfig: refreshLabelConfig,
        addLabelConfig: addLabelConfig,
        removeLabelConfig: removeLabelConfig,
        toggleAutocomplete: toggleAutocomplete,
        refreshIndexIRIs: refreshIndexIRIs,
        toggleIndexIRIs: toggleIndexIRIs,
        buildIndex: buildIndex,
        interruptIndexing: interruptIndexing,
        checkForPlugin: checkForPlugin,
        getAutocompleteSuggestions: getAutocompleteSuggestions
    };

    function checkAutocompleteStatus() {
        return $http.get('rest/autocomplete/enabled');
    }

    function toggleAutocomplete(newValue) {
        return $http.post('rest/autocomplete/enabled?enabled=' + newValue);
    }

    function refreshIndexIRIs() {
        return $http.get('rest/autocomplete/iris');
    }

    function toggleIndexIRIs(newValue) {
        return $http.post('rest/autocomplete/iris?enabled=' + newValue);
    }

    function buildIndex() {
        return $http.post('rest/autocomplete/reIndex');
    }

    function interruptIndexing() {
        return $http.post('rest/autocomplete/interrupt');
    }

    function refreshIndexStatus() {
        return $http.get('rest/autocomplete/status');
    }

    function checkForPlugin() {
        return $http.get('rest/autocomplete/pluginFound');
    }

    function getAutocompleteSuggestions(str, cancelerPromise) {
        return $http.get('rest/autocomplete/query', {
            params: {
                q: str
            },
            timeout: cancelerPromise
        });
    }

    function refreshLabelConfig() {
        return $http.get('rest/autocomplete/labels');
    }

    function addLabelConfig(label) {
        return $http.put('rest/autocomplete/labels', label);
    }

    function removeLabelConfig(label) {
        return $http.delete('rest/autocomplete/labels', {
            data: label,
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        });
    }
}
