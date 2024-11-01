angular
    .module('graphdb.framework.core.services.autocomplete', [])
    .factory('AutocompleteService', AutocompleteService);

AutocompleteService.$inject = ['AutocompleteRestService', 'LSKeys', 'LocalStorageAdapter'];


function AutocompleteService(AutocompleteRestService, LSKeys, LocalStorageAdapter) {

    const checkAutocompleteStatus = () => {
        return AutocompleteRestService.checkAutocompleteStatus()
            .then((response) => {
                LocalStorageAdapter.set(LSKeys.AUTOCOMPLETE_ENABLED, response.data);
                return response.data;
            });
    };

    return {
        checkAutocompleteStatus
    };
}
