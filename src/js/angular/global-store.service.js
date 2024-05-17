import {ComponentStoreService} from "./core/services/component-store.service";

export const GlobalPropertyName = {
    SELECTED_REPOSITORY: 'SELECTED_REPOSITORY',
    LICENSE: 'LICENSE'
};

angular
    .module('graphdb.framework.store.globalstore', [])
    .factory('GlobalStoreService', GlobalStoreService);

GlobalStoreService.$inject = ['GlobalEmitterBuss', 'LocalStorageAdapter', 'LSKeys'];

function GlobalStoreService(GlobalEmitterBuss, LocalStorageAdapter, LSKeys) {

    const init = () => {
        const repositoryId = LocalStorageAdapter.get(LSKeys.REPOSITORY_ID);
        let selectedRepo = undefined;
        if (repositoryId) {
            selectedRepo = {
                id: repositoryId,
                location: LocalStorageAdapter.get(LSKeys.REPOSITORY_LOCATION) || ''
            };
        }
        updateSelectedRepository(selectedRepo);
    };

    const context = new ComponentStoreService(GlobalEmitterBuss);

    const getSelectedRepository = () => {
        return context.get(GlobalPropertyName.SELECTED_REPOSITORY);
    };

    const updateSelectedRepository = (newRepository) => {
        if (newRepository) {
            LocalStorageAdapter.set(LSKeys.REPOSITORY_ID, newRepository.id);
            LocalStorageAdapter.set(LSKeys.REPOSITORY_LOCATION, newRepository.location);
        } else {
            LocalStorageAdapter.remove(LSKeys.REPOSITORY_ID);
            LocalStorageAdapter.remove(LSKeys.REPOSITORY_LOCATION);
        }
        context.update(GlobalPropertyName.SELECTED_REPOSITORY, newRepository);
    };

    const onSelectedRepositoryUpdated = (callback) => {
        return context.onUpdated(GlobalPropertyName.SELECTED_REPOSITORY, callback);
    };

    /**
     * @return {License}
     */
    const getLicense = () => {
        return context.get(GlobalPropertyName.LICENSE);
    };

    /**
     * @param {License} license
     */
    const updateLicense = (license) => {
        context.update(GlobalPropertyName.LICENSE, license);
    };

    /**
     * If the licence change then the <code>callback</code> functions will be called with the new license parameter.
     * @param {function} callback - The callback to be called when the event is fired.
     * @return {function} unsubscribe function.
     */
    const onLicenseUpdated = (callback) => {
        return context.onUpdated(GlobalPropertyName.LICENSE, callback);
    };

    init();

    return {
        getSelectedRepository,
        updateSelectedRepository,
        onSelectedRepositoryUpdated,
        getLicense,
        updateLicense,
        onLicenseUpdated
    };
}
