angular
    .module('graphdb.framework.rest.license.service', [
        'ngFileUpload'
    ])
    .factory('LicenseRestService', LicenseRestService);

LicenseRestService.$inject = ['$http', 'Upload'];

const LICENSE_ENDPOINT = 'rest/graphdb-settings/license';
const LICENSE_INFO_ENDPOINT = 'rest/info/license/';

function LicenseRestService($http, Upload) {
    return {
        getLicenseInfo,
        getHardcodedLicense,
        sendLicenseToValidate,
        extractFromLicenseFile,
        checkLicenseHardcoded,
        registerLicense,
        unregisterLicense,
        getInfo,
        getVersion,
        getStatistics,
        toggleStatistics
    };

    // get activated license details
    function getLicenseInfo() {
        return $http.get(LICENSE_ENDPOINT);
    }

    function getHardcodedLicense() {
        return $http.get(`${LICENSE_ENDPOINT}/hardcoded`);
    }

    // send license to be validated and parsed before activation
    function sendLicenseToValidate(licenseCode) {
        const headers = {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'text/plain'
            }
        };
        return $http.post(`${LICENSE_INFO_ENDPOINT}validate`, licenseCode, headers);
    }

    // read license file on backend and send string content back
    function extractFromLicenseFile(file) {
        return Upload.upload({
            url: `${LICENSE_INFO_ENDPOINT}to-base-64`,
            file,
            headers: {
                'Accept': 'text/plain'
            }
        });
    }

    // send license code to GraphDB for activation
    function registerLicense(licenseCode) {
        const array = new Uint8Array(licenseCode.length);
        for (let i = 0; i < array.length; i++) {
            array[i] = licenseCode.charCodeAt(i);
        }

        const request = {
            method: 'POST',
            url: LICENSE_ENDPOINT,
            headers: {
                'Content-Type': 'application/octet-stream'
            },
            data: array,
            transformRequest: []
        };
        return $http(request);
    }

    function unregisterLicense() {
        var request = {
            method: 'DELETE',
            url: 'rest/graphdb-settings/license'
        };
        return $http(request);
    }

    // check if distribution has an already activated license
    function checkLicenseHardcoded() {
        return $http.get(`${LICENSE_ENDPOINT}/hardcoded`);
    }

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

    function getStatistics() {
        return $http.get('rest/graphdb-settings/statistics');
    }

    function toggleStatistics(enable) {
        return $http({
            method: 'POST',
            url: 'rest/graphdb-settings/statistics',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            data: `enabled=${enable}`
        });
    }
}
