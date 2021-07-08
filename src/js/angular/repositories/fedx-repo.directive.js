angular
    .module('graphdb.framework.repositories.fedx-repo.directive', [])
    .directive('fedxRepo', fedxRepoDirective);

fedxRepoDirective.$inject = ['$modal', 'RepositoriesRestService', 'toastr'];

function fedxRepoDirective($modal, RepositoriesRestService, toastr) {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'js/angular/repositories/templates/fedx-repo.html',

        link: linkFunc
    };

    function linkFunc($scope) {

        const LOCAL_REPO_STORE = 'ResolvableRepository';
        const REMOTE_REPO_STORE = 'RemoteRepository';
        const SOARQL_ENDPOINT_STORE = 'SPARQLEndpoint';
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

        function getRepositories() {
            return RepositoriesRestService.getRepositories()
                .success(function (response) {
                    $scope.localRepos = response;
                }).error(function (response) {
                    const msg = getError(response);
                    toastr.error(msg, 'Error');
                });
        }

        function populateLocalRepos() {
            let indexesToDelete = [];
            for (let i = 0; i < $scope.fedxMembers.length; i++) {
                for (let j = 0; j < $scope.localRepos.length; j++) {
                    if ($scope.localRepos[j].id === $scope.fedxMembers[i].repositoryName) {
                        indexesToDelete.push(j);
                        break;
                    }
                }
            }
            for (let i = 0; i < indexesToDelete.length; i++) {
                $scope.localRepos.splice(indexesToDelete[i],1);
            }
        }

        function getLocalRepositories() {
            getRepositories()
                .then(function () {
                    if ($scope.editRepoPage) {
                        $scope.fedxMembers = $scope.repositoryInfo.params.member.value.slice();
                        populateLocalRepos();
                    }
                });
        }

        $scope.addMember = function (repository) {
            let member = {
                store : LOCAL_REPO_STORE,
                repositoryName : repository.id,
                repoType : repository.type
            };

            $scope.localRepos = $scope.localRepos.filter(el => el.id !== member.repositoryName);
            updateMembers(member);
        }

        $scope.removeMember = function(member) {
            $scope.fedxMembers = $scope.fedxMembers.filter(el => el !== member);
            if (member.store && member.store === LOCAL_REPO_STORE) {
                getRepositories()
                    .then(function () {
                        populateLocalRepos();
                        $scope.repositoryInfo.params['member'].value = $scope.fedxMembers;
                    });
            }
        }

        $scope.addRemoteMember = function () {
            $scope.model = {
                editMode : false,
                store : REMOTE_REPO_STORE,
                repositoryName: '',
                repositoryServer: '',
                sparqlEndpoint: ''
            }
            $scope.$modalInstance = $modal.open({
                templateUrl: 'js/angular/templates/modal/add-fedx-remote-repo.html',
                scope: $scope,
                controller: 'AddRepositoryCtrl'
            });
        };

        $scope.editLocalFedXRepository = function () {
            $scope.access_rights = "respect_access";

            $scope.$modalInstance = $modal.open({
                templateUrl: 'js/angular/templates/modal/edit-fedx-local-repo.html',
                scope: $scope,
                controller: 'AddRepositoryCtrl'
            });
        };

        $scope.getMemberIcon = function (member) {
            if (member.repoType) {
                return 'icon-repo-' + member.repoType;
            }
            return 'icon-link';
        }

        $scope.editFedXRepository = function (member) {
            $scope.model = {
                editMode : true,
                store : member.store,
                repositoryName: member.repositoryName,
                repositoryServer: member.repositoryServer,
                sparqlEndpoint: member.store === 'SPARQLEndpoint' ? member.endpoint : member.repositoryLocation
            }

            $scope.$modalInstance = $modal.open({
                templateUrl: 'js/angular/templates/modal/add-fedx-remote-repo.html',
                scope: $scope,
                controller: 'AddRepositoryCtrl'
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
                default :
                    return
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
            if ($scope.model.repositoryName) {
                member = {
                    store : REMOTE_REPO_STORE,
                    repositoryName : $scope.model.repositoryName,
                    repositoryServer : $scope.model.repositoryServer,
                };
            } else {
                if ($scope.model.sparqlEndpoint.toString().includes("http://")) {
                    member = {
                        store : 'SPARQLEndpoint',
                        endpoint : $scope.model.sparqlEndpoint
                    };
                } else {
                    member = {
                        store : 'NativeStore',
                        repositoryLocation : $scope.model.sparqlEndpoint
                    };
                }
            }

            updateMembers(member);
            $scope.$modalInstance.close();
        };

        getLocalRepositories();
    }
}
