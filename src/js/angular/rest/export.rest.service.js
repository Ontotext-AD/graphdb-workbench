angular
    .module('graphdb.framework.rest.export.service', [])
    .factory('ExportRestService', ExportRestService);

ExportRestService.$inject = ['$http', '$repositories', '$translate'];

const REPOSITORIES_ENDPOINT = 'repositories';
function ExportRestService($http, $repositories, $translate) {
    return {
        getExportedStatementsAsJSONLD
    };

    /*
     *
     * @method getExportedStatementsAsJSONLD
     * @param {String} data format
     * @param {Boolean} true if the method is invoked for export of multiple selected graphs
     * @param {Object} current repository
     * @param {Object} graphsByValue
     * @param {Object} authentication token
     * @param {Object} request Accept and Link headers
     */
    function getExportedStatementsAsJSONLD(context, repo, graphsByValue, auth, headers) {
        const url = `${REPOSITORIES_ENDPOINT}/${repo.id}/statements?infer=false`;
        const params = {
            location: repo.location
        };

        const httpHeaders = {
            accept: headers.accept
        };

        if (Array.isArray(context)) {
            params.context = context.map((value) => decodeURIComponent(value));
        } else {
            if (context) {
                params.context = decodeURIComponent(graphsByValue[context.value].exportUri);
            }
        }

        if (auth) {
            params.authToken = auth;
        }

        if (headers.link && headers.link !== '') {
            httpHeaders.link = headers.link;
        }

        return $http({
            url: url,
            method: 'GET',
            params: params,
            headers: httpHeaders,
            responseType: 'blob'
        }).then(function (res) {
            const data = res.data;
            const headers = res.headers();
            const contentDisposition = headers['content-disposition'];
            let filename = contentDisposition.split('filename=')[1];
            filename = filename.substring(0, filename.length);
            return {data, filename};
        });
    }
}
