const modules = [];

angular
    .module('graphdb.framework.ontotext-yasgui-web-component', modules)
    .factory('OntotextYasguiWebComponentService', OntotextYasguiWebComponentService);

OntotextYasguiWebComponentService.$inject = ['MonitoringRestService', 'RDF4JRepositoriesRestService', '$repositories', 'toastr', '$translate'];

function OntotextYasguiWebComponentService(MonitoringRestService, RDF4JRepositoriesRestService, $repositories, toastr, $translate) {

    const onAbortQuery = (req) => {
        if (req) {
            const repository = req.url.substring(req.url.lastIndexOf('/') + 1);
            const currentTrackAlias = req.header['X-GraphDB-Track-Alias'];
            return MonitoringRestService.deleteQuery(currentTrackAlias, repository)
                .then(() => Promise.resolve());
        }
    };

    const getRepositoryStatementsCount = () => {
        // A promise is returned because the $http of  angularjs use HttpPromise and its behavior is different than we expect.
        // Here is an article that describes the problems AngularJS HttpPromise methods break promise chain {@link https://medium.com/@ExplosionPills/angularjs-httppromise-methods-break-promise-chain-950c85fa1fe7}
        return RDF4JRepositoriesRestService.getRepositorySize()
            .then((response) => Promise.resolve(parseInt(response.data)))
            .catch(function (data) {
                const params = {
                    repo: $repositories.getActiveRepository(),
                    error: getError(data)
                };
                toastr.warning($translate.instant('query.editor.repo.size.error', params));
            });
    };

    return {
        onAbortQuery,
        getRepositoryStatementsCount
    };
}
