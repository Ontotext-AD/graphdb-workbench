import 'angular/rest/autocomplete.rest.service';

angular
    .module('graphdb.framework.core.services.autocomplete', ['graphdb.framework.rest.autocomplete.service'])
    .factory('AutocompleteService', AutocompleteService);

AutocompleteService.$inject = ['AutocompleteRestService', 'LSKeys', 'LocalStorageAdapter'];


function AutocompleteService(AutocompleteRestService, LSKeys, LocalStorageAdapter) {

    /**
     * Checks if the autocomplete index enabled for the repository with id <code>repositoryId</code> and location <code>repositoryLocation</code>.
     * If the repository ID and repository location are not provided, the currently selected repository will be used.
     *
     * @param {string | undefined} repositoryId - The repository id.
     * @param {string | undefined} repositoryLocation - The repository location.
     * @return {Promise<boolean>} if autocomplete is enabled.
     */
    const checkAutocompleteStatus = (repositoryId, repositoryLocation) => {
        return AutocompleteRestService.checkAutocompleteStatus(repositoryId, repositoryLocation)
            .then((response) => {
                LocalStorageAdapter.set(LSKeys.AUTOCOMPLETE_ENABLED, response.data);
                return response.data;
            });
    };

    return {
        checkAutocompleteStatus
    };
}
