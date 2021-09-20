angular
    .module('graphdb.framework.rest.sparql-templates.service', [])
    .factory('SparqlTemplatesRestService', SparqlTemplatesRestService);

SparqlTemplatesRestService.$inject = ['$http'];

const SPARQL_TEMPLATES_ENDPOINT = '/rest/sparql-template';

function SparqlTemplatesRestService($http) {
    return {
        getSparqlTemplates,
        getSparqlTemplate,
        createSparqlTemplate,
        updateSparqlTemplate,
        deleteSparqlTemplate
    };

    function getSparqlTemplates() {
        return $http.get(`${SPARQL_TEMPLATES_ENDPOINT}`);
    }

    function getSparqlTemplate(templateID) {
        return $http.get(`${SPARQL_TEMPLATES_ENDPOINT}/configuration`,
            {
                params : {
                    'templateID': templateID
                }
            });
    }

    function createSparqlTemplate(template) {
        return $http.post(`${SPARQL_TEMPLATES_ENDPOINT}/create`, {
            templateID: template.templateID,
            query: template.query
        });
    }

    function updateSparqlTemplate(template) {
        return $http.put(`${SPARQL_TEMPLATES_ENDPOINT}/edit`,
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

    function deleteSparqlTemplate(templateID) {
        return $http.delete(`${SPARQL_TEMPLATES_ENDPOINT}/delete`,
            {
                params : {
                    'templateID': templateID
                }
            });
    }
}
