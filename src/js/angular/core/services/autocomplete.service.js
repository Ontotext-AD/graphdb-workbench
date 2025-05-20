import 'angular/rest/autocomplete.rest.service';

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
                return response.data;
            });
    };

    const addLabelConfig = (label) => {
        return AutocompleteRestService.addLabelConfig(label);
    }

    const editLabelConfig = (updatedLabel, originalLabel) => {
        const params = {};

        if (originalLabel) {
            params['oldLabel'] = originalLabel;
        }

        if (updatedLabel) {
            params['newLabel'] = updatedLabel;
        }

        return AutocompleteRestService.editLabelConfig(params);
    }

    const removeLabelConfig = (label) => {
        return AutocompleteRestService.removeLabelConfig(label);
    }

    const interruptIndexing = () => {
        return AutocompleteRestService.interruptIndexing();
    }

    const buildIndex = () => {
        return AutocompleteRestService.buildIndex();
    }

    const toggleIndexIRIs = (newValue) => {
        return AutocompleteRestService.toggleIndexIRIs(newValue);
    }

    const checkForPlugin = () => {
        return AutocompleteRestService.checkForPlugin();
    }

    const refreshLabelConfig = () => {
        return AutocompleteRestService.refreshLabelConfig();
    }

    const refreshIndexStatus = () => {
        return AutocompleteRestService.refreshIndexStatus();
    }

    const refreshIndexIRIs = () => {
        return AutocompleteRestService.refreshIndexIRIs();
    }

    const toggleAutocomplete = (newValue) => {
        return AutocompleteRestService.toggleAutocomplete(newValue);
    }

    return {
        checkAutocompleteStatus,
        addLabelConfig,
        editLabelConfig,
        removeLabelConfig,
        interruptIndexing,
        buildIndex,
        toggleIndexIRIs,
        checkForPlugin,
        refreshLabelConfig,
        refreshIndexStatus,
        refreshIndexIRIs,
        toggleAutocomplete
    };
}
