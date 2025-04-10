import 'angular/rest/autocomplete.rest.service';
import {AutocompleteContextService, ServiceProvider} from "@ontotext/workbench-api";

angular
    .module('graphdb.framework.core.services.autocomplete', ['graphdb.framework.rest.autocomplete.service'])
    .factory('AutocompleteService', AutocompleteService);

AutocompleteService.$inject = ['AutocompleteRestService', 'LSKeys', 'LocalStorageAdapter'];


function AutocompleteService(AutocompleteRestService, LSKeys, LocalStorageAdapter) {

    /**
     * Checks if autocomplete is enabled
     * @return {Promise<boolean>}
     */
    const checkAutocompleteStatus = () => {
        return AutocompleteRestService.checkAutocompleteStatus()
            .then((response) => {
                LocalStorageAdapter.set(LSKeys.AUTOCOMPLETE_ENABLED, response.data);
                ServiceProvider.get(AutocompleteContextService).updateAutocompleteEnabled(response.data);
                return response.data;
            });
    };

    return {
        checkAutocompleteStatus
    };
}
