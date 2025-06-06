angular
    .module('graphdb.framework.rest.autocomplete.service', [])
    .factory('AutocompleteRestService', AutocompleteRestService);

const AUTOCOMPLETE_ENDPOINT = 'rest/autocomplete';
const AUTOCOMPLETE_LABELS_ENDPOINT = `${AUTOCOMPLETE_ENDPOINT}/labels`;
const AUTOCOMPLETE_EDIT_LABEL_ENDPOINT = `${AUTOCOMPLETE_ENDPOINT}/labels/edit`;
const AUTOCOMPLETE_ENABLED_ENDPOINT = `${AUTOCOMPLETE_ENDPOINT}/enabled`;
const AUTOCOMPLETE_IRIS_ENDPOINT = `${AUTOCOMPLETE_ENDPOINT}/iris`;

AutocompleteRestService.$inject = ['$http'];

function AutocompleteRestService($http) {
    return {
        checkAutocompleteStatus,
        refreshIndexStatus,
        refreshLabelConfig,
        addLabelConfig,
        editLabelConfig,
        removeLabelConfig,
        toggleAutocomplete,
        refreshIndexIRIs,
        toggleIndexIRIs,
        buildIndex,
        interruptIndexing,
        checkForPlugin,
        getAutocompleteSuggestions
    };

    /**
     * Checks if the autocomplete index enabled for the repository with id <code>repositoryId</code> and location <code>repositoryLocation</code>.
     * If the repository ID and repository location are not provided, the currently selected repository will be used.
     *
     * @param {string | undefined} repositoryId - The repository id.
     * @param {string | undefined} repositoryLocation - The repository location.
     * @return {Promise<boolean>} if autocomplete is enabled.
     */
    function checkAutocompleteStatus(repositoryId, repositoryLocation) {
        if (repositoryId) {
            return $http.get(AUTOCOMPLETE_ENABLED_ENDPOINT, {
                headers: {
                    'X-GraphDB-Repository': repositoryId,
                    'X-GraphDB-Repository-Location': repositoryLocation
                }
            });
        }
        return $http.get(AUTOCOMPLETE_ENABLED_ENDPOINT);
    }

    function toggleAutocomplete(newValue) {
        return $http.post(`${AUTOCOMPLETE_ENABLED_ENDPOINT}?enabled=${newValue}`);
    }

    function refreshIndexIRIs() {
        return $http.get(AUTOCOMPLETE_IRIS_ENDPOINT);
    }

    function toggleIndexIRIs(newValue) {
        return $http.post(`${AUTOCOMPLETE_IRIS_ENDPOINT}?enabled=${newValue}`);
    }

    function buildIndex() {
        return $http.post(`${AUTOCOMPLETE_ENDPOINT}/reindex`);
    }

    function interruptIndexing() {
        return $http.post(`${AUTOCOMPLETE_ENDPOINT}/interrupt`);
    }

    function refreshIndexStatus() {
        return $http.get(`${AUTOCOMPLETE_ENDPOINT}/status`);
    }

    function checkForPlugin() {
        return $http.get(`${AUTOCOMPLETE_ENDPOINT}/plugin-found`);
    }

    function getAutocompleteSuggestions(str, cancelerPromise) {
        return $http.get(`${AUTOCOMPLETE_ENDPOINT}/query`, {
            params: {
                q: str
            },
            timeout: cancelerPromise
        });
    }

    function refreshLabelConfig() {
        return $http.get(AUTOCOMPLETE_LABELS_ENDPOINT);
    }

    function addLabelConfig(label) {
        return $http.put(AUTOCOMPLETE_LABELS_ENDPOINT, label);
    }

    function editLabelConfig(params) {
        return $http({
            method: 'PUT',
            url: AUTOCOMPLETE_EDIT_LABEL_ENDPOINT,
            params: params
        });
    }

    function removeLabelConfig(label) {
        return $http.delete(AUTOCOMPLETE_LABELS_ENDPOINT, {
            data: label,
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            }
        });
    }
}
