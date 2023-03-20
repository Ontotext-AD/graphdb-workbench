angular
    .module('graphdb.framework.repositories.fedx-repo.directive', [])
    .directive('fedxRepo', fedxRepoDirective);

fedxRepoDirective.$inject = ['$uibModal', 'RepositoriesRestService', 'toastr', '$timeout'];

function fedxRepoDirective($uibModal, RepositoriesRestService, toastr, $timeout) {
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

        $scope.fedxMembers = [];
        $scope.localRepos = [];
        $scope.allLocalRepos = [];

        function getRepositories() {
            return RepositoriesRestService.getRepositories()
                .success(function (response) {
                    $scope.allLocalRepos = response.slice();
                }).error(function (response) {
                    const msg = getError(response);
                    toastr.error(msg, 'Error');
                });
        }

        function getRepositoriesFromLocation(location) {
            return RepositoriesRestService.getRepositoriesFromKnownLocation(location)
                .success(function (response) {
                    $scope.knownRepos = $scope.allLocalRepos.filter(el => $scope.knownRepos.indexOf(el) !== -1);
                    for (const member of response) {
                        $scope.allAttachedRepos = $scope.allAttachedRepos.filter(repo => repo.id !== member.id || repo.location !== member.location);
                    }
                    $scope.allAttachedRepos = $scope.allAttachedRepos.concat(response.slice());
                    $scope.knownRepos = $scope.knownRepos.concat($scope.allAttachedRepos);
                }).error(function (response) {
                    const msg = getError(response);
                    toastr.error(msg, 'Error');
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
            return getRepositories()
                .then(function () {
                    getAttachedRepositories();
                });
        }

        function getLocations() {
            return LocationsRestService.getLocations()
                .success(function(response) {
                    $scope.locations = response.slice();
                }).error(function (response) {
                    const msg = getError(response);
                    toastr.error(msg, 'Error');
                });
        }

        function getAttachedRepositories() {
            return getLocations()
                .then(function() {
                    $scope.locations.forEach(l => getRepositoriesFromLocation(l.uri)
                        .then(function () {
                            if ($scope.editRepoPage) {
                                $scope.fedxMembers = $scope.repositoryInfo.params.member.value.slice();
                            }
                            populateKnownRepos();
                        }))
                });
        }

        $scope.checkIfRepoExist = function (member) {
            if (member.store === LOCAL_REPO_STORE) {
                return $scope.allLocalRepos.find(repo => repo.id === member.repositoryName);
            } else if (member.store === REMOTE_REPO_STORE && checkIfLocationIsAttached(member)) {
                return $scope.allAttachedRepos.find(repo => repo.id === member.repositoryName && repo.location === member.repositoryServer);
            } else {
                return true;
            }
        }

        function checkIfLocationIsAttached(repo) {
            return $scope.locations.find(el => el.uri === repo.repositoryServer);
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
            if ($scope.getRepositoryServer(repository) === "Local") {
                $scope.addLocalMember(repository);
            } else {
                let member = {
                    store: REMOTE_REPO_STORE,
                    repositoryName: repository.id,
                    repositoryServer: repository.location,
                    username: '',
                    password: '',
                    supportsASKQueries: "true",
                    writable: "false"
                }
                $scope.knownRepos = $scope.knownRepos.filter(function (repo) {
                    if (member.repositoryServer) {
                        return repo.id !== member.repositoryName || repo.location !== member.repositoryServer;
                    } else {
                        return repo.id !== member.repositoryName || !repo.local;
                    }
                });
                updateMembers(member);
            }
        }

        $scope.addLocalMember = function (repository) {
            let member = {
                store: LOCAL_REPO_STORE,
                repositoryName: repository.id,
                repoType: repository.type,
                respectRights: "true",
                writable: "false"
            };

            $scope.knownRepos = $scope.knownRepos.filter(function (repo) {
                if (member.repositoryServer) {
                    return repo.id !== member.repositoryName || repo.location !== member.repositoryServer;
                } else {
                    return repo.id !== member.repositoryName || !repo.local;
                }
            });            updateMembers(member);
        }

        $scope.removeMember = function (member) {
            if (member.store && member.store === LOCAL_REPO_STORE) {
                $scope.fedxMembers = $scope.fedxMembers.filter(el => el.repositoryName !== member.repositoryName || el.store !== member.store);
                $scope.allLocalRepos = [];
                getKnownRepos();
            } else if (member.store && member.store === SPARQL_ENDPOINT_STORE) {
                $scope.fedxMembers = $scope.fedxMembers.filter(el => el.endpoint !== member.endpoint);
            } else if (member.store && member.store === NATIVE_STORE) {
                $scope.fedxMembers = $scope.fedxMembers.filter(el => el.repositoryLocation !== member.repositoryLocation);
            } else if (member.store && member.store === REMOTE_REPO_STORE) {
                $scope.fedxMembers = $scope.fedxMembers.filter(el => el.repositoryName !== member.repositoryName
                    || el.repositoryServer !== member.repositoryServer || el.store !== member.store);
                $scope.allAttachedRepos = []
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
                    toastr.error(`Repository ${resolvedName} already added as a FedX member`);
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
                    toastr.error(`SPARQL endpoint ${resolvedName} already added as a FedX member`);
                    $scope.$uibModalInstance.close();
                    return;
                }

                $scope.fedxMembers = $scope.fedxMembers.filter(el => el.endpoint !== member.endpoint);
            }

            updateMembers(member);
            $scope.$uibModalInstance.close();
        };

        getKnownRepos();
    }
}
