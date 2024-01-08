angular
    .module('graphdb.framework.rest.export.service', [])
    .factory('ExportRestService', ExportRestService);

ExportRestService.$inject = ['$http', '$repositories', '$translate'];

const REPOSITORIES_ENDPOINT = 'repositories';
function ExportRestService($http, $repositories, $translate) {
    return {
        getExportedStatementsAsJSONLD
    };

    function getExportedStatementsAsJSONLD(contextID, repo, graphsByValue, acceptHeader, linkHeader, auth) {
        let url;
        if (contextID) {
            url = `${REPOSITORIES_ENDPOINT}/${repo.id}/statements?infer=false&context=${graphsByValue[contextID.value].exportUri}&location=${encodeURIComponent(repo.location)}`;
        } else {
            url = `${REPOSITORIES_ENDPOINT}/${repo.id}/statements?infer=false&location=${encodeURIComponent(repo.location)}`;
        }

        if (auth) {
            url = url + '&authToken=' + encodeURIComponent(auth);
        }

        if (linkHeader === undefined) {
            linkHeader = "";
        }

        return $http.get({
            url: url,
            method: 'GET',
            headers: {
                'Accept': acceptHeader,
                'Link': linkHeader
            },
            responseType: "blob"
        }, {timeout: 100}).then(function (res) {
            const data = res.data;
            const headers = res.headers();
            const contentDisposition = headers['content-disposition'];
            let filename = contentDisposition.split('filename=')[1];
            filename = filename.substring(0, filename.length);
            return {data, filename};
        });
    }
}
