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
    function getExportedStatementsAsJSONLD(context, forSelectedGraphs, repo, graphsByValue, auth, headers) {
        const url = `${REPOSITORIES_ENDPOINT}/${repo.id}/statements?infer=false`;
        let contextParam = null;
        let locationParam = null;
        let authTokenParam = null;

        if (forSelectedGraphs) {
            contextParam += context;
        } else {
            if (context) {
                contextParam = graphsByValue[context.value].exportUri;
            }
            locationParam = encodeURIComponent(repo.location);
        }

        if (auth) {
            authTokenParam = encodeURIComponent(auth);
        }

        if (headers.link === undefined) {
            headers.link = '';
        }

        return $http({
            url: url,
            method: 'GET',
            params: {
                context: contextParam,
                location: locationParam,
                authToken: authTokenParam
            },
            headers: {
                'Accept': headers.accept,
                'Link': headers.link
            },
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
