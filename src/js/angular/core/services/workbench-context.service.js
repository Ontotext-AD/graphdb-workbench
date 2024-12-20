import {cloneDeep, isEqual} from "lodash";
import {NamespacesListModel} from "../../models/namespaces/namespaces-list";

angular
    .module('graphdb.core.services.workbench-context', [])
    .factory('WorkbenchContextService', WorkbenchContextService);

WorkbenchContextService.$inject = ['EventEmitterService'];

/**
 * Context service that holds global states for the workbench, such as whether autocomplete is enabled
 * for the selected repository or the namespaces of the selected repository.
 *
 * @param {EventEmitterService} EventEmitterService
 * @constructor
 */
function WorkbenchContextService(EventEmitterService) {

    /**
     * Holds the ID of the selected repository.
     * @type {string | undefined}
     * @private
     */
    let _selectedRepositoryId = undefined;

    /**
     * Flag that indicates whether the autocomplete functionality is enabled.
     * @type {boolean}
     * @private
     */
    let _autocompleteEnabled = false;

    /**
     * Updates the selected repository id and emits the 'selectedRepositoryIdUpdated' event to notify listeners that selected repository id changed.
     *
     * @param {string | undefined} selectedRepositoryId
     */
    const setSelectedRepositoryId = (selectedRepositoryId) => {
        if (_selectedRepositoryId !== selectedRepositoryId) {
            _selectedRepositoryId = selectedRepositoryId;
            EventEmitterService.emitSync(WorkbenchEventName.SELECTED_REPOSITORY_ID_UPDATED, getSelectedRepositoryId());
        }
    };

    /**
     *
     * @return {string} the selected repository id.
     */
    const getSelectedRepositoryId = () => {
        return _selectedRepositoryId;
    };

    /**
     * Subscribes to the 'selectedRepositoryIdUpdated' event.
     * @param {function} callback - The callback to be called when the event is fired.
     *
     * @return {function} unsubscribe function.
     */
    const onSelectedRepositoryIdUpdated = (callback) => {
        if (angular.isFunction(callback)) {
            callback(getSelectedRepositoryId());
        }
        return EventEmitterService.subscribeSync(WorkbenchEventName.SELECTED_REPOSITORY_ID_UPDATED, (payload) => callback(payload));
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
     * Resets the workbench context to its initial state.
     */
    const resetContext = () => {
        _autocompleteEnabled = false;
        _selectedRepositoryId = undefined;
    };

    return {
        setAutocompleteEnabled,
        getAutocompleteEnabled,
        onAutocompleteEnabledUpdated,
        setSelectedRepositoryId,
        getSelectedRepositoryId,
        onSelectedRepositoryIdUpdated,
        resetContext
    };
}

export const WorkbenchEventName = {

    /**
     * This event is emitted when selected repository is changed.
     */
    SELECTED_REPOSITORY_ID_UPDATED: 'selectedRepositoryIdUpdated',

    /**
     * This event is emitted when status of autocomplete is changed.
     */
    AUTOCOMPLETE_ENABLED_UPDATED: 'autocompleteEnabledUpdated',

    /**
     * This event is emitted when the namespaces of selected repository changed.
     */
    SELECTED_REPOSITORY_NAMESPACES_UPDATED: 'selectedRepositoryNamespacesUpdated'
};
