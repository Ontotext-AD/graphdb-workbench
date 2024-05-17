import 'angular/core/services';
import 'angular/rest/repositories.rest.service';
import 'angular/rest/locations.rest.service';
import 'angular/rest/license.rest.service';
import 'ng-file-upload/dist/ng-file-upload.min';
import 'ng-file-upload/dist/ng-file-upload-shim.min';
import {QueryMode} from "../../models/ontotext-yasgui/query-mode";

const modules = [
    'ngCookies',
    'graphdb.framework.rest.repositories.service',
    'graphdb.framework.rest.locations.service',
    'graphdb.framework.rest.license.service',
    'toastr'
];

const repositories = angular.module('graphdb.framework.core.services.repositories', modules);

repositories.service('$repositories', ['toastr', '$rootScope', '$timeout', '$location', 'productInfo', '$jwtAuth',
    'RepositoriesRestService', 'LocationsRestService', 'LicenseRestService', '$translate', '$q', 'LocalStorageAdapter', 'LSKeys', 'GlobalEmitterBuss', 'RDF4JRepositoriesRestService',
    function (toastr, $rootScope, $timeout, $location, productInfo, $jwtAuth,
        RepositoriesRestService, LocationsRestService, LicenseRestService, $translate, $q, LocalStorageAdapter, LSKeys, GlobalEmitterBuss, RDF4JRepositoriesRestService) {

        this.location = {uri: '', label: 'Local', local: true, isInCluster: false};
        this.locationError = '';
        this.loading = true;

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
            const repository = this.getActiveRepositoryObjectFromStorage();
            const repositoriesFromLocation = that.repositories.get(repository.location);
            let existsActiveRepo = false;
            if (repositoriesFromLocation) {
                existsActiveRepo = repositoriesFromLocation.find((repo) => repo.id === repository.id);
            }
            if (existsActiveRepo) {
                if (!$jwtAuth.canReadRepo(repository)) {
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
            this.locations.forEach((currentLocation) => {
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
            const repository = this.getActiveRepositoryObjectFromStorage();
            const activeRepoLocation = this.locations.find((loc) => loc.uri === repository.location);
            if (activeRepoLocation) {
                return activeRepoLocation.degradedReason;
            }
            return '';
        };

        this.clearLocationErrorMsg = function (locationUri) {
            const location = this.locations.find((loc) => loc.uri === locationUri);
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
            return LocationsRestService.getActiveLocation()
                .then(function(res) {
                    if (res.data) {
                        const location = res.data;
                        if (location.active) {
                            return RepositoriesRestService.getRepositories()
                                .then(function(result) {
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
                                })
                                .catch(function(err) {
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
                })
                .catch(function(err) {
                    loadingDone(err);
                    if (errorCallback) {
                        errorCallback();
                    }
                });
        };

        let locationsRequestPromise;

        this.getLocations = function (abortRequestPromise) {
            if (this.locationsShouldReload || locationsRequestPromise) {
                if (!locationsRequestPromise) {
                    this.locationsShouldReload = false;
                    this.locations = [this.location];
                    locationsRequestPromise = LocationsRestService.getLocations(abortRequestPromise, true)
                        .then((data) => {
                            that.locations = data.data;
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

            const deferred = $q.defer();
            deferred.resolve(this.locations);
            return deferred.promise;
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
            const repos = [];
            this.repositories.forEach((value) => repos.push.apply(repos, value));
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

        this.getActiveRepositoryObjectFromStorage = function() {
            return {
                id: LocalStorageAdapter.get(LSKeys.REPOSITORY_ID) || '',
                location: LocalStorageAdapter.get(LSKeys.REPOSITORY_LOCATION) || ''
            };
        };

        this.getActiveRepository = function () {
            return LocalStorageAdapter.get(LSKeys.REPOSITORY_ID) || undefined;
        };

        this.getActiveRepositoryObject = function () {
            const copyThis = this;
            const repository = this.getActiveRepositoryObjectFromStorage();
            const repositoriesFromLocation = copyThis.repositories.get(repository.location);
            if (repositoriesFromLocation) {
                return repositoriesFromLocation.find((repo) => repo.id === repository.id);
            }
            return null;
        };

        this.isSystemRepository = function () {
            const repository = this.getActiveRepositoryObjectFromStorage();
            return repository.id === 'SYSTEM';
        };

        this.isActiveRepoOntopType = function (repo) {
            const that = this;
            if (!repo) {
                repo = that.getActiveRepositoryObject();
            }
            let activeRepo;
            if (repo) {
                activeRepo = that.repositories.get(repo.location).find((current) => current.id === repo.id);
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
            const repo = that.getActiveRepositoryObject();
            let activeRepo;
            if (repo) {
                activeRepo = that.repositories.get(repo.location).find((current) => current.id === repo.id);
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

        this.setRepositoryHeaders = function (repository) {
            $.ajaxSetup()['headers'] = $.ajaxSetup()['headers'] || {};
            $.ajaxSetup()['headers']['X-GraphDB-Repository'] = repository ? repository.id : undefined;
            $.ajaxSetup()['headers']['X-GraphDB-Repository-Location'] = repository ? repository.location : undefined;
        };

        this.setRepository = function (repo) {
            const eventData = {oldRepository: this.repository, newRepository: repo, cancel: false};
            GlobalEmitterBuss.emit('repositoryWillChangeEvent', eventData, (eventData) => {
                if (!eventData.cancel) {
                    if (repo) {
                        LocalStorageAdapter.set(LSKeys.REPOSITORY_ID, repo.id);
                        LocalStorageAdapter.set(LSKeys.REPOSITORY_LOCATION, repo.location);
                    } else {
                        LocalStorageAdapter.remove(LSKeys.REPOSITORY_ID);
                        LocalStorageAdapter.remove(LSKeys.REPOSITORY_LOCATION);
                    }
                    this.setRepositoryHeaders(repo);
                    $rootScope.$broadcast('repositoryIsSet', {newRepo: true});

                    // if the current repo is unreadable by the currently logged in user (or free access user)
                    // we unset the repository
                    if (repo && !$jwtAuth.canReadRepo(repo)) {
                        this.setRepository('');
                    }
                    // reset denied permissions (different repo, different rights)
                    $rootScope.deniedPermissions = {};
                }
            });
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
                    const activeRepo = that.getActiveRepositoryObject();
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
            return RepositoriesRestService.getRepositoryTurtleConfig(repository);
        };

        this.isRepoActive = function (repo) {
            const repository = this.getActiveRepositoryObjectFromStorage();
            if (repository.id) {
                return repo.id === repository.id && repo.location === repository.location;
            }
            return false;
        };

        this.getRepositoriesFromLocation = function (locationId) {
            return this.repositories.get(locationId);
        };

        this.getPrefixes = (repositoryId) => {
            return RDF4JRepositoriesRestService.getRepositoryNamespaces(repositoryId)
                .then((response) => {
                    const usedPrefixes = {};
                    response.data.results.bindings.forEach(function (e) {
                        usedPrefixes[e.prefix.value] = e.namespace.value;
                    });
                    return usedPrefixes;
                });
        };

        /**
         * Resolve the endpoint which should be used for issuing sparql queries based on the query mode.
         * @param {'query'|'update'} queryMode
         * @return {string} The resolved REST endpoint for sparql queries.
         */
        this.resolveSparqlEndpoint = (queryMode) => {
            // if query mode is 'query' -> 'repositories/repo-name'
            // if query mode is 'update' -> 'repositories/repo-name/statements'
            if (queryMode === QueryMode.UPDATE) {
                return `repositories/${this.getActiveRepository()}/statements`;
            } else if (queryMode === QueryMode.QUERY) {
                return `repositories/${this.getActiveRepository()}`;
            }
        };

        $rootScope.$on('securityInit', function (scope, securityEnabled, userLoggedIn, freeAccess) {
            locationsRequestPromise = null;
            if (!securityEnabled || userLoggedIn || freeAccess) {
                // This has to happen in a separate cycle because otherwise some properties in init() are undefined
                $timeout(function () {
                    that.init();
                });
            }
        });

        $rootScope.$on('reloadLocations', function () {
            // the event is emitted when cluster is created/deleted
            that.locationsShouldReload = true;
            that.getLocations()
                .then(() => that.initQuick());
        });
    }]);
