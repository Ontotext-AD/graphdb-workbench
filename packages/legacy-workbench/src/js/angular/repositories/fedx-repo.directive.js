angular
    .module('graphdb.framework.repositories.fedx-repo.directive', [])
    .directive('fedxRepo', fedxRepoDirective);

fedxRepoDirective.$inject = ['$uibModal', 'RepositoriesRestService', 'toastr', '$translate'];

function fedxRepoDirective($uibModal, RepositoriesRestService, toastr, $translate) {
    return {
        restrict: 'E',
        scope: true,
        templateUrl: 'js/angular/repositories/templates/fedx-repo.html',

        link: linkFunc
    };

    function linkFunc($scope) {

        const LOCAL_REPO_STORE = 'ResolvableRepository';
        const REMOTE_REPO_STORE = 'RemoteRepository';
        const SPARQL_ENDPOINT_STORE = 'SPARQLEndpoint';
        const NATIVE_STORE = 'NativeStore';

        $scope.fedxMembers = [];
        $scope.knownRepos = [];
        $scope.allAttachedRepos = [];

        if ($scope.editRepoPage) {
            $scope.fedxMembers = $scope.repositoryInfo.params.member.value.slice();
        }

        function getRepositories() {
            return RepositoriesRestService.getRepositories($scope.repositoryInfo.location)
                .success(function (response) {
                    let repos = [];
                    _.values(response).forEach((value) => {
                        repos.push.apply(repos, value);
                    });
                    $scope.allAttachedRepos = _.cloneDeep(repos);
                }).error(function (response) {
                    const msg = getError(response);
                    toastr.error(msg, $translate.instant('common.error'));
                });
        }

        function populateKnownRepos() {
            for (const member of $scope.fedxMembers) {
                $scope.knownRepos = $scope.knownRepos.filter(function (repo) {
                    if (member.repositoryServer) {
                        // if the member is a remote attached member
                        return repo.id !== member.repositoryName || repo.location !== member.repositoryServer;
                    } else {
                        // if the member is a local one
                        return repo.id !== member.repositoryName || !repo.local;
                    }
                });
            }
        }

        $scope.setWritableRepo = function (member) {
            let currentWritable = getWritableRepo();
            if (currentWritable) {
                if (currentWritable.store === LOCAL_REPO_STORE && (member.store !== LOCAL_REPO_STORE || currentWritable.repositoryName !== member.repositoryName) ) {
                    currentWritable.writable = 'false';
                } else if (currentWritable.store === REMOTE_REPO_STORE && (member.store !== REMOTE_REPO_STORE || currentWritable.repositoryName !== member.repositoryName || currentWritable.repositoryServer !== member.repositoryServer)) {
                    currentWritable.writable = 'false';
                }
            }
            member.writable = JSON.stringify(member.writable === 'false');
        }

        $scope.getActiveClass = function (member) {
            return member.writable === 'true' ? ' active' : '';
        }

        function getWritableRepo() {
            return $scope.fedxMembers.find(member => member.writable === "true");
        }

        function getKnownRepos() {
            getRepositories()
                .then(function () {
                    $scope.knownRepos = $scope.allAttachedRepos.slice();
                    populateKnownRepos();
                });
        }

        $scope.checkIfRepoExist = function (member) {
            if (!$scope.allAttachedRepos.length) {
                return true;
            }
            if (member.store === LOCAL_REPO_STORE) {
                return $scope.allAttachedRepos.find(repo => repo.id === member.repositoryName && !repo.location);
            } else if (member.store === REMOTE_REPO_STORE) {
                return $scope.allAttachedRepos.find(repo => repo.id === member.repositoryName && repo.location === member.repositoryServer);
            } else {
                return true;
            }
        }

        $scope.getRepositoryServer = function (repo) {
            if (repo.local) {
                return "Local";
            } else {
                return repo.location;
            }
        }

        const localReposTimer = setInterval(function () {
            getKnownRepos();
        }, 5000);

        $scope.$on('$destroy', function () {
            clearInterval(localReposTimer);
        });

        $scope.addMember = function(repository) {
            let member;
            if ($scope.getRepositoryServer(repository) === "Local") {
                member = {
                    store: LOCAL_REPO_STORE,
                    repositoryName: repository.id,
                    repoType: repository.type,
                    respectRights: "true",
                    writable: "false"
                };
            } else {
                member = {
                    store: REMOTE_REPO_STORE,
                    repositoryName: repository.id,
                    repositoryServer: repository.location,
                    username: '',
                    password: '',
                    supportsASKQueries: "true",
                    writable: "false"
                };
            }
            $scope.knownRepos = $scope.knownRepos.filter(repo => repo.id !== repository.id || repo.location !== repository.location);
            updateMembers(member);
        }

        $scope.removeMember = function (member) {
            if (member.store && member.store === LOCAL_REPO_STORE) {
                $scope.fedxMembers = $scope.fedxMembers.filter(el => el.store !== member.store || el.repositoryName !== member.repositoryName && !el.repositoryServer);
                getKnownRepos();
            } else if (member.store && member.store === SPARQL_ENDPOINT_STORE) {
                $scope.fedxMembers = $scope.fedxMembers.filter(el => el.endpoint !== member.endpoint);
            } else if (member.store && member.store === NATIVE_STORE) {
                $scope.fedxMembers = $scope.fedxMembers.filter(el => el.repositoryLocation !== member.repositoryLocation);
            } else if (member.store && member.store === REMOTE_REPO_STORE) {
                $scope.fedxMembers = $scope.fedxMembers.filter(el => el.store !== member.store || el.repositoryName !== member.repositoryName
                                                                                                || el.repositoryServer !== member.repositoryServer);
                getKnownRepos();
            }
            $scope.repositoryInfo.params['member'].value = $scope.fedxMembers;
        }

        $scope.addRemoteMember = function () {
            $scope.mode = 'remote';
            $scope.model = {
                editMode: false,
                store: REMOTE_REPO_STORE,
                repositoryName: '',
                repositoryServer: '',
                sparqlEndpoint: '',
                username: '',
                password: '',
                supportsASKQueries: "true",
                writable: "false"
            }

            $scope.$uibModalInstance = $uibModal.open({
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
                    editMode: true,
                    store: member.store,
                    respectRights: member.respectRights,
                    repositoryName: member.repositoryName,
                    repoType: member.repoType,
                    writable: member.writable
                }
            } else {
                $scope.mode = 'remote';
                $scope.model = {
                    editMode: true,
                    store: member.store,
                    repositoryName: member.repositoryName,
                    repositoryServer: member.repositoryServer,
                    sparqlEndpoint: member.store === SPARQL_ENDPOINT_STORE ? member.endpoint : member.repositoryLocation,
                    username: member.username,
                    password: member.password,
                    supportsASKQueries: member.supportsASKQueries,
                    writable: member.writable
                }
            }

            $scope.$uibModalInstance = $uibModal.open({
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
                    return member.repositoryName + '@' + member.repositoryServer;
                }
                case SPARQL_ENDPOINT_STORE : {
                    return member.endpoint;
                }
                case NATIVE_STORE : {
                    return member.repositoryLocation;
                }
                default :
                    return "";
            }
        }

        $scope.cancel = function () {
            $scope.$uibModalInstance.dismiss('cancel');
        };

        function updateMembers(member) {
            $scope.fedxMembers.push(member);
            $scope.repositoryInfo.params['member'].value = $scope.fedxMembers;
        }

        function removeEndingSlash(url) {
            return url.slice(-1) === '/' ? url.slice(0, -1) : url
        }

        function checkEditMode() {
            return $scope.editRepoPage && !$scope.editRepoPage || !$scope.model.editMode;
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
                $scope.fedxMembers = $scope.fedxMembers.filter(el => el.repositoryName !== member.repositoryName || el.store !== member.store );
            } else if ($scope.model.repositoryName && $scope.model.store === REMOTE_REPO_STORE) {
                member = {
                    store: REMOTE_REPO_STORE,
                    repositoryName: $scope.model.repositoryName,
                    repositoryServer: removeEndingSlash($scope.model.repositoryServer),
                    username: $scope.model.username,
                    password: $scope.model.password,
                    writable: $scope.model.writable
                };
                if (checkEditMode() && $scope.fedxMembers.find(el => el.repositoryName === member.repositoryName
                    && el.repositoryServer === member.repositoryServer)) {
                    let resolvedName = $scope.resolveName(member);
                    toastr.error($translate.instant('fedx.repo.already.added.member.error', {name: resolvedName}));
                    $scope.$uibModalInstance.close();
                    return;
                }
                $scope.fedxMembers = $scope.fedxMembers.filter(el => el.repositoryName !== member.repositoryName
                    || el.repositoryServer !== member.repositoryServer);
            } else {
                member = {
                    store: SPARQL_ENDPOINT_STORE,
                    endpoint: removeEndingSlash($scope.model.sparqlEndpoint),
                    username: $scope.model.username,
                    password: $scope.model.password,
                    supportsASKQueries: $scope.model.supportsASKQueries,
                    writable: $scope.model.writable
                };

                if (checkEditMode() && $scope.fedxMembers.find(el => el.endpoint === member.endpoint)) {
                    let resolvedName = $scope.resolveName(member);
                    toastr.error($translate.instant('fedx.repo.already.added.sparql.endpoint.error', {name: resolvedName}));
                    $scope.$uibModalInstance.close();
                    return;
                }

                $scope.fedxMembers = $scope.fedxMembers.filter(el => el.endpoint !== member.endpoint);
            }

            updateMembers(member);
            populateKnownRepos();
            $scope.$uibModalInstance.close();
        };

        $scope.$on('changedLocation', function () {
            $scope.fedxMembers = [];
            getKnownRepos();
        });

        getKnownRepos();
    }
}
