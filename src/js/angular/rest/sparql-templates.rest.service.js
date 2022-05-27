angular
    .module('graphdb.framework.rest.sparql-templates.service', [])
    .factory('SparqlTemplatesRestService', SparqlTemplatesRestService);

SparqlTemplatesRestService.$inject = ['$http'];

const REPOSITORIES_BASE_URL = 'rest/repositories/';
const SPARQL_TEMPLATES_URL = '/sparql-templates';

function SparqlTemplatesRestService($http) {
    return {
        getSparqlTemplates,
        getSparqlTemplate,
        createSparqlTemplate,
        updateSparqlTemplate,
        deleteSparqlTemplate
    };

    function getSparqlTemplates(repositoryID) {
        return $http.get(`${REPOSITORIES_BASE_URL}${repositoryID}${SPARQL_TEMPLATES_URL}`);
    }

    function getSparqlTemplate(templateID, repositoryID) {
        return $http.get(`${REPOSITORIES_BASE_URL}${repositoryID}${SPARQL_TEMPLATES_URL}/configuration`,
            {
                params : {
                    'templateID': templateID
                }
            });
    }

    function createSparqlTemplate(template, repositoryID) {
        return $http.post(`${REPOSITORIES_BASE_URL}${repositoryID}${SPARQL_TEMPLATES_URL}`, {
            templateID: template.templateID,
            query: template.query
        });
    }

    function updateSparqlTemplate(template, repositoryID) {
        return $http.put(`${REPOSITORIES_BASE_URL}${repositoryID}${SPARQL_TEMPLATES_URL}`,
            template.query,
            {
                params : {
                    'templateID': template.templateID
                },
                headers: {
                    'Content-Type': 'text/plain'
                }
            });
    }

    function deleteSparqlTemplate(templateID, repositoryID) {
        return $http.delete(`${REPOSITORIES_BASE_URL}${repositoryID}${SPARQL_TEMPLATES_URL}`,
            {
                params : {
                    'templateID': templateID
                }
            });
    }
}
