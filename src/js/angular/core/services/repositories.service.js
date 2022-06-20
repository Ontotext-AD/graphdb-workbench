import 'angular/core/services';
import 'angular/rest/repositories.rest.service';
import 'angular/rest/locations.rest.service';
import 'angular/rest/license.rest.service';
import 'ng-file-upload/dist/ng-file-upload.min';
import 'ng-file-upload/dist/ng-file-upload-shim.min';

const modules = [
    'ngCookies',
    'graphdb.framework.rest.repositories.service',
    'graphdb.framework.rest.locations.service',
    'graphdb.framework.rest.license.service',
    'toastr'
];

const repositories = angular.module('graphdb.framework.core.services.repositories', modules);

repositories.service('$repositories', ['$http', 'toastr', '$rootScope', '$timeout', '$location', 'productInfo', '$jwtAuth',
    'RepositoriesRestService', 'LocationsRestService', 'LicenseRestService', '$translate', '$q',
    function ($http, toastr, $rootScope, $timeout, $location, productInfo, $jwtAuth,
        RepositoriesRestService, LocationsRestService, LicenseRestService, $translate, $q) {
        this.repositoryStorageName = 'com.ontotext.graphdb.repository';
        this.repositoryStorageLocationName = 'com.ontotext.graphdb.repository.location';

        this.location = {uri: '', label: 'Local', local: true};
        this.locationError = '';
        this.loading = true;
        this.repository = {
            id: localStorage.getItem(this.repositoryStorageName) || '',
            location: localStorage.getItem(this.repositoryStorageLocationName) || ''
        };
        this.locations = [this.location];
        this.repositories = new Map();
        this.locationsShouldReload = true;

        const that = this;
        const ONTOP_REPOSITORY_LABEL = 'graphdb:OntopRepository';
        const FEDX_REPOSITORY_LABEL = 'graphdb:FedXRepository';


        const loadingDone = function (err, locationError) {
            that.loading = false;
            if (err) {
                // reset location data
                that.location = {};
                that.locationError = locationError;
                that.repositories = new Map();
                that.setRepository('');

                // notify user
                if (err.statusText) {
                    toastr.error(err.statusText, $translate.instant('repositories.service.error.loading.location'));
                } else {
                    toastr.error($translate.instant('repositories.service.error.loading.location'));
                }
            }
        };

        this.resetActiveRepository = function () {
            let repositoriesFromLocation = that.repositories.get(this.repository.location);
            let existsActiveRepo = false;
            if (repositoriesFromLocation) {
                existsActiveRepo = repositoriesFromLocation.find(repo => this.repository && repo.id === this.repository.id);
            }
            if (existsActiveRepo) {
                if (!$jwtAuth.canReadRepo(this.repository)) {
                    this.setRepository('');
                } else {
                    $rootScope.$broadcast('repositoryIsSet', {newRepo: false});
                }
            } else {
                this.setRepository(
                    this.location.defaultRepository ? {id: this.location.defaultRepository, location: this.location.uri} : '');
            }
        };

        this.checkLocationsDegraded = function (quick) {
            this.locations.forEach(currentLocation => {
                // local locations are always fully supported
                if (currentLocation.local) {
                    return;
                }
                if (currentLocation.errorMsg) {
                    if (that.repositories.delete(currentLocation.uri)) {
                        that.resetActiveRepository();
                    }
                }

                LicenseRestService.getVersion(currentLocation.uri)
                    .success(function (res) {
                        if (typeof res === 'object') {
                            // New style, check version and product
                            if (res.productVersion !== productInfo.productVersion) {
                                currentLocation.degradedReason = $translate.instant('repositories.service.different.gdb.version',
                                    {location: currentLocation.name});
                            }
                        } else {
                            // Pre 7.1 style
                            currentLocation.degradedReason = $translate.instant('repositories.service.different.gdb.version',
                                {location: currentLocation.name});
                        }
                    })
                    .error(function (error) {
                        currentLocation.errorMsg = error;
                        if (!quick) {
                            that.locationsShouldReload = true;
                        }
                    });
            });
        };

        this.getDegradedReason = function () {
            let activeRepoLocation = this.locations.find(loc => loc.uri === this.repository.location);
            if (activeRepoLocation) {
                return activeRepoLocation.degradedReason;
            }
            return '';
        };

        this.clearLocationErrorMsg = function (locationUri) {
            let location = this.locations.find(loc => loc.uri === locationUri);
            if (location && location.errorMsg) {
                location.errorMsg = null;
            }
        };

        this.initQuick = function () {
            // Quick mode - used to refresh the repo list and states, skip loading if no active location
            if (this.hasActiveLocation()) {
                this.init(null, null, true);
            }
        };

        this.init = function (successCallback, errorCallback, quick) {
            this.loading = true;
            if (!quick) {
                this.locationsShouldReload = true;
            }
            LocationsRestService.getActiveLocation().then(
                function (res) {
                    if (res.data) {
                        const location = res.data;
                        if (location.active) {
                            RepositoriesRestService.getRepositories().then(function (result) {
                                    that.location = location;
                                    Object.entries(result.data).forEach(([key, value]) => {
                                        that.clearLocationErrorMsg(key);
                                        that.repositories.set(key, value);
                                    });
                                    that.resetActiveRepository();
                                    loadingDone();
                                    that.checkLocationsDegraded(quick);
                                    // Hack to get the location and repositories into the scope, needed for DefaultAuthoritiesCtrl
                                    $rootScope.globalLocation = that.location;
                                    $rootScope.globalRepositories = that.getRepositories();
                                    if (successCallback) {
                                        successCallback();
                                    }
                                },
                                function (err) {
                                    loadingDone(err);
                                    if (errorCallback) {
                                        errorCallback();
                                    }
                                });
                        }
                    } else {
                        loadingDone();
                        // no active location
                        if (quick) {
                            that.locationsShouldReload = true;
                        }
                        that.location = '';
                        that.repositories = new Map();
                        that.setRepository('');
                    }
                    $rootScope.globalLocation = that.location;
                    $rootScope.globalRepositories = that.getRepositories();
                },
                function (err) {
                    loadingDone(err);
                    if (errorCallback) {
                        errorCallback();
                    }
                });
        };

        let locationsRequestPromise;

        this.getLocations = function () {
            if (that.locationsShouldReload) {
                if (!locationsRequestPromise) {
                    this.locationsShouldReload = false;
                    this.locations = [this.location];
                    const that = this;
                    locationsRequestPromise = LocationsRestService.getLocations()
                        .then((data) => {
                            this.locations = data.data;
                            return this.locations;
                        })
                        .catch(function () {
                            // if there is an error clear the flag after some time to trigger another attempt
                            $timeout(function () {
                                that.locationsShouldReload = true;
                            }, 2000);
                        })
                        .finally(() => {
                            // when request finishes, clear the variable
                            locationsRequestPromise = null;
                        });
                }
                return locationsRequestPromise;
            }

            // if request is in progress, return its promise, else return a promise and resolve it with locations
            if (locationsRequestPromise) {
                return locationsRequestPromise;
            } else {
                const deferred = $q.defer();
                deferred.resolve(this.locations);
                return deferred.promise;
            }
        };


        this.getActiveLocation = function () {
            return this.location;
        };

        this.hasActiveLocation = function () {
            return !_.isEmpty(this.location);
        };

        this.getLocationError = function () {
            if (!this.locationError) {
                return $translate.instant('repositories.service.no.active.location');
            } else {
                return this.locationError;
            }
        };

        this.isLoadingLocation = function () {
            return this.loading;
        };

        this.getRepositories = function () {
            let repos = [];
            this.repositories.forEach(value => repos.push.apply(repos, value));
            return repos;
        };

        this.getReadableRepositories = function () {
            return _.filter(this.getRepositories(), function (repo) {
                return $jwtAuth.canReadRepo(repo);
            });
        };

        this.getWritableRepositories = function () {
            const that = this;
            return _.filter(this.getRepositories(), function (repo) {
                return $jwtAuth.canWriteRepo(repo) && !that.isActiveRepoOntopType(repo);
            });
        };

        this.getActiveRepository = function () {
            return this.repository.id;
        };

        this.getActiveRepositoryObject = function () {
            const copyThis = this;
            let repositoriesFromLocation = copyThis.repositories.get(copyThis.repository.location);
            if (repositoriesFromLocation) {
                return repositoriesFromLocation.find(repo => repo.id === copyThis.repository.id);
            }
            return null;
        };

        this.isSystemRepository = function () {
            return this.repository.id === 'SYSTEM';
        };

        this.isActiveRepoOntopType = function (repo) {
            const that = this;
            if (!repo) {
                repo = that.getActiveRepositoryObject();
            }
            let activeRepo;
            if (repo) {
                activeRepo = that.repositories.get(repo.location).find(current => current.id === repo.id);
                if (activeRepo) {
                    return activeRepo.sesameType === ONTOP_REPOSITORY_LABEL;
                }
            }

            // On F5 or refresh of page active repo first is undefined,
            // so return the following check to ensure that repositories will
            // be loaded first repo type will be evaluated properly afterwards
            return typeof activeRepo === "undefined";
        };

        this.isActiveRepoFedXType = function () {
            const that = this;
            let repo = that.getActiveRepositoryObject();
            let activeRepo;
            if (repo) {
                activeRepo = that.repositories.get(repo.location).find(current => current.id === repo.id);
                if (activeRepo) {
                    return activeRepo.sesameType === FEDX_REPOSITORY_LABEL;
                }
            }

            // On F5 or refresh of page active repo first is undefined,
            // so return the following check to ensure that repositories will
            // be loaded first repo type will be evaluated properly afterwards
            return typeof activeRepo === "undefined";
        };

        this.getLocationFromUri = function (locationUri) {
            return this.locations.find((location) => location.uri === locationUri);
        };

        this.setRepositoryHeaders = function () {
            $http.defaults.headers.common['X-GraphDB-Repository'] = this.repository ? this.repository.id : undefined;
            $.ajaxSetup()['headers'] = $.ajaxSetup()['headers'] || {};
            $.ajaxSetup()['headers']['X-GraphDB-Repository'] = this.repository ? this.repository.id : undefined;

            $http.defaults.headers.common['X-GraphDB-Repository-Location'] = this.repository ? this.repository.location : undefined;
            $.ajaxSetup()['headers'] = $.ajaxSetup()['headers'] || {};
            $.ajaxSetup()['headers']['X-GraphDB-Repository-Location'] = this.repository ? this.repository.location : undefined;
        };

        that.setRepositoryHeaders();

        this.setRepository = function (repo) {
            this.repository = repo;
            if (repo) {
                localStorage.setItem(that.repositoryStorageName, this.repository.id);
                localStorage.setItem(that.repositoryStorageLocationName, this.repository.location);
            } else {
                localStorage.removeItem(that.repositoryStorageName);
                localStorage.removeItem(that.repositoryStorageLocationName);
            }
            that.setRepositoryHeaders();
            $rootScope.$broadcast('repositoryIsSet', {newRepo: true});

            // if the current repo is unreadable by the currently logged in user (or free access user)
            // we unset the repository
            if (repo && !$jwtAuth.canReadRepo(repo)) {
                this.setRepository('');
            }
            // reset denied permissions (different repo, different rights)
            $rootScope.deniedPermissions = {};
        };

        this.getDefaultRepository = function () {
            return this.hasActiveLocation() ? this.location.defaultRepository : '';
        };

        this.setDefaultRepository = function (repo) {
            if (!this.hasActiveLocation()) {
                toastr.error($translate.instant('repositories.service.no.active.location'), $translate.instant('common.error'));
                return;
            }
            const that = this;
            LocationsRestService.setDefaultRepository(repo)
                .success(function () {
                    // XXX maybe we should reload the active location but oh well
                    that.location.defaultRepository = repo;
                })
                .error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, $translate.instant('common.error'));
                });
        };

        this.deleteLocation = function (uri) {
            return LocationsRestService.deleteLocation(encodeURIComponent(uri))
                .success(function () {
                    let activeRepo = that.getActiveRepositoryObject();
                    //Reload locations and repositories
                    if (activeRepo && activeRepo.location === uri) {
                        that.location = '';
                        that.setRepository('');
                    }
                    that.init();
                }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
            });
        };

        this.deleteRepository = function (repo) {
            return RepositoriesRestService.deleteRepository(repo)
                .success(function () {
                    that.init();
                }).error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, $translate.instant('common.error'));
                })
                .finally(() => {
                    const activeRepo = that.getActiveRepositoryObject();
                    if (activeRepo && activeRepo.id === repo.id && activeRepo.location === repo.location) {
                        that.setRepository('');
                    }
                });
        };

        this.restartRepository = function (repository) {
            return RepositoriesRestService.restartRepository(repository)
                .success(function () {
                    toastr.success($translate.instant('repositories.service.restarting.repo', {repositoryId: repository.id}));
                    // This provides immediate visual feedback by updating the status
                    that.initQuick();
                }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
            });
        };

        this.getRepositoryTurtleConfig = function (repository) {
            return $http.get('rest/repositories/' + repository.id, {
                headers: {
                    'Accept': 'text/turtle'
                }
            });
        };

        this.isRepoActive = function (repo) {
            if (this.repository) {
                return repo.id === this.repository.id && repo.location === this.repository.location;
            }
            return false;
        };

        this.getRepositoriesFromLocation = function (locationId) {
            return this.repositories.get(locationId);
        };

        $rootScope.$on('securityInit', function (scope, securityEnabled, userLoggedIn, freeAccess) {
            if (!securityEnabled || userLoggedIn || freeAccess) {
                that.init();
            }
        });
    }]);
