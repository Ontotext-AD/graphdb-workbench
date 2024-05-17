import {ComponentStoreService} from "./core/services/component-store.service";

export const GlobalPropertyName = {
    ACTIVE_REPOSITORY: 'ACTIVE_REPOSITORY'
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
        updateActiveRepository(selectedRepo);
    };

    const context = new ComponentStoreService(GlobalEmitterBuss);

    const getActiveRepository = () => {
        return context.get(GlobalPropertyName.ACTIVE_REPOSITORY);
    };

    const updateActiveRepository = (newRepository) => {
        if (newRepository) {
            LocalStorageAdapter.set(LSKeys.REPOSITORY_ID, newRepository.id);
            LocalStorageAdapter.set(LSKeys.REPOSITORY_LOCATION, newRepository.location);
        } else {
            LocalStorageAdapter.remove(LSKeys.REPOSITORY_ID);
            LocalStorageAdapter.remove(LSKeys.REPOSITORY_LOCATION);
        }
        context.update(GlobalPropertyName.ACTIVE_REPOSITORY, newRepository);
    };

    const onActiveRepositoryUpdated = (callback) => {
        return context.onUpdated(GlobalPropertyName.ACTIVE_REPOSITORY, callback);
    };

    init();

    return {
        getActiveRepository,
        updateActiveRepository,
        onActiveRepositoryUpdated
    };
}
