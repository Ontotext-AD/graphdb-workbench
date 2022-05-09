angular
    .module('graphdb.framework.rest.sparql-templates.service', [])
    .factory('SparqlTemplatesRestService', SparqlTemplatesRestService);

SparqlTemplatesRestService.$inject = ['$http'];

const REPOSITORIES_BASE_URL = 'rest/repositories/';
const SPARQL_TEMPLATES_URL = '/sparql-template';

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
        return $http.post(`${REPOSITORIES_BASE_URL}${repositoryID}${SPARQL_TEMPLATES_URL}/create`, {
            templateID: template.templateID,
            query: template.query
        });
    }

    function updateSparqlTemplate(template, repositoryID) {
        return $http.put(`${REPOSITORIES_BASE_URL}${repositoryID}${SPARQL_TEMPLATES_URL}/edit`,
            template.query,
            {
                params : {
                    'templateID': template.templateID
                },
                headers: {
                    'Content-Type': 'text/html'
                }
            });
    }

    function deleteSparqlTemplate(templateID, repositoryID) {
        return $http.delete(`${REPOSITORIES_BASE_URL}${repositoryID}${SPARQL_TEMPLATES_URL}/delete`,
            {
                params : {
                    'templateID': templateID
                }
            });
    }
}
