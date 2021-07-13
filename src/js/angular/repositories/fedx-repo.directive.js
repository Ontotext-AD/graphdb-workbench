angular
    .module('graphdb.framework.repositories.fedx-repo.directive', [])
    .directive('fedxRepo', fedxRepoDirective);

fedxRepoDirective.$inject = ['$modal', 'RepositoriesRestService', 'toastr', '$timeout'];

function fedxRepoDirective($modal, RepositoriesRestService, toastr, $timeout) {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'js/angular/repositories/templates/fedx-repo.html',

        link: linkFunc
    };

    function linkFunc($scope) {

        const LOCAL_REPO_STORE = 'ResolvableRepository';
        const REMOTE_REPO_STORE = 'RemoteRepository';
        const SPARQL_ENDPOINT_STORE = 'SPARQLEndpoint';
        const NATIVE_STORE = 'NativeStore';

        $scope.intOptionsLabels = {
            enforceMaxQueryTime: 'Query timeout (seconds)',
            boundJoinBlockSize: 'Bound join block size',
            joinWorkerThreads: 'Join worker threads',
            leftJoinWorkerThreads: 'Left join worker threads',
            unionWorkerThreads: 'Union worker threads'
        };
        $scope.optionsOfTypeInt = Object.keys($scope.intOptionsLabels);

        $scope.boolOptionsLabels =
            {
                includeInferredDefault: 'Include inferred default',
                enableServiceAsBoundJoin: 'Enable SERVICE as bound join',
                isLogQueries: 'Log queries',
                debugQueryPlan: 'Debug query plan',
                isLogQueryPlan: 'Log query plan'
            };
        $scope.optionsOfTypeBool = Object.keys($scope.boolOptionsLabels);

        $scope.fedxMembers = [];
        $scope.localRepos = [];
        $scope.allLocalRepos = [];
        $scope.writableRepo = undefined;

        function getRepositories() {
            return RepositoriesRestService.getRepositories()
                .success(function (response) {
                    $scope.localRepos = response;
                    $scope.allLocalRepos = $scope.localRepos.slice();
                }).error(function (response) {
                    const msg = getError(response);
                    toastr.error(msg, 'Error');
                });
        }

        function populateLocalRepos() {
            for (const member of $scope.fedxMembers) {
                $scope.localRepos = $scope.localRepos.filter(repo => repo.id !== member.repositoryName);
            }
        }

        $scope.setWritableRepo = function(member) {
            if ($scope.writableRepo) {
                $scope.writableRepo.writable = "false";
            }
            member.writable = "true";
            $scope.writableRepo = member;
        }

        function getWritableRepo() {
            for (const member of $scope.fedxMembers) {
                if (member.writable === "true") {
                    $scope.writableRepo = member;
                }
            }
        }

        function getLocalRepositories() {
            getRepositories()
                .then(function () {
                    if ($scope.editRepoPage) {
                        $scope.fedxMembers = $scope.repositoryInfo.params.member.value.slice();
                    }
                    populateLocalRepos();
                    getWritableRepo();
                });
        }

        $scope.checkIfRepoExist = function (member) {
            if (member.store === LOCAL_REPO_STORE) {
                return $scope.allLocalRepos.filter(repo => repo.id === member.repositoryName).length !== 0;
            } else {
                return true;
            }
        }

        const localReposTimer = $timeout(function () {
            getLocalRepositories();
        }, 2000);

        $scope.$on('$destroy', function () {
            $timeout.cancel(localReposTimer);
        });

        $scope.addMember = function (repository) {
            let member = {
                store : LOCAL_REPO_STORE,
                repositoryName : repository.id,
                repoType : repository.type,
                respectRights: "true",
                writable: "false"
            };

            $scope.localRepos = $scope.localRepos.filter(el => el.id !== member.repositoryName);
            updateMembers(member);
        }

        $scope.removeMember = function(member) {
            $scope.fedxMembers = $scope.fedxMembers.filter(el => el !== member);
            if ($scope.writableRepo && $scope.writableRepo.repositoryName === member.repositoryName) {
                $scope.writableRepo = undefined;
            }
            if (member.store && member.store === LOCAL_REPO_STORE) {
                getRepositories()
                    .then(function () {
                        populateLocalRepos();
                        $scope.repositoryInfo.params['member'].value = $scope.fedxMembers;
                    });
            }
        }

        $scope.addRemoteMember = function () {
            $scope.mode = 'remote';
            $scope.model = {
                editMode: false,
                store: REMOTE_REPO_STORE,
                repositoryName: '',
                repositoryServer: '',
                sparqlEndpoint: '',
                supportsASKQueries : "true",
                writable: "false"
            }

            $scope.$modalInstance = $modal.open({
                templateUrl: 'js/angular/templates/modal/add-fedx-remote-repo.html',
                scope: $scope,
            });
        };

        $scope.getMemberIcon = function (member) {
            if (member.repoType) {
                return 'icon-repo-' + member.repoType;
            } else if (member.store === NATIVE_STORE) {
                return 'icon-warning';
            } else {
                return 'icon-link';
            }
        }

        $scope.editFedXRepository = function (member) {
            if (member.store === LOCAL_REPO_STORE) {
                $scope.mode = 'local';
                $scope.model = {
                    editMode : true,
                    store : member.store,
                    respectRights: member.respectRights,
                    repositoryName: member.repositoryName,
                    repoType : member.repoType,
                    writable: "false"
                }
            } else {
                $scope.mode = 'remote';
                $scope.model = {
                    editMode : true,
                    store : member.store,
                    repositoryName: member.repositoryName,
                    repositoryServer: member.repositoryServer,
                    sparqlEndpoint: member.store === SPARQL_ENDPOINT_STORE ? member.endpoint : member.repositoryLocation,
                    supportsASKQueries : member.supportsASKQueries,
                    writable: "false"
                }
            }

            $scope.$modalInstance = $modal.open({
                templateUrl: 'js/angular/templates/modal/add-fedx-remote-repo.html',
                scope: $scope
            });
        };

        $scope.resolveName = function (member) {
            switch (member.store) {
                case LOCAL_REPO_STORE : {
                    return member.repositoryName;
                }
                case REMOTE_REPO_STORE : {
                    return member.repositoryName  + '@' + member.repositoryServer;
                }
                case SPARQL_ENDPOINT_STORE : {
                    return member.endpoint;
                }
                case NATIVE_STORE : {
                    return member.repositoryLocation;
                }
                default :
                    return;
            }
        }

        $scope.cancel = function () {
            $scope.$modalInstance.dismiss('cancel');
        };

        function updateMembers(member) {
            $scope.fedxMembers.push(member);
            $scope.repositoryInfo.params['member'].value = $scope.fedxMembers;
        }

        $scope.ok = function () {
            let member;
            if ($scope.model.repositoryName && $scope.model.store === LOCAL_REPO_STORE) {
                member = {
                    store: LOCAL_REPO_STORE,
                    repositoryName: $scope.model.repositoryName,
                    repoType: $scope.model.repoType,
                    respectRights: $scope.model.respectRights,
                    writable: $scope.model.writable
                }
                $scope.fedxMembers = $scope.fedxMembers.filter(el => el.repositoryName !== member.repositoryName);

            } else if ($scope.model.repositoryName && $scope.model.store === REMOTE_REPO_STORE) {
                member = {
                    store : REMOTE_REPO_STORE,
                    repositoryName : $scope.model.repositoryName,
                    repositoryServer : $scope.model.repositoryServer,
                    writable: $scope.model.writable
                };
                $scope.fedxMembers = $scope.fedxMembers.filter(el => el.repositoryName !== member.repositoryName);

            } else {
                if ($scope.model.sparqlEndpoint.toString().includes("http://")) {
                    member = {
                        store : SPARQL_ENDPOINT_STORE,
                        endpoint : $scope.model.sparqlEndpoint,
                        supportsASKQueries : $scope.model.supportsASKQueries,
                        writable: $scope.model.writable
                    };
                    $scope.fedxMembers = $scope.fedxMembers.filter(el => el.endpoint !== member.endpoint);

                } else {
                    member = {
                        store : NATIVE_STORE,
                        repositoryLocation : $scope.model.sparqlEndpoint,
                        supportsASKQueries : $scope.model.supportsASKQueries,
                        writable: $scope.model.writable
                    };
                    $scope.fedxMembers = $scope.fedxMembers.filter(el => el.repositoryLocation !== member.repositoryLocation);
                }
            }

            updateMembers(member);
            $scope.$modalInstance.close();
        };

        getLocalRepositories();
    }
}
