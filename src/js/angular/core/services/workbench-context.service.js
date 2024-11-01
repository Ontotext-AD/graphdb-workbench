import {cloneDeep, isEqual} from "lodash";
import {NamespacesListModel} from "../../models/namespaces/namespaces-list";

angular
    .module('graphdb.core.services.workbench-context', [])
    .factory('WorkbenchContext', WorkbenchContextService);

WorkbenchContextService.$inject = ['EventEmitterService'];

/**
 * Context service that holds global states for the workbench, such as whether autocomplete is enabled
 * for the selected repository or the namespaces of the selected repository.
 *
 * @param {EventEmitterService} EventEmitterService
 * @constructor
 */
function WorkbenchContextService(EventEmitterService) {

    let _autocompleteEnabled = undefined;
    let _selectedRepositoryNamespaces = undefined;

    const init = () => {
        _autocompleteEnabled = false;
        _selectedRepositoryNamespaces = new NamespacesListModel([]);
    };

    /**
     * Updates the "autocompleteEnabled" flag and emits the 'autocompleteEnabledUpdated' event to notify listeners that the autocomplete status is changed.
     *
     * @param {boolean} autocompleteEnabled
     */
    const setAutocompleteEnabled = (autocompleteEnabled) => {
        if (_autocompleteEnabled !== autocompleteEnabled) {
            _autocompleteEnabled = autocompleteEnabled;
            EventEmitterService.emitSync(WorkbenchEventName.AUTOCOMPLETE_ENABLED_UPDATED, getAutocompleteEnabled());
        }
    };

    /**
     *
     * @return {boolean} the status of autocomplete.
     */
    const getAutocompleteEnabled = () => {
        return _autocompleteEnabled;
    };

    /**
     * Subscribes to the 'autocompleteEnabledUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    const onAutocompleteEnabledUpdated = (callback) => {
        if (angular.isFunction(callback)) {
            callback(getAutocompleteEnabled());
        }
        return EventEmitterService.subscribeSync(WorkbenchEventName.AUTOCOMPLETE_ENABLED_UPDATED, (payload) => callback(payload));
    };

    /**
     * Updates the selected repository namespaces and emits the 'selectedRepositoryNamespacesUpdated' event to notify listeners that the selected repository namespaces are changed.
     *
     * @param {NamespacesListModel} selectedRepositoryNamespaces
     */
    const setSelectedRepositoryNamespaces = (selectedRepositoryNamespaces) => {
        if (!isEqual(_selectedRepositoryNamespaces, selectedRepositoryNamespaces)) {
            _selectedRepositoryNamespaces = cloneDeep(selectedRepositoryNamespaces);
            EventEmitterService.emitSync(WorkbenchEventName.SELECTED_REPOSITORY_NAMESPACES_UPDATED, getSelectedRepositoryNamespaces());
        }
    };

    /**
     *
     * @return {NamespacesListModel} the selected repository namespaces.
     */
    const getSelectedRepositoryNamespaces = () => {
        return _selectedRepositoryNamespaces;
    };

    /**
     * Subscribes to the 'selectedRepositoryNamespacesUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    const onSelectedRepositoryNamespacesUpdated = (callback) => {
        if (angular.isFunction(callback)) {
            callback(getSelectedRepositoryNamespaces());
        }
        return EventEmitterService.subscribeSync(WorkbenchEventName.AUTOCOMPLETE_ENABLED_UPDATED, (payload) => callback(payload));
    };

    const resetContext = () => {
        init();
    };

    init();

    return {
        setAutocompleteEnabled,
        getAutocompleteEnabled,
        onAutocompleteEnabledUpdated,
        setSelectedRepositoryNamespaces,
        getSelectedRepositoryNamespaces,
        onSelectedRepositoryNamespacesUpdated,
        resetContext
    };
}

export const WorkbenchEventName = {
    /**
     * This event is emitted when status of autocomplete is changed.
     */
    AUTOCOMPLETE_ENABLED_UPDATED: 'autocompleteEnabledUpdated',
    SELECTED_REPOSITORY_NAMESPACES_UPDATED: 'selectedRepositoryNamespacesUpdated'
};
