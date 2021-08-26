angular
    .module('graphdb.framework.rest.smart-updates.service', [])
    .factory('SmartUpdatesRestService', SmartUpdatesRestService);

SmartUpdatesRestService.$inject = ['$http'];

const SMART_UPDATES_ENDPOINT = '/rest/smart-updates';

function SmartUpdatesRestService($http) {
    return {
        getSmartUpdateTemplates,
        getSmartUpdateTemplate,
        createSmartUpdateTemplate,
        updateSmartUpdateTemplate,
        deleteSmartUpdateTemplate
    };

    function getSmartUpdateTemplates() {
        return $http.get(`${SMART_UPDATES_ENDPOINT}/templates`);
    }

    function getSmartUpdateTemplate(templateName) {
        return $http.get(`${SMART_UPDATES_ENDPOINT}/templates/${encodeURIComponent(templateName)}`);
    }

    function createSmartUpdateTemplate(template) {
        return $http.post(`${SMART_UPDATES_ENDPOINT}/templates/`, {
            name: template.name,
            query: template.query
        });
    }

    function updateSmartUpdateTemplate(template) {
        return $http.put(`${SMART_UPDATES_ENDPOINT}/templates/${encodeURIComponent(template.name)}`,
            template.query,
            {
                headers: {
                    'Content-Type': 'text/html'
                }
            });
    }

    function deleteSmartUpdateTemplate(templateName) {
        return $http.delete(`${SMART_UPDATES_ENDPOINT}/templates/${encodeURIComponent(templateName)}`);
    }
}
