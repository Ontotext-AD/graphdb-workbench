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
                                        'RepositoriesRestService', 'LocationsRestService', 'LicenseRestService', '$q',
    function ($http, toastr, $rootScope, $timeout, $location, productInfo, $jwtAuth,
              RepositoriesRestService, LocationsRestService, LicenseRestService, $q) {
        this.repositoryStorageName = 'com.ontotext.graphdb.repository';
        this.repositoryStorageLocationName = 'com.ontotext.graphdb.repository.location';

        this.location = {};
        this.locationError = '';
        this.loading = true;
        this.repository = {
            id: localStorage.getItem(this.repositoryStorageName),
            location: localStorage.getItem(this.repositoryStorageLocationName)
        };
        this.locations = [];
        this.repositories = new Map();
        this.locationsShouldReload = false;
        this.degradedReason = '';

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
                    toastr.error(err.statusText, 'Error loading location');
                } else {
                    toastr.error('Error loading location');
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
                if (!$jwtAuth.canReadRepo(this.getLocationFromUri(this.repository.location), this.repository.id)) {
                    this.setRepository('');
                } else {
                    $rootScope.$broadcast('repositoryIsSet', {newRepo: false});
                }
            } else {
                this.setRepository(this.location.defaultRepository ? this.location.defaultRepository : '');
            }
        };

        this.checkLocationsDegraded = function () {
            this.degradedReason = '';
            const that = this;
            this.locations.forEach(currentLocation => {
                // local locations are always fully supported
                if (currentLocation.local) {
                    return;
                }

                LicenseRestService.getVersion(currentLocation.uri)
                    .success(function (res) {
                        if (typeof res === 'object') {
                            // New style, check version and product
                            if (res.productVersion !== productInfo.productVersion) {
                                currentLocation.degradedReason = `The remote location ${currentLocation.name} is running a different GraphDB version.\n`;
                                that.degradedReason += currentLocation.degradedReason;
                            }
                        } else {
                            // Pre 7.1 style
                            currentLocation.degradedReason = `The remote location ${currentLocation.name} is running a different GraphDB version.\n`;
                            that.degradedReason += currentLocation.degradedReason;
                        }
                    })
                    .error(function () {
                        // Even older style, endpoint missing
                        that.degradedReason += 'The remote location is running a different GraphDB version.';
                    });
            });
        };

        this.getDegradedReason = function () {
            return this.degradedReason;
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
                // noCancelOnRouteChange Prevent angularCancelOnNavigateModule.js from canceling this request on route change
                that.getLocations()
                    .then(function () {
                        that.getRepos(successCallback, errorCallback);
                    });
            } else {
                that.getRepos(successCallback, errorCallback, quick);
            }
        };

        this.getRepos = function (successCallback, errorCallback, quick) {
            if (that.location && that.location.active) {
                RepositoriesRestService.getRepositories().then(function (res) {
                        that.repositories = new Map(JSON.parse(res.data));
                        that.resetActiveRepository();
                        loadingDone();
                        that.checkLocationsDegraded();
                        // Hack to get the location and repositories into the scope, needed for DefaultAuthoritiesCtrl
                        $rootScope.globalLocation = that.location;
                        $rootScope.globalRepositories = that.repositories;
                        if (successCallback) {
                            successCallback();
                        }
                    },
                    function (err) {
                        loadingDone(err, that.location.errorMsg);
                        if (errorCallback) {
                            errorCallback();
                        }
                    });
            } else {
                loadingDone();
                // no active location
                if (quick) {
                    that.locationsShouldReload = true;
                }
                that.location = '';
                that.locationError = '';
                that.repositories = [];
                that.setRepository('');
            }
            $rootScope.globalLocation = that.location;
            $rootScope.globalRepositories = that.repositories;
        }

        this.getLocations = function () {
            if (this.locationsShouldReload) {
                this.locationsShouldReload = false;
                const that = this;
                return LocationsRestService.getLocations()
                    .success(function (data) {
                        that.locations = data;
                        that.location = that.locations.find(location => location.active);
                    })
                    .error(function () {
                        // if there is an error clear the flag after some time to trigger another attempt
                        $timeout(function () {
                            that.locationsShouldReload = true;
                        }, 2000);
                    });
            }
            return this.locations;
        };


        this.getActiveLocation = function () {
            return this.location;
        };

        this.hasActiveLocation = function () {
            return !_.isEmpty(this.location);
        };

        this.getLocationError = function () {
            if (!this.locationError) {
                return 'There is no active location';
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
            const that = this;
            return _.filter(this.getRepositories(), function (repo) {
                return $jwtAuth.canReadRepo(that.getLocationFromUri(repo.location), repo.id)
            });
        };

        this.getWritableRepositories = function () {
            const that = this;
            return _.filter(this.getRepositories(), function (repo) {
                return $jwtAuth.canWriteRepo(that.getLocationFromUri(repo.location), repo.id) && !that.isActiveRepoOntopType(repo);
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
            let repositoriesFromLocation = that.repositories.get(repo.location);
            let activeRepo;
            if (repo && repositoriesFromLocation) {
                activeRepo = repositoriesFromLocation.find(current => current.id === repo.id);
                if (activeRepo) {
                    return activeRepo.sesameType === ONTOP_REPOSITORY_LABEL;
                }
            }

            // On F5 or refresh of page active repo first is undefined,
            // so return the following check to ensure that repositories will
            // be loaded first repo type will be evaluated properly afterwards
            return typeof activeRepo === "undefined";
        }

        this.isActiveRepoFedXType = function() {
            const that = this;
            let repo = that.getActiveRepositoryObject();
            let repositoriesFromLocation = that.repositories.get(repo.location);
            let activeRepo;
            if (repo && repositoriesFromLocation) {
                activeRepo = repositoriesFromLocation.find(current => current.id === repo.id);
                if (activeRepo) {
                    return activeRepo.sesameType === FEDX_REPOSITORY_LABEL;
                }
            }

            // On F5 or refresh of page active repo first is undefined,
            // so return the following check to ensure that repositories will
            // be loaded first repo type will be evaluated properly afterwards
            return typeof activeRepo === "undefined";
        }

        this.getLocationFromUri = function (locationUri) {
            return this.locations.find((location) => location.uri === locationUri);
        }

        this.setRepositoryHeaders = function () {
            $http.defaults.headers.common['X-GraphDB-Repository'] = this.repository.id ? this.repository.id : undefined;
            $.ajaxSetup()['headers'] = $.ajaxSetup()['headers'] || {};
            $.ajaxSetup()['headers']['X-GraphDB-Repository'] = this.repository.id ? this.repository.id : undefined;

            $http.defaults.headers.common['X-GraphDB-Repository-Location'] = this.repository.location ? this.repository.location : undefined;
            $.ajaxSetup()['headers'] = $.ajaxSetup()['headers'] || {};
            $.ajaxSetup()['headers']['X-GraphDB-Repository-Location'] = this.repository.location ? this.repository.location : undefined;
        };

        this.setRepositoryHeaders();

        this.setRepository = function (repo) {
            this.repository = repo;
            if (repo) {
                localStorage.setItem(this.repositoryStorageName, this.repository.id);
                localStorage.setItem(this.repositoryStorageLocationName, this.repository.location);
            } else {
                localStorage.removeItem(this.repositoryStorageName);
                localStorage.removeItem(this.repositoryStorageLocationName);
            }
            this.setRepositoryHeaders(repo);
            $rootScope.$broadcast('repositoryIsSet', {newRepo: true});

            // if the current repo is unreadable by the currently logged in user (or free access user)
            // we unset the repository
            if (repo && !$jwtAuth.canReadRepo(this.getLocationFromUri(repo.location), repo.id)) {
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
                toastr.error('No active location', 'Error');
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
                    toastr.error(msg, 'Error');
                });
        };

        this.deleteLocation = function (uri) {
            LocationsRestService.deleteLocation(encodeURIComponent(uri))
                .success(function () {
                    //Reload locations and repositories
                    that.init();
                }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error');
            });
        };

        this.deleteRepository = function (repo) {
            RepositoriesRestService.deleteRepository(repo)
                .success(function () {
                    that.init();
                }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error');
            });
            if (that.getActiveRepository() === repo.id) {
                that.setRepository('');
            }
        };

        this.restartRepository = function (repository) {
            RepositoriesRestService.restartRepository(repository)
                .success(function () {
                    toastr.success(`Restarting repository ${repository.id}`);
                    // This provides immediate visual feedback by updating the status
                    that.initQuick();
                }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error');
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
        }

        this.getRepositoriesFromLocation = function (locationId) {
            return this.repositories.get(locationId);
        }

        $rootScope.$on('securityInit', function (scope, securityEnabled, userLoggedIn, freeAccess) {
            if (!securityEnabled || userLoggedIn || freeAccess) {
                that.init();
            }
        });
    }]);
