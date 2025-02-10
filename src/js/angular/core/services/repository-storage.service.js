import 'angular/core/services';

const modules = [];

    angular
        .module('graphdb.framework.core.services.repository-storage', modules)
        .factory('RepositoryStorage', RepositoryStorage);

    RepositoryStorage.$inject = ['LocalStorageAdapter', 'LSKeys'];

function RepositoryStorage(LocalStorageAdapter, LSKeys) {
    /**
     * Retrieves the active repository ID from local storage.
     *
     * @returns {string|undefined} The active repository ID, or undefined if not set.
     */
    const getActiveRepository = () => {
        return LocalStorageAdapter.get(LSKeys.REPOSITORY_ID) || undefined;
    }

    /**
     * Retrieves the active repository object from local storage.
     *
     * @returns {Object} An object containing the repository id and location.
     *                   Returns empty strings if the values are not set.
     */
    const getActiveRepositoryObject = () => {
        return {
            id: LocalStorageAdapter.get(LSKeys.REPOSITORY_ID) || '',
            location: LocalStorageAdapter.get(LSKeys.REPOSITORY_LOCATION) || ''
        }
    };

    /**
     * Sets the active repository in local storage.
     *
     * @param {string} id - The repository ID.
     * @param {string} location - The repository location.
     */
    const setActiveRepository = (id, location) => {
        LocalStorageAdapter.set(LSKeys.REPOSITORY_ID, id);
        LocalStorageAdapter.set(LSKeys.REPOSITORY_LOCATION, location);
    }

    /**
     * Unsets the active repository from local storage.
     */
    const unsetActiveRepository = () => {
        LocalStorageAdapter.remove(LSKeys.REPOSITORY_ID);
        LocalStorageAdapter.remove(LSKeys.REPOSITORY_LOCATION);
    }


    return {
        getActiveRepository,
        getActiveRepositoryObject,
        setActiveRepository,
        unsetActiveRepository
    }
}
