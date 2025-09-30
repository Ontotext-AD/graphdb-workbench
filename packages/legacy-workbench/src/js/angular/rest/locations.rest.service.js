angular
    .module('graphdb.framework.rest.locations.service', [])
    .factory('LocationsRestService', LocationsRestService);

LocationsRestService.$inject = ['$http'];

const LOCATIONS_ENDPOINT = 'rest/locations';
const ACTIVE_LOCATION_ENDPOINT = `${LOCATIONS_ENDPOINT}/active`;
const RPC_ADDRESS_ENDPOINT = 'rest/info/rpc-address';
const EXTERNAL_URL_ENDPOINT = 'rest/info/external-url';

function LocationsRestService($http) {
    return {
        getLocations,
        addLocation,
        editLocation,
        deleteLocation,
        getActiveLocation,
        setDefaultRepository,
        getLocationRpcAddress,
        getExternalUrl,
    };

    function getLocations(abortRequestPromise) {
        return $http.get(LOCATIONS_ENDPOINT, {}, {timeout: abortRequestPromise ? abortRequestPromise.promise : null});
    }

    function addLocation(data) {
        return $http.post(LOCATIONS_ENDPOINT, data);
    }

    function editLocation(data) {
        return $http.put(LOCATIONS_ENDPOINT, data);
    }

    function deleteLocation(uri) {
        return $http.delete(`${LOCATIONS_ENDPOINT}?uri=${uri}`);
    }

    function getActiveLocation() {
        return $http({
            method: 'GET',
            url: `${ACTIVE_LOCATION_ENDPOINT}`,
            noCancelOnRouteChange: true,
        });
    }

    function setDefaultRepository(repositoryId) {
        return $http({
            url: `${ACTIVE_LOCATION_ENDPOINT}/default-repository`,
            method: 'POST',
            data: {
                defaultRepository: repositoryId,
            },
        });
    }

    function getLocationRpcAddress(location) {
        return $http.get(`${RPC_ADDRESS_ENDPOINT}`, {
            params: {
                location,
            },
        });
    }

    /**
     * Calls the backend to fetch the external URL for Copy Agent links.
     * @returns {Promise<string>} the external URL
     */
    function getExternalUrl() {
        return $http.get(EXTERNAL_URL_ENDPOINT);
    }
}
