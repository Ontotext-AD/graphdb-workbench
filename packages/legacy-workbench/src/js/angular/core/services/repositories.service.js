/* eslint-disable no-invalid-this */
import 'angular/core/services';
import 'angular/rest/repositories.rest.service';
import 'angular/rest/locations.rest.service';
import 'angular/rest/license.rest.service';
import 'ng-file-upload/dist/ng-file-upload.min';
import 'ng-file-upload/dist/ng-file-upload-shim.min';
import 'angular/core/services/event-emitter-service';
import {QueryMode} from "../../models/ontotext-yasgui/query-mode";
import {md5HashGenerator} from "../../utils/hash-utils";
import {RemoteLocationModel} from "../../models/repository/remote-location.model";
import {SelectMenuOptionsModel} from "../../models/form-fields";
import {
    RepositoryStorageService,
    RepositoryContextService,
    RepositoryLocationContextService,
    mapRepositoryListResponseToModel,
    AuthorizationService,
    AuthenticationService,
    SecurityContextService,
    service,
} from "@ontotext/workbench-api";

const modules = [
    'ngCookies',
    'graphdb.framework.rest.repositories.service',
    'graphdb.framework.rest.locations.service',
    'graphdb.framework.rest.license.service',
    'toastr',
    'graphdb.framework.utils.event-emitter-service',
];

const repositories = angular.module('graphdb.framework.core.services.repositories', modules);

repositories.service('$repositories', ['toastr', '$rootScope', '$timeout', '$location', 'productInfo', '$jwtAuth',
    'RepositoriesRestService', 'LocationsRestService', 'LicenseRestService', '$translate', '$q', 'EventEmitterService', 'RDF4JRepositoriesRestService',
    function(toastr, $rootScope, $timeout, $location, productInfo, $jwtAuth,
        RepositoriesRestService, LocationsRestService, LicenseRestService, $translate, $q, eventEmitterService, RDF4JRepositoriesRestService) {
        this.location = {uri: '', label: 'Local', local: true};
        this.locationError = '';
        this.loading = true;

        this.locations = [this.location];
        this.repositories = new Map();
        this.locationsShouldReload = true;

        const authorizationService = service(AuthorizationService);
        const securityContextService = service(SecurityContextService);
        const authenticationService = service(AuthenticationService);

        const that = this;

        const loadingDone = function(err, locationError) {
            that.loading = false;
            service(RepositoryLocationContextService).updateIsLoading(false);
            // If user is not logged in, do not show location loading errors
            const isLoggedIn = authenticationService.isLoggedIn();
            if (err && isLoggedIn) {
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

        this.resetActiveRepository = function() {
            const repository = this.getActiveRepositoryObjectFromStorage();
            const repositoriesFromLocation = that.repositories.get(repository.location);
            let existsActiveRepo = false;
            if (repositoriesFromLocation) {
                existsActiveRepo = repositoriesFromLocation.find((repo) => repo.id === repository.id);
            }
            if (existsActiveRepo) {
                if (!authorizationService.canReadRepo(repository) && !authorizationService.canReadGqlRepo(repository)) {
                    this.setRepository('');
                } else {
                    $rootScope.$broadcast('repositoryIsSet', {newRepo: false});
                }
            } else {
                this.setRepository(
                    this.location.defaultRepository ? {id: this.location.defaultRepository, location: this.location.uri} : '');
            }
        };

        this.checkLocationsDegraded = function(quick) {
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
                    .success(function(res) {
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
                    .error(function(error) {
                        currentLocation.errorMsg = error;
                        if (!quick) {
                            that.locationsShouldReload = true;
                        }
                    });
            });
        };

        this.getDegradedReason = function() {
            const repository = this.getActiveRepositoryObjectFromStorage();
            const activeRepoLocation = this.locations.find((loc) => loc.uri === repository.location);
            if (activeRepoLocation) {
                return activeRepoLocation.degradedReason;
            }
            return '';
        };

        this.clearLocationErrorMsg = function(locationUri) {
            const location = this.locations.find((loc) => loc.uri === locationUri);
            if (location && location.errorMsg) {
                location.errorMsg = null;
            }
        };

        this.initQuick = function() {
            // Quick mode - used to refresh the repo list and states, skip loading if no active location
            if (this.hasActiveLocation()) {
                this.init(null, null, true);
            }
        };

        this.assignHashesToRepositories = function(repositoriesData) {
            return repositoriesData.map((repo) => {
                const hashGenerator = md5HashGenerator();
                repo.hash = hashGenerator(JSON.stringify(repo));
                return repo;
            });
        };

        this.init = function(successCallback, errorCallback, quick) {
            this.loading = true;
            service(RepositoryLocationContextService).updateIsLoading(true);
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
                                        const reposWithHashes = that.assignHashesToRepositories(value);
                                        that.clearLocationErrorMsg(key);
                                        that.repositories.set(key, reposWithHashes);
                                    });
                                    that.resetActiveRepository();
                                    $rootScope.$broadcast('repositoryIsSet', {newRepo: false});
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

        this.getLocations = function(abortRequestPromise) {
            if (this.locationsShouldReload || locationsRequestPromise) {
                if (!locationsRequestPromise) {
                    this.locationsShouldReload = false;
                    this.locations = [this.location];
                    locationsRequestPromise = LocationsRestService.getLocations(abortRequestPromise)
                        .then((data) => {
                            that.locations = data.data.map((location) => new RemoteLocationModel(location));
                            return this.locations;
                        })
                        .catch(function() {
                            // if there is an error clear the flag after some time to trigger another attempt
                            $timeout(function() {
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


        this.getActiveLocation = function() {
            return this.location;
        };

        this.hasActiveLocation = function() {
            return !_.isEmpty(this.location);
        };

        this.getLocationError = function() {
            if (!this.locationError) {
                return $translate.instant('repositories.service.no.active.location');
            } else {
                return this.locationError;
            }
        };

        this.isLoadingLocation = function() {
            return this.loading;
        };

        this.getRepositories = function() {
            const repos = [];
            this.repositories.forEach((value) => repos.push(...value));
            return repos;
        };

        /**
         * Gets repository by id.
         *
         * @param {string} repositoryId
         * @return {*}
         */
        this.getRepository = function(repositoryId) {
            return this.getRepositories().find((repository) => repository.id === repositoryId);
        };

        this.getReadableGraphdbRepositories = function() {
            return this.getReadableRepositories()
                .filter((repo) => repo.type === 'graphdb');
        };

        this.getReadableRepositories = function() {
            return _.filter(this.getRepositories(), function(repo) {
                return authorizationService.canReadRepo(repo) || authorizationService.canReadGqlRepo(repo);
            });
        };

        /**
         * Returns all GraphDB repositories as SelectMenuOptionsModel.
         * @param {Function} provider A function that returns the repositories to be used.
         * @returns {SelectMenuOptionsModel}
         */
        this.getRepositoriesAsSelectMenuOptions = (provider) => {
            return provider().map((repo) => (
                    new SelectMenuOptionsModel({
                        value: repo.id,
                        label: repo.id,
                        data: {
                            repository: repo,
                        },
                    })),
                );
        };

        /**
         * Returns all readable graphdb repositories that are local.
         * @return {*}
         */
        this.getLocalReadableGraphdbRepositories = function() {
            return this.getReadableGraphdbRepositories().filter((repository) => repository.local === true);
        };

        this.getLocalReadablGraphdbRepositoryIds = function() {
            return this.getLocalReadableGraphdbRepositories().map((repository) => repository.id);
        };

        this.getWritableRepositories = function() {
            const that = this;
            return _.filter(this.getRepositories(), function(repo) {
                return authorizationService.canWriteRepo(repo) && !that.isActiveRepoOntopType(repo);
            });
        };

        this.getActiveRepositoryObjectFromStorage = function() {
            return service(RepositoryStorageService).getRepositoryReference();
        };

        this.getActiveRepository = function() {
            return service(RepositoryStorageService).getRepositoryReference().id;
        };

        this.getActiveRepositoryObject = function() {
            const copyThis = this;
            const repository = this.getActiveRepositoryObjectFromStorage();
            const repositoriesFromLocation = copyThis.repositories.get(repository.location);
            if (repositoriesFromLocation) {
                return repositoriesFromLocation.find((repo) => repo.id === repository.id);
            }
            return null;
        };

        this.isSystemRepository = function() {
            const repository = this.getActiveRepositoryObjectFromStorage();
            return repository.id === 'SYSTEM';
        };

        this.isActiveRepoOntopType = function() {
            return service(RepositoryContextService)
                .getSelectedRepository()
                ?.isOntop() ?? false;
        };

        this.isActiveRepoFedXType = function() {
            return service(RepositoryContextService)
                .getSelectedRepository()
                ?.isFedx() ?? false;
        };

        this.getLocationFromUri = function(locationUri) {
            return this.locations.find((location) => location.uri === locationUri);
        };

        this.setRepositoryHeaders = function(repository) {
            $.ajaxSetup()['headers'] = $.ajaxSetup()['headers'] || {};
            $.ajaxSetup()['headers']['X-GraphDB-Repository'] = repository ? repository.id : undefined;
            $.ajaxSetup()['headers']['X-GraphDB-Repository-Location'] = repository ? repository.location : undefined;
        };

        this.setRepository = function(repo) {
            const eventData = {oldRepository: this.repository, newRepository: repo, cancel: false};
            eventEmitterService.emit('repositoryWillChangeEvent', eventData, (eventData) => {
                if (!eventData.cancel) {
                    const repositoryContextService = service(RepositoryContextService);
                    // if the current repo is unreadable by the currently logged in user (or free access user)
                    // we unset the repository
                    if (!repo || (!authorizationService.canReadRepo(repo) && !authorizationService.canReadGqlRepo(repo))) {
                        repositoryContextService.updateSelectedRepository(undefined);
                    } else {
                        repo.isNew = true;
                        repositoryContextService.updateSelectedRepository(repo);
                    }
                }
            });
        };

        this.onRepositorySet = function(newRepository) {
            this.setRepositoryHeaders(newRepository);
            $rootScope.$broadcast('repositoryIsSet', {newRepo: !!(newRepository && newRepository.isNew)});
        };

        this.getDefaultRepository = function() {
            return this.hasActiveLocation() ? this.location.defaultRepository : '';
        };

        this.setDefaultRepository = function(repo) {
            if (!this.hasActiveLocation()) {
                toastr.error($translate.instant('repositories.service.no.active.location'), $translate.instant('common.error'));
                return;
            }
            const that = this;
            LocationsRestService.setDefaultRepository(repo)
                .success(function() {
                    // XXX maybe we should reload the active location but oh well
                    that.location.defaultRepository = repo;
                })
                .error(function(data) {
                    const msg = getError(data);
                    toastr.error(msg, $translate.instant('common.error'));
                });
        };

        this.deleteLocation = function(uri) {
            return LocationsRestService.deleteLocation(encodeURIComponent(uri))
                .success(function() {
                    const activeRepo = that.getActiveRepositoryObject();
                    //Reload locations and repositories
                    if (activeRepo && activeRepo.location === uri) {
                        that.location = '';
                        that.setRepository('');
                    }
                    that.init();
                }).error(function(data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
            });
        };

        this.deleteRepository = function(repo) {
            return RepositoriesRestService.deleteRepository(repo)
                .success(function() {
                    that.init();
                }).error(function(data) {
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

        this.restartRepository = function(repository) {
            return RepositoriesRestService.restartRepository(repository)
                .success(function() {
                    toastr.success($translate.instant('repositories.service.restarting.repo', {repositoryId: repository.id}));
                    // This provides immediate visual feedback by updating the status
                    that.initQuick();
                }).error(function(data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
            });
        };

        this.getRepositoryTurtleConfig = function(repository) {
            return RepositoriesRestService.getRepositoryTurtleConfig(repository);
        };

        this.isRepoActive = function(repo) {
            const repository = this.getActiveRepositoryObjectFromStorage();
            if (repository.id) {
                return repo.id === repository.id && repo.location === repository.location;
            }
            return false;
        };

        this.getRepositoriesFromLocation = function(locationId) {
            return this.repositories.get(locationId);
        };

        this.getPrefixes = (repositoryId) => {
            return RDF4JRepositoriesRestService.getRepositoryNamespaces(repositoryId)
                .then((response) => {
                    const usedPrefixes = {};
                    response.data.results.bindings.forEach(function(e) {
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

        const onAuthChanged = (isAuthenticated, isLoggedIn, hasFreeAccess) => {
            locationsRequestPromise = null;
            if (!isAuthenticated || isLoggedIn || hasFreeAccess) {
                // This has to happen in a separate cycle because otherwise some properties in init() are undefined
                $timeout(function() {
                    that.init();
                });
            }
        };

        securityContextService.onSecurityConfigChanged((securityConfig) => {
            onAuthChanged(securityConfig.isEnabled(), authenticationService.isLoggedIn(), securityConfig.isFreeAccessEnabled());
        });

        securityContextService.onAuthenticatedUserChanged(() => {
            onAuthChanged(authenticationService.isAuthenticated(), authenticationService.isLoggedIn(), authorizationService.hasFreeAccess());
        });

        $rootScope.$on('reloadLocations', function() {
            // the event is emitted when cluster is created/deleted
            that.locationsShouldReload = true;
            that.getLocations()
                .then(() => that.initQuick());
        });

        $rootScope.$watch(() => {
            const currentRepos = that.getReadableRepositories();
            return JSON.stringify(currentRepos);
        }, (newVal, oldVal) => {
            if (newVal !== oldVal) {
                const groupedByLocation = JSON.parse(newVal).reduce((acc, repo) => {
                    const loc = repo.location || '';
                    if (!acc[loc]) {
                        acc[loc] = [];
                    }
                    acc[loc].push(repo);
                    return acc;
                }, {});

                const repos = mapRepositoryListResponseToModel(groupedByLocation);
                service(RepositoryContextService).updateRepositoryList(repos);
            }
        });
    }]);
