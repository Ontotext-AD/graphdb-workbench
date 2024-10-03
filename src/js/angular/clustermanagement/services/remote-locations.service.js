import 'angular/rest/locations.rest.service';

angular
    .module('graphdb.framework.clustermanagement.services.remote-locations', [])
    .factory('RemoteLocationsService', RemoteLocationsService);

RemoteLocationsService.$inject = ['$http', 'toastr', '$uibModal', 'LocationsRestService', '$translate'];

function RemoteLocationsService($http, toastr, $uibModal, LocationsRestService, $translate) {
    return {
        addLocationHttp,
        getLocationsWithRpcAddresses,
        createNewLocation,
        isInCluster,
        deleteLocation
    };

    function getLocationsWithRpcAddresses() {
        return getLocations()
            .then((locations) => {
                if (locations) {
                    return getRemoteLocationsRpcAddresses(locations);
                }
            });
    }

    /**
     * Sets multiple remote locations' rpc addresses. Skips local location and locations with errors
     * @param {any[]} locationsArray
     * @return {Promise<[]>} locationArray with filled rpc addresses
     */
    function getRemoteLocationsRpcAddresses(locationsArray) {
        const rpcAddressFetchers = locationsArray.filter((location) => !location.isLocal && !location.error).map((location) => {
            return getLocationRpcAddress(location)
                .then((response) => {
                    location.rpcAddress = response.data;
                    location.isAvailable = true;
                    return location;
                })
                .catch((error) => {
                    location.isAvailable = false;
                    location.error = getError(error.data, error.status);
                });
        });
        return Promise.allSettled(rpcAddressFetchers).then(() => locationsArray);
    }

    /**
     * Fetch locations and map them to a location model
     *
     * @return {*} all remote locations mapped to a location model
     */
    function getLocations() {
        return LocationsRestService.getLocations()
            .then(function (response) {
                return response.data.map((loc) => {
                    return {
                        isLocal: loc.local,
                        endpoint: loc.uri,
                        rpcAddress: loc.rpcAddress || '',
                        error: loc.errorMsg
                    };
                });
            })
            .catch(function (error) {
                const msg = getError(error.data, error.status);
                toastr.error(msg, $translate.instant('common.error'));
            });
    }

    /**
     * Fetch rpc address of a remote location
     * @param {*} location the remote location
     * @return {Promise<String>} the rpc address of the location
     */
    function getLocationRpcAddress(location) {
        return LocationsRestService.getLocationRpcAddress(location.endpoint);
    }

    function addLocationHttp(locationData) {
        let newLocation;
        return LocationsRestService.addLocation(locationData)
            .catch((error) => {
                const msg = getError(error.data, error.status);
                toastr.error(msg, $translate.instant('common.error'));
                return false;
            })
            .then((locationAdded) => {
                if (locationAdded) {
                    return getLocationsWithRpcAddresses();
                }
                return false;
            })
            .then((locations) => {
                if (locations === false) {
                    return;
                }
                newLocation = locations.find((location) => location.endpoint === locationData.uri);
                return newLocation;
            });
    }

    function createNewLocation(endpoint) {
        return {
            uri: endpoint,
            authType: 'signature',
            username: '',
            password: '',
            active: false,
            clusterMode: true,
            isLocal: false
        };
    }

    function isInCluster(clusterNodes, location) {
        return clusterNodes.some((node) => location.rpcAddress === node.address);
    }

    function deleteLocation(endpoint) {
        return LocationsRestService.deleteLocation(endpoint);
    }
}
