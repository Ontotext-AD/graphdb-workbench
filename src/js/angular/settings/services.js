define([],
    function () {

        angular
            .module('graphdb.framework.settings.services', [])
            .factory('LicenseService', LicenseService);

        LicenseService.$inject = ['$http', 'Upload'];
        function LicenseService($http, Upload) {
            var factory = {};

            factory.getLicenseInfo = getLicenseInfo;
            factory.sendLicenseToValidate = sendLicenseToValidate;
            factory.extractFromLicenseFile = extractFromLicenseFile;
            factory.checkLicenseHardcoded = checkLicenseHardcoded;
            factory.registerLicense = registerLicense;

            return factory;

            // get activated license details
            function getLicenseInfo() {
                return $http.get('rest/graphdb-settings/license');
            }

            // send license to be validated and parsed before activation
            function sendLicenseToValidate(licenseCode) {
                var headers = {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'text/plain'
                            }
                        };
                return $http.post('rest/info/license/validate', licenseCode, headers);
            }

            // read license file on backend and send string content back
            function extractFromLicenseFile(file) {
                return Upload.upload({
                    url: 'rest/info/license/toBase64',
                    file: file,
                    headers: {
                        'Accept': 'text/plain'
                    }
                });
            }

            // send license code to GraphDB for activation
            function registerLicense(licenseCode) {
                 var array = new Uint8Array(licenseCode.length);
                 for (var i = 0; i < array.length; i++) {
                    array[i] = licenseCode.charCodeAt(i);
                 }

                 var request = {
                            method: 'POST',
                            url: 'rest/graphdb-settings/license',
                            headers: {
                                'Content-Type': 'application/octet-stream',
                            },
                            data: array,
                            transformRequest: []
                        };
                return $http(request);
            }

            // check if distribution has an already activated license
            function checkLicenseHardcoded() {
                return $http.get('rest/graphdb-settings/license/hardcoded');
            }
        }
    });
