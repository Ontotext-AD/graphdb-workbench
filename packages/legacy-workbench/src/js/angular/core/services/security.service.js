import 'angular/rest/ttyg.rest.service';

const modules = ['graphdb.framework.rest.security.service'];

angular
    .module('graphdb.framework.core.services.security-service', modules)
    .factory('SecurityService', SecurityService);

SecurityService.$inject = ['SecurityRestService'];

function SecurityService(SecurityRestService) {

    /**
     * Updates user data in the backend using the SecurityRestService.
     * @param {UpdateUserPayload} payload The payload to update the user data.
     * @return {Promise<*>}
     */
    const updateUserData = (payload) => {
        return SecurityRestService.updateUserData(payload);
    };

    return {
        updateUserData
    };
}
