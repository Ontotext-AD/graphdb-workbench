angular
    .module('graphdb.framework.rest.export.service', [])
    .factory('ExportRestService', ExportRestService);

ExportRestService.$inject = ['$http', '$repositories', '$translate'];

const REPOSITORIES_ENDPOINT = 'repositories';
function ExportRestService($http, $repositories, $translate) {
    return {
        getExportedStatementsAsJSONLD
    };

    function getExportedStatementsAsJSONLD(contextID, repo, graphsByValue, acceptHeader, linkHeader) {
        let url;
        if (contextID) {
            url = `${REPOSITORIES_ENDPOINT}/${repo.id}/statements?infer=false&context=${graphsByValue[contextID.value].exportUri}&location=${encodeURIComponent(repo.location)}`;
        } else {
            url = `${REPOSITORIES_ENDPOINT}/${repo.id}/statements?infer=false&location=${encodeURIComponent(repo.location)}`;
        }

        return $http.get({
            url: url,
            method: 'GET',
            headers: {
                'Accept': acceptHeader,
                'Link': linkHeader
            }
        });
    }
}
