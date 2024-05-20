import 'angular/core/directives/core-error/core-error-directive.store';

const modules = ['graphdb.framework.stores.core-error.store'];

angular.module('graphdb.framework.core.directives.core-error', modules)
    .directive('coreErrors', coreErrors);

coreErrors.$inject = ['$licenseService', '$jwtAuth', '$repositories', '$location', '$timeout', 'GlobalStoreService', 'CoreErrorDirectiveStore'];

function coreErrors($licenseService, $jwtAuth, $repositories, $location, $timeout, GlobalStoreService, CoreErrorDirectiveStore) {
    return {
        restrict: 'EA',
        transclude: true,
        // makes directive isolated scope
        scope: {},
        templateUrl: 'js/angular/core/directives/core-error/templates/core-errors.html',
        link: function (scope, element, attrs) {

            scope.showRemoteLocations = false;
            scope.popoverRepo = undefined;
            scope.hasSelectedRepository = false;

            let licenseRestricted = false;
            let writeRestricted = false;
            let ontopRestricted = false;
            let fedexRestricted = false;
            let previousElement;
            const subscriptions = [];

            // =========================
            // Public function
            // =========================
            scope.showPopoverForRepo = (event, repository) => {
                scope.hidePopoverForRepo();
                scope.popoverRepo = repository;
                $timeout(function () {
                    const element = $(event.toElement).find('.popover-anchor')[0];
                    previousElement = element;
                    if (element && !GlobalStoreService.getSelectedRepositoryObject()) {
                        element.dispatchEvent(new Event('show'));
                    }
                });
                event.stopPropagation();
            };

            scope.toggleShowRemoteLocations = () => {
                scope.showRemoteLocations = !scope.showRemoteLocations;
            };

            scope.getAccessibleRepositories = function () {
                let remoteLocationsFilter = (repo) => true;
                if (!scope.showRemoteLocations) {
                    remoteLocationsFilter = (repo) => repo.local;
                }
                if (CoreErrorDirectiveStore.getPageRestricted()) {
                    return $repositories.getWritableRepositories().filter(remoteLocationsFilter);
                } else {
                    return $repositories.getReadableRepositories().filter(remoteLocationsFilter);
                }
            };

            scope.isLicenseValid = () => {
                return $licenseService.isLicenseValid();
            };

            scope.isSecurityEnabled = () => {
                return $jwtAuth.isSecurityEnabled();
            };

            scope.canWriteActiveRepo = () => {
                return $repositories.canWriteActiveRepo();
            };

            scope.isActiveRepoOntopType = () => {
                return $repositories.isActiveRepoOntopType();
            };

            scope.isActiveRepoFedXType = () => {
                return $repositories.isActiveRepoFedXType();
            };

            scope.canManageRepositories = () => {
                return $repositories.canManageRepositories();
            };

            scope.getActiveRepositoryObject = () => {
                return GlobalStoreService.getSelectedRepositoryObject();
            };

            scope.setRepository = (repository) => {
                GlobalStoreService.updateSelectedRepository({id: repository.id, location: repository.location});
            };

            scope.goToAddRepo = () => {
                $location.path('/repository/create').search({previous: 'home'});
            };

            // =========================
            // Private function
            // =========================
            const updateRestricted = () => {
                scope.restricted = licenseRestricted || writeRestricted || ontopRestricted || fedexRestricted;
                CoreErrorDirectiveStore.updatePageRestricted(scope.restricted);
            };

            scope.hidePopoverForRepo = (event) => {
                if (event) {
                    // Prevents hiding if we move the mouse over the popover
                    let el = event.relatedTarget;
                    while (el) {
                        if (el.className.indexOf('popover') === 0) {
                            return;
                        }
                        el = el.parentElement;
                    }
                }
                if (previousElement) {
                    $timeout(function () {
                        if (previousElement) { // might have been nulled by another timeout
                            previousElement.dispatchEvent(new Event('hide'));
                            previousElement = null;
                        }
                    });
                }
                if (event) {
                    event.stopPropagation();
                }
            };

            const removeAllListeners = () => {
                subscriptions.forEach((subscription) => subscription());
            };

            const subscribeToValidateLicense = () => {
                if (attrs.hasOwnProperty('license')) {
                    subscriptions.push(GlobalStoreService.onLicenseUpdated((license) => {
                        licenseRestricted = !scope.isLicenseValid();
                        updateRestricted();
                    }));
                } else {
                    licenseRestricted = false;
                }
            };

            const subscribeToValidateWrite = () => {
                if (attrs.hasOwnProperty('write')) {
                    subscriptions.push(GlobalStoreService.onSelectedRepositoryObjectUpdated(() => {
                        writeRestricted = $jwtAuth.isSecurityEnabled() && !$repositories.canWriteActiveRepo();
                        updateRestricted();
                    }));
                } else {
                    writeRestricted = false;
                }
            };

            const subscribeToValidateOntop = () => {
                if (attrs.hasOwnProperty('ontop')) {
                    subscriptions.push(GlobalStoreService.onSelectedRepositoryObjectUpdated(() => {
                        ontopRestricted = $repositories.isActiveRepoOntopType();
                        updateRestricted();
                    }));
                } else {
                    ontopRestricted = false;
                }
            };

            const subscribeToValidateFedex = () => {
                if (attrs.hasOwnProperty('fedx')) {
                    subscriptions.push(GlobalStoreService.onSelectedRepositoryObjectUpdated(() => {
                        fedexRestricted = $repositories.isActiveRepoFedXType();
                        updateRestricted();
                    }));
                } else {
                    fedexRestricted = false;
                }
            };

            const subscribeSelectedRepositoryChanged = () => {
                subscriptions.push(GlobalStoreService.onSelectedRepositoryObjectUpdated((newValue) => {
                    scope.hasSelectedRepository = !!newValue;
                    if (newValue && !CoreErrorDirectiveStore.getPageRestricted()) {
                        element.hide();
                    } else {
                        element.show();
                    }
                }));
            };

            // =========================
            // Event handlers
            // =========================
            subscribeToValidateLicense();
            subscribeToValidateWrite();
            subscribeToValidateOntop();
            subscribeToValidateFedex();
            subscribeSelectedRepositoryChanged();

            // Deregister the watcher when the scope/directive is destroyed
            scope.$on('$destroy', removeAllListeners);
        }
    };
}
