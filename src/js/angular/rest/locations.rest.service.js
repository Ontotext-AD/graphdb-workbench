angular
    .module('graphdb.framework.rest.locations.service', [])
    .factory('LocationsRestService', LocationsRestService);

LocationsRestService.$inject = ['$http'];

const LOCATIONS_ENDPOINT = 'rest/locations';
const ACTIVE_LOCATION_ENDPOINT = `${LOCATIONS_ENDPOINT}/active`;

function LocationsRestService($http) {

    return {
        getLocations,
        addLocation,
        editLocation,
        deleteLocation,
        getActiveLocation,
        setDefaultRepository
    };

    function getLocations() {
        return $http.get(LOCATIONS_ENDPOINT);
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
            noCancelOnRouteChange: true
        });
    }

    function setDefaultRepository(repositoryId) {
        return $http({
            url: `${ACTIVE_LOCATION_ENDPOINT}/default-repository`,
            method: 'POST',
            data: {
                defaultRepository: repositoryId
            }
        });
    }
}
