angular
    .module('graphdb.framework.rest.license.service', [
        'ngFileUpload'
    ])
    .factory('LicenseRestService', LicenseRestService);

LicenseRestService.$inject = ['$http', 'Upload'];

function LicenseRestService($http, Upload) {
    return {
        getInfo,
        getVersion,
        getStatistics,
        toggleStatistics
    };

    function getInfo() {
        return $http.get('rest/info/properties');
    }

    function getVersion(locationUri) {
        return $http.get('rest/info/version', {
            headers: {
                'X-GraphDB-Repository-Location': locationUri
            }
        });
    }

    // Returns a boolean as a string whether statistics collection is enabled or not
    function getStatistics() {
        return $http.get('rest/graphdb-settings/statistics');
    }

    // Toggles statistics collection
    function toggleStatistics(enable) {
        return $http({
            method: 'POST',
            url: 'rest/graphdb-settings/statistics',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: `enabled=${enable}`
        });
    }
}
