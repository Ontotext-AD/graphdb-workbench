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
                                        'RepositoriesRestService', 'LocationsRestService', 'LicenseRestService',
    function ($http, toastr, $rootScope, $timeout, $location, productInfo, $jwtAuth,
              RepositoriesRestService, LocationsRestService, LicenseRestService) {
        this.repositoryStorageName = 'com.ontotext.graphdb.repository';

        this.location = '';
        this.locationError = '';
        this.loading = true;
        this.repository = localStorage.getItem(this.repositoryStorageName);
        this.locations = [];
        this.repositories = [];
        this.locationsShouldReload = false;
        this.degradedReason = '';

        const that = this;
        const ONTOP_REPOSITORY_LABEL = 'graphdb:OntopRepository';
        const FEDX_REPOSITORY_LABEL = 'graphdb:FedXRepository';


        const loadingDone = function (err, locationError) {
            that.loading = false;
            if (err) {
                // reset location data
                that.location = '';
                that.locationError = locationError;
                that.repositories = [];
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
            let existsActiveRepo = false;
            for (let i = 0; i < this.repositories.length; i++) {
                const repo = this.repositories[i];
                if (repo.id === this.repository) {
                    existsActiveRepo = true;
                    break;
                }
            }
            if (existsActiveRepo) {
                if (!$jwtAuth.canReadRepo(this.location, this.repository)) {
                    this.setRepository('');
                } else {
                    $rootScope.$broadcast('repositoryIsSet', {newRepo: false});
                }
            } else {
                this.setRepository(this.location.defaultRepository ? this.location.defaultRepository : '');
            }
        };

        this.checkActiveLocationDegraded = function () {
            this.degradedReason = '';
            // local locations are always fully supported
            if (this.location.local) {
                return;
            }
            const that = this;
            LicenseRestService.getVersion()
                .success(function (res) {
                    if (typeof res === 'object') {
                        // New style, check version and product
                        if (res.productVersion !== productInfo.productVersion) {
                            that.degradedReason = 'The remote location is running a different GraphDB version.';
                        } else if (res.productType !== productInfo.productType) {
                            that.degradedReason = 'The remote location is running a different GraphDB edition.';
                        }
                    } else {
                        // Pre 7.1 style
                        that.degradedReason = 'The remote location is running a different GraphDB version.';
                    }
                })
                .error(function () {
                    // Even older style, endpoint missing
                    that.degradedReason = 'The remote location is running a different GraphDB version.';
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
            if (!quick) {
                this.locationsShouldReload = true;
            }
            this.loading = true;
            // noCancelOnRouteChange Prevent angularCancelOnNavigateModule.js from canceling this request on route change
            LocationsRestService.getActiveLocation().then(
                function (res) {
                    if (res.data) {
                        const location = res.data;
                        if (location.active) {
                            RepositoriesRestService.getRepositories().then(function (res) {
                                    that.location = location;
                                    that.repositories = res.data;
                                    that.resetActiveRepository();
                                    loadingDone();
                                    that.checkActiveLocationDegraded();
                                    // Hack to get the location and repositories into the scope, needed for DefaultAuthoritiesCtrl
                                    $rootScope.globalLocation = that.location;
                                    $rootScope.globalRepositories = that.repositories;
                                    if (successCallback) {
                                        successCallback();
                                    }
                                },
                                function (err) {
                                    loadingDone(err, location.errorMsg);
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
                        that.locationError = '';
                        that.repositories = [];
                        that.setRepository('');
                    }
                    $rootScope.globalLocation = that.location;
                    $rootScope.globalRepositories = that.repositories;
                },
                function (err) {
                    loadingDone(err);
                    if (errorCallback) {
                        errorCallback();
                    }
                }
            );
        };

        this.getLocations = function () {
            if (this.locationsShouldReload) {
                this.locationsShouldReload = false;
                this.locations = [this.location];
                const that = this;
                LocationsRestService.getLocations()
                    .success(function (data) {
                        that.locations = data;
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
            return this.repositories;
        };

        this.getReadableRepositories = function () {
            const that = this;
            return _.filter(this.getRepositories(), function (repo) {
                return $jwtAuth.canReadRepo(that.location, repo.id)
            });
        };

        this.getWritableRepositories = function () {
            const that = this;
            return _.filter(this.getRepositories(), function (repo) {
                return $jwtAuth.canWriteRepo(that.location, repo.id) && that.isRepoTypeSupported(repo.id);
            });
        };

        this.getActiveRepository = function () {
            return this.repository;
        };

        this.isSystemRepository = function () {
            return this.repository === 'SYSTEM';
        };

        this.isActiveRepoOntopType = function () {
            const that = this;
            let activeRepo = that.repositories.find(current => current.id === that.getActiveRepository());
            if (activeRepo) {
                return activeRepo.sesameType === ONTOP_REPOSITORY_LABEL;
            }

            // On F5 or refresh of page active repo first is undefined,
            // so return the following check to ensure that repositories will
            // be loaded first repo type will be evaluated properly afterwards
            return typeof activeRepo === "undefined";
        }

        this.isActiveRepoFedXType = function() {
            const that = this;
            let activeRepo = that.repositories.find(current => current.id === that.getActiveRepository());
            if (activeRepo) {
                return activeRepo.sesameType === FEDX_REPOSITORY_LABEL;
            }

            // On F5 or refresh of page active repo first is undefined,
            // so return the following check to ensure that repositories will
            // be loaded first repo type will be evaluated properly afterwards
            return typeof activeRepo === "undefined";
        }

        this.isRepoTypeSupported = function (repoId) {
            const that = this;
            if (!repoId) {
                repoId = that.getActiveRepository();
            }
            let activeRepo = that.repositories.find(current => current.id === repoId);
            if (activeRepo) {
                if ($location.path().includes('import')) {
                    return activeRepo.sesameType !== ONTOP_REPOSITORY_LABEL;
                } else {
                    return activeRepo.sesameType !== ONTOP_REPOSITORY_LABEL && activeRepo.sesameType !== FEDX_REPOSITORY_LABEL;
                }
            }

            return false;
        }

        this.setRepositoryHeaders = function () {
            const repo = this.repository ? this.repository : undefined;
            $http.defaults.headers.common['X-GraphDB-Repository'] = repo;
            $.ajaxSetup()['headers'] = $.ajaxSetup()['headers'] || {};
            $.ajaxSetup()['headers']['X-GraphDB-Repository'] = repo;
        };

        this.setRepositoryHeaders();

        this.setRepository = function (id) {
            this.repository = id;
            if (id) {
                localStorage.setItem(this.repositoryStorageName, this.repository);
            } else {
                localStorage.removeItem(this.repositoryStorageName);
            }
            this.setRepositoryHeaders(id);
            $rootScope.$broadcast('repositoryIsSet', {newRepo: true});

            // if the current repo is unreadable by the currently logged in user (or free access user)
            // we unset the repository
            if (id && !$jwtAuth.canReadRepo(this.location, id)) {
                this.setRepository('');
            }
            // reset denied permissions (different repo, different rights)
            $rootScope.deniedPermissions = {};
        };

        this.getDefaultRepository = function () {
            return this.hasActiveLocation() ? this.location.defaultRepository : '';
        };

        this.setDefaultRepository = function (id) {
            if (!this.hasActiveLocation()) {
                toastr.error('No active location', 'Error');
                return;
            }
            const that = this;
            LocationsRestService.setDefaultRepository(id)
                .success(function () {
                    // XXX maybe we should reload the active location but oh well
                    that.location.defaultRepository = id;
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
                    if (that.getActiveLocation().uri === uri) {
                        that.location = '';
                        that.locationError = '';
                        that.setRepository('');
                    }
                    that.init();
                }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error');
            });
        };

        this.deleteRepository = function (repositoryId) {
            RepositoriesRestService.deleteRepository(repositoryId)
                .success(function () {
                    that.init();
                }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error');
            });
            if (that.getActiveRepository() === repositoryId) {
                that.setRepository('');
            }
        };

        this.restartRepository = function (repositoryId) {
            RepositoriesRestService.restartRepository(repositoryId)
                .success(function () {
                    toastr.success(`Restarting repository ${repositoryId}`);
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

        $rootScope.$on('securityInit', function (scope, securityEnabled, userLoggedIn, freeAccess) {
            if (!securityEnabled || userLoggedIn || freeAccess) {
                that.init();
            }
        });
    }]);
