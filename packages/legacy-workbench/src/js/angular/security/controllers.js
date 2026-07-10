import 'angular/core/services';
import 'angular/core/services/jwt-auth.service';
import 'angular/core/services/security.service';
import {UserRole, UserType} from 'angular/utils/user-utils';
import 'angular/security/directives/custom-prefix-tags-input.directive';
import {GRAPHQL, GRAPHQL_PREFIX, MANAGE_REPO, MANAGE_REPO_PREFIX, READ_REPO, READ_REPO_PREFIX, SYSTEM_REPO, WRITE_REPO, WRITE_REPO_PREFIX} from './services/constants';
import {DocumentationUrlResolver} from '../utils/documentation-url-resolver';
import {
    AppSettings,
    AuthenticationService,
    AuthorityList,
    AuthorizationService,
    LanguageContextService,
    mapAuthSettingsResponseToModel,
    mapGrantedAuthoritiesResponseToModel,
    OntoToastrService,
    RepositoryAuthorityService,
    SecurityContextService,
    SecurityService as SecurityServiceAPI,
    service,
    User,
    UsersService,
} from '@ontotext/workbench-api';
import {decodeHTML} from '../../../app';

const modules = [
    'ngCookies',
    'ui.bootstrap',
    'graphdb.framework.core.services.jwtauth',
    'graphdb.framework.core.services.security-service',
    'toastr',
    'ngTagsInput',
];

const securityModule = angular.module('graphdb.framework.security.controllers', modules);

securityModule.controller('UsersCtrl', ['$scope', '$uibModal', 'toastr', '$window', '$jwtAuth', '$timeout', 'ModalService', 'SecurityService', '$translate', 'productInfo',
    function($scope, $uibModal, toastr, $window, $jwtAuth, $timeout, ModalService, SecurityService, $translate, productInfo) {
        const authorizationService = service(AuthorizationService);
        const authenticationService = service(AuthenticationService);
        const securityServiceAPI = service(SecurityServiceAPI);
        const toastrService = service(OntoToastrService);
        const usersService = service(UsersService);
        const repositoryAuthorityService = service(RepositoryAuthorityService);
        const securityContextService = service(SecurityContextService);
        const languageContextService = service(LanguageContextService);

        // UI view-model
        $scope.usersData = [];

        $scope.loader = true;
        $scope.isSecurityToggleAllowed = securityContextService.getSecurityConfig()?.isSecurityToggleAllowed();
        $scope.isPasswordLoginEnabled = securityContextService.getSecurityConfig()?.isPasswordLoginEnabled();
        $scope.isOpenIDEnabled = securityContextService.getSecurityConfig()?.isOpenIdEnabled();
        $scope.authorizationImplementation = securityContextService.getSecurityConfig()?.getAuthenticationImplementation();
        $scope.canExtendExternalUserRole = authorizationService.canExtendExternalUsers();
        $scope.additionalAuthSources = securityContextService.getSecurityConfig()?.additionalAuthSources.join(', ');
        $scope.toggleState = {hovered: false};

        const getSecurityToggleTooltip = () => {
            const action = $scope.securityEnabled() ? $translate.instant('disable') : $translate.instant('enable');
            return $translate.instant('security.toggle.tooltip', {action});
        };

        $scope.securityToggleNotAllowedDocUrl = DocumentationUrlResolver.getDocumentationUrl(productInfo.productShortVersion, 'security.html');

        $scope.securityEnabled = function() {
            return authenticationService.isSecurityEnabled();
        };

        $scope.securityToggleTooltip = getSecurityToggleTooltip();

        const subscribeToLanguageChange = () => {
            return languageContextService.onSelectedLanguageChanged(() => {
                $scope.securityToggleTooltip = getSecurityToggleTooltip();
            });
        };

        const subscriptions = [
            subscribeToLanguageChange(),
        ];

        $scope.hasExternalAuth = function() {
            return $jwtAuth.hasExternalAuth();
        };

        $scope.freeAccessEnabled = function() {
            return authorizationService.hasFreeAccess();
        };

        $scope.getUsers = () => {
            return usersService.getUsers()
                .then(function(data) {
                    $scope.usersData = data.map((user) => ({
                        username: user.username,
                        dateCreated: user.dateCreated,
                        userType: user.getUserType(),
                        userTypeDescription: user.getUserTypeDescription(),
                        repositories: user.authorities.getRepositoriesPermissions(),
                        customRoles: user.authorities.getCustomRoles(),
                        hasExternalLogin: user.hasExternalLogin,
                        authorities: user.authorities,
                        isExtended: $scope.canExtendExternalUserRole && !!user.authorities.size(),
                    }));
                    $scope.loader = false;
                }).catch(function(data) {
                    const msg = getError(data);
                    toastr.error(msg, $translate.instant('common.error'));
                    $scope.loader = false;
                });
        };
        $scope.getUsers();

        $scope.$on('repositoryIsSet', function() {
            $scope.getUsers();
        });

        $scope.toggleSecurity = function() {
            if (!$scope.isSecurityToggleAllowed) {
                return;
            }
            const isSecurityEnabled = authenticationService.isSecurityEnabled();
            $jwtAuth.toggleSecurity(!isSecurityEnabled)
                .then(() => {
                    // reload UI
                    // TODO: Not sure if we really need to reload the page here. The UI state is updated just fine. But maybe the reload is needed for something else?
                    // Remove and fix this when migrated
                    $window.location.reload();
                });
        };

        const setFreeAccess = function(enabled, authSettings) {
            // TODO: check this what app settings are provided here and if cookie settings should be updated in the storage
            return securityServiceAPI.setFreeAccess(enabled, authSettings);
        };

        /**
         * @param {boolean|undefined} updateFreeAccess - Whether to enable or disable free access. If undefined, the
         * free access has not been set yet.
         */
        $scope.toggleFreeAccess = function(updateFreeAccess) {
            if (!authorizationService.hasFreeAccess() || (authorizationService.hasFreeAccess() && updateFreeAccess)) {
                // enable and configure or only configure
                securityServiceAPI.getFreeAccess()
                    .then((freeAccessAuthSettings) => {
                        const authorities = mapGrantedAuthoritiesResponseToModel(freeAccessAuthSettings.authorities).getItems();
                        const appSettings = freeAccessAuthSettings.appSettings ?? {
                            'DEFAULT_SAMEAS': true,
                            'DEFAULT_INFERENCE': true,
                            'EXECUTE_COUNT': true,
                            'IGNORE_SHARED_QUERIES': false,
                            'DEFAULT_VIS_GRAPH_SCHEMA': true,
                        };
                        return configureFreeAccess(appSettings, authorities, updateFreeAccess);
                    })
                    .then((updatedFreeAccessAuthSettings) => setFreeAccess(updateFreeAccess || !$jwtAuth.isFreeAccessEnabled(), updatedFreeAccessAuthSettings))
                    .then(() => {
                        const translateKey = updateFreeAccess ? 'jwt.auth.free.access.updated.msg' : 'jwt.auth.free.access.status';
                        toastrService.success($translate.instant(translateKey, {status: $translate.instant('enabled.status')}));
                    })
                    .catch((err) => {
                        if (err === 'cancel') {
                            // Check if modal was dismissed by user
                            return;
                        }
                        toastrService.error(err.data ?? err, $translate.instant('common.error'));
                    });
            } else {
                // disable
                setFreeAccess(!authorizationService.hasFreeAccess())
                    .then(() => {
                        toastrService.success($translate.instant('jwt.auth.free.access.status', {status: ($translate.instant('disabled.status'))}));
                    })
                    .catch((err) => {
                        toastrService.error(err.data, $translate.instant('common.error'));
                    });
            }
        };

        const configureFreeAccess = (appSettings, authorities, updateFreeAccess) => {
            const modalInstance = $uibModal.open({
                templateUrl: 'js/angular/security/templates/modal/default-authorities.html',
                controller: 'DefaultAuthoritiesCtrl',
                resolve: {
                    data: function() {
                        return {
                            // converts the array rights to hash ones. why, oh, why do we have both formats?
                            defaultAuthorities: function() {
                                const defaultAuthorities = {
                                    [READ_REPO]: {},
                                    [WRITE_REPO]: {},
                                    [GRAPHQL]: {},
                                };
                                // We might have old (no longer existing) repositories so we have to check that
                                const repoIds = _.mapKeys($scope.getRepositories(), function(r) {
                                    return repositoryAuthorityService.getLocationSpecificId(r);
                                });
                                _.each(authorities, function(a) {
                                    // indexOf works in IE 11, startsWith doesn't
                                    if (a.indexOf(WRITE_REPO_PREFIX) === 0) {
                                        if (repoIds.hasOwnProperty(a.substr(11))) {
                                            defaultAuthorities[WRITE_REPO][a.substr(11)] = true;
                                        }
                                    } else if (a.indexOf(READ_REPO_PREFIX) === 0) {
                                        if (repoIds.hasOwnProperty(a.substr(10))) {
                                            defaultAuthorities[READ_REPO][a.substr(10)] = true;
                                        }
                                    } else if (a.indexOf(GRAPHQL_PREFIX) === 0) {
                                        if (repoIds.hasOwnProperty(a.substr(8))) {
                                            defaultAuthorities[GRAPHQL][a.substr(8)] = true;
                                        }
                                    }
                                });
                                return defaultAuthorities;
                            },
                            appSettings: appSettings,
                        };
                    },
                },
            });
            return modalInstance.result.then(function(data) {
                authorities = data.authorities;
                appSettings = data.appSettings;
                return mapAuthSettingsResponseToModel({
                    enabled: updateFreeAccess || !authorizationService.hasFreeAccess(),
                    appSettings,
                    authorities,
                });
            });
        };

        $scope.editFreeAccess = function() {
            $scope.toggleFreeAccess(true);
        };

        $scope.canRemoveExtendedPermissions = (user) => $scope.canExtendExternalUserRole && user.isExtended && user.hasExternalLogin;

        $scope.canDeleteUser = (user) => {
            if ($scope.canRemoveExtendedPermissions(user)) {
                return false;
            }

            if ($scope.canExtendExternalUserRole) {
                return user.isExtended;
            }

            return !$scope.hasExternalAuth() && user.username !== 'admin';
        };

        $scope.removeUser = function(user) {
            let title = $translate.instant('common.confirm.delete');
            let message = $translate.instant('security.confirm.delete.user', {name: user.username});
            if ($scope.canExtendExternalUserRole) {
                const canDowngradedUserPermissions = $scope.canRemoveExtendedPermissions(user);
                const dialogTitleKey = canDowngradedUserPermissions ? 'security.confirm.remove.extended.user.permissions.title' : 'security.confirm.delete.extended.user.title';
                const dialogMessageKey = canDowngradedUserPermissions ? 'security.confirm.remove.extended.user.permissions.body' : 'security.confirm.delete.extended.user.body';
                title = decodeHTML($translate.instant(dialogTitleKey, {name: user.username}));
                message = decodeHTML($translate.instant(dialogMessageKey, {name: user.username, authDB: $scope.authorizationImplementation}));
            }
            ModalService.openSimpleModal({
                title,
                message,
                warning: true,
            }).result.then(function() {
                $scope.loader = true;
                usersService.deleteUser(user.username)
                    .then(() => $scope.getUsers())
                    .catch((data) => {
                        const msg = getError(data);
                        toastr.error(msg, $translate.instant('common.error'));
                        $scope.loader = false;
                    });
            });
        };

        // Should be able to send the original username to $routeParams
        $scope.encodeURIComponent = function(name) {
            return encodeURIComponent(name);
        };

        $scope.$on('$destroy', function() {
            subscriptions.forEach((unsubscribe) => unsubscribe());
        });
    }]);

securityModule.controller('DefaultAuthoritiesCtrl', ['$scope', '$http', '$uibModalInstance', 'data', '$rootScope',
    function($scope, $http, $uibModalInstance, data, $rootScope) {
        const repositoryAuthorityService = service(RepositoryAuthorityService);

        $scope.grantedAuthorities = data.defaultAuthorities();
        $scope.appSettings = data.appSettings;

        $scope.hasActiveLocation = function() {
            // Hack to get this from root scope to avoid cyclic dependency
            return !_.isEmpty($rootScope.globalLocation);
        };

        $scope.getRepositories = function() {
            // Hack to get this from root scope to avoid cyclic dependency
            return $rootScope.globalRepositories;
        };

        $scope.ok = function() {
            const auth = [];
            $scope.repositoryCheckError = true;
            for (const index in $scope.grantedAuthorities.WRITE_REPO) {
                if ($scope.grantedAuthorities.WRITE_REPO[index]) {
                    auth.push(WRITE_REPO_PREFIX + index);
                    auth.push(READ_REPO_PREFIX + index);
                    $scope.repositoryCheckError = false;
                }
            }
            for (const index in $scope.grantedAuthorities.READ_REPO) {
                if ($scope.grantedAuthorities.READ_REPO[index] && auth.indexOf(READ_REPO_PREFIX + index) === -1) {
                    auth.push(READ_REPO_PREFIX + index);
                    $scope.repositoryCheckError = false;
                }
            }
            for (const index in $scope.grantedAuthorities.GRAPHQL) {
                if ($scope.grantedAuthorities.GRAPHQL[index] && auth.indexOf(GRAPHQL_PREFIX + index) === -1) {
                    auth.push(GRAPHQL_PREFIX + index);
                }
            }
            if (!$scope.repositoryCheckError) {
                $uibModalInstance.close({authorities: auth, appSettings: $scope.appSettings});
            }
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.createUniqueKey = function(repository) {
            return repositoryAuthorityService.getLocationSpecificId(repository);
        };
    }]);

securityModule.controller('CommonUserCtrl', ['$rootScope', '$scope', '$http', 'toastr', '$window', '$timeout', '$location', '$jwtAuth', '$translate', 'passwordPlaceholder',
    function($rootScope, $scope, $http, toastr, $window, $timeout, $location, $jwtAuth, $translate, passwordPlaceholder) {
        const authorizationService = service(AuthorizationService);
        const repositoryAuthorityService = service(RepositoryAuthorityService);
        const securityContextService = service(SecurityContextService);

        $scope.canExtendExternalUserRole = authorizationService.canExtendExternalUsers();
        $scope.authorizationImplementation = securityContextService.getSecurityConfig()?.getAuthenticationImplementation();
        $scope.isOpenIDEnabled = securityContextService.getSecurityConfig()?.isOpenIdEnabled();
        $scope.isPasswordLoginEnabled = securityContextService.getSecurityConfig()?.isPasswordLoginEnabled();
        $scope.additionalAuthSources = securityContextService.getSecurityConfig()?.additionalAuthSources.join(', ');

        $rootScope.$on('$translateChangeSuccess', function() {
            $scope.passwordPlaceholder = $translate.instant(passwordPlaceholder);
        });
        $scope.isAdmin = function() {
            return authorizationService.hasRole(UserRole.ROLE_ADMIN);
        };
        $scope.hasExternalAuth = function() {
            return $jwtAuth.hasExternalAuth();
        };

        $scope.hasEditRestrictions = function() {
            return $scope.user && $scope.user.username === UserType.ADMIN;
        };

        $scope.isOverrideAuth = function() {
            return $jwtAuth.isDefaultAuthEnabled();
        };

        $scope.isGraphQlOnlyRight = function(repository) {
            const isManageRepoUser = $scope.hasManageRepositoryPermission(repository);
            const hasGraphQlPermissions = $scope.hasGraphqlPermission(repository) || $scope.hasGraphqlPermission('*');
            const hasReadWritePermissions = $scope.hasReadPermission(repository) || $scope.hasReadPermission('*') || $scope.hasWritePermission(repository) || $scope.hasWritePermission('*');
            return !isManageRepoUser && hasGraphQlPermissions && hasReadWritePermissions;
        };

        $scope.setGrantedAuthorities = function() {
            function pushAuthority(...authorities) {
                for (let i = 0; i < authorities.length; i++) {
                    const authority = authorities[i];
                    if (_.indexOf($scope.user.grantedAuthorities, authority) < 0) {
                        $scope.user.grantedAuthorities.push(authority);
                    }
                }
            }

            $scope.user.grantedAuthorities = [];
            $scope.repositoryCheckError = true;
            if ($scope.userType === UserType.ADMIN) {
                $scope.repositoryCheckError = false;
                pushAuthority(UserRole.ROLE_ADMIN);
            } else if ($scope.userType === UserType.REPO_MANAGER) {
                $scope.repositoryCheckError = false;
                pushAuthority(UserRole.ROLE_REPO_MANAGER);
            } else {
                pushAuthority(UserRole.ROLE_USER);
                for (const index in $scope.grantedAuthorities.MANAGE_REPO) {
                    if ($scope.grantedAuthorities.MANAGE_REPO[index]) {
                        $scope.repositoryCheckError = false;
                        pushAuthority(MANAGE_REPO_PREFIX + index, WRITE_REPO_PREFIX + index, READ_REPO_PREFIX + index);
                    }
                }

                for (const index in $scope.grantedAuthorities.WRITE_REPO) {
                    if ($scope.grantedAuthorities.WRITE_REPO[index]) {
                        $scope.repositoryCheckError = false;
                        pushAuthority(WRITE_REPO_PREFIX + index, READ_REPO_PREFIX + index);
                    }
                }
                for (const index in $scope.grantedAuthorities.READ_REPO) {
                    if ($scope.grantedAuthorities.READ_REPO[index]) {
                        $scope.repositoryCheckError = false;
                        pushAuthority(READ_REPO_PREFIX + index);
                    }
                }
                for (const index in $scope.grantedAuthorities.GRAPHQL) {
                    if ($scope.grantedAuthorities.GRAPHQL[index]) {
                        const hasReadPermission = $scope.grantedAuthorities.READ_REPO[index] || $scope.grantedAuthorities.READ_REPO['*'];
                        const hasWritePermission = $scope.grantedAuthorities.WRITE_REPO[index] || $scope.grantedAuthorities.WRITE_REPO['*'];
                        if (hasReadPermission || hasWritePermission) {
                                pushAuthority(GRAPHQL_PREFIX + index);
                            }
                    }
                }
            }
            if ($scope.customRoles) {
                $scope.customRoles.forEach((role) => pushAuthority('CUSTOM_' + role));
            }
        };

        $scope.$watch('userType', function() {
            if (!$scope.isUser()) {
                $scope.customRoles = '';
            }
        });

        $scope.isUser = function() {
            return $scope.userType === UserType.USER;
        };

        $scope.hasReadPermission = function(repository) {
            const uniqueKey = repositoryAuthorityService.getLocationSpecificId(repository);
            return $scope.userType === UserType.ADMIN
                || $scope.userType === UserType.REPO_MANAGER
                || repository.id !== SYSTEM_REPO && ($scope.grantedAuthorities.READ_REPO['*']
                || $scope.grantedAuthorities.WRITE_REPO['*'])
                || $scope.grantedAuthorities.READ_REPO[uniqueKey]
                || $scope.grantedAuthorities.WRITE_REPO[uniqueKey]
                || $scope.grantedAuthorities.MANAGE_REPO[uniqueKey];
        };

        $scope.hasWritePermission = function(repoOrWildCard) {
            const uniqueKey = repositoryAuthorityService.getLocationSpecificId(repoOrWildCard);
            return $scope.userType === UserType.ADMIN
                || $scope.userType === UserType.REPO_MANAGER
                || repoOrWildCard.id !== SYSTEM_REPO && $scope.grantedAuthorities.WRITE_REPO['*']
                || $scope.grantedAuthorities.MANAGE_REPO[uniqueKey]
                || $scope.grantedAuthorities.WRITE_REPO[uniqueKey];
        };

        $scope.hasManageRepositoryPermission = function(repoOrWildCard) {
            const uniqueKey = repositoryAuthorityService.getLocationSpecificId(repoOrWildCard);
            return $scope.userType === UserType.ADMIN
                || $scope.userType === UserType.REPO_MANAGER
                || $scope.grantedAuthorities.MANAGE_REPO[uniqueKey];
        };

        $scope.hasGraphqlPermission = function(repository) {
            const uniqueKey = repositoryAuthorityService.getLocationSpecificId(repository);
            const isManageRepoUser = $scope.hasManageRepositoryPermission(repository);
            const hasGraphQlPermissions = $scope.grantedAuthorities.GRAPHQL['*'] || $scope.grantedAuthorities.GRAPHQL[uniqueKey];
            const hasReadWritePermissions = $scope.hasReadPermission(repository);
            const isSystemRepo = repository.id === SYSTEM_REPO;

            return !isManageRepoUser && (!isSystemRepo && hasGraphQlPermissions && hasReadWritePermissions);
        };

        $scope.readCheckDisabled = function(repoOrWildCard) {
            if ($scope.canExtendExternalUserRole && !$scope.isRoleExtensionEnabled) {
                return true;
            }
            return $scope.hasWritePermission(repoOrWildCard)
                || repoOrWildCard.id !== SYSTEM_REPO && repoOrWildCard !== '*' && $scope.grantedAuthorities.READ_REPO['*']
                || $scope.hasEditRestrictions();
        };

        $scope.writeCheckDisabled = function(repoOrWildCard) {
            if ($scope.canExtendExternalUserRole && !$scope.isRoleExtensionEnabled) {
                return true;
            }
            return $scope.hasManageRepositoryPermission(repoOrWildCard)
                || repoOrWildCard.id !== SYSTEM_REPO && repoOrWildCard !== '*' && $scope.grantedAuthorities.WRITE_REPO['*']
                || $scope.hasEditRestrictions();
        };

        $scope.manageRepoCheckDisabled = function() {
            if ($scope.canExtendExternalUserRole && !$scope.isRoleExtensionEnabled) {
                return true;
            }
            return $scope.userType === UserType.ADMIN
                || $scope.userType === UserType.REPO_MANAGER
                || $scope.hasEditRestrictions();
        };

        /**
         * Determines whether the GraphQL checkbox for a given repository or wildcard
         * should be disabled.
         *
         * @param {Object|string} repoOrWildCard - A repo object or the string wildcard '*'
         * @returns {boolean} true if disabled, false if enabled
         */
        $scope.graphqlCheckDisabled = function(repoOrWildCard) {
            if ($scope.hasManageRepositoryPermission(repoOrWildCard)) {
                return true;
            }

            if ($scope.hasEditRestrictions()) {
                return true;
            }

            if ($scope.canExtendExternalUserRole && !$scope.isRoleExtensionEnabled) {
                return true;
            }

            const hasReadWildcard = $scope.grantedAuthorities.READ_REPO['*'];
            const hasWriteWildcard = $scope.grantedAuthorities.WRITE_REPO['*'];
            const hasGraphqlWildcard = $scope.grantedAuthorities.GRAPHQL['*'];


            if (repoOrWildCard !== '*' && hasGraphqlWildcard) {
                return true;
            }

            if (repoOrWildCard === '*' && hasGraphqlWildcard && hasReadWildcard) {
                return false;
            }

            let uniqueKey;
            if (repoOrWildCard !== null && typeof repoOrWildCard === 'object') {
                uniqueKey = repositoryAuthorityService.getLocationSpecificId(repoOrWildCard);
            } else {
                uniqueKey = repoOrWildCard;
            }

            const hasReadForRepo = $scope.grantedAuthorities.READ_REPO[uniqueKey];
            const hasWriteForRepo = $scope.grantedAuthorities.WRITE_REPO[uniqueKey];

            return !(hasReadWildcard || hasWriteWildcard || hasReadForRepo || hasWriteForRepo);
        };

        $scope.createUniqueKey = function(repository) {
            return repositoryAuthorityService.getLocationSpecificId(repository);
        };

        $scope.userType = UserType.USER;
        $scope.grantedAuthorities = {
            [READ_REPO]: {},
            [WRITE_REPO]: {},
            [MANAGE_REPO]: {},
            [GRAPHQL]: {},
        };

        $scope.validatePassword = function() {
            if ($scope.noPassword) {
                $scope.passwordError = '';
                $scope.confirmPasswordError = '';
                return true;
            }
            if ($scope.user.password !== $scope.user.confirmpassword) {
                if (!$scope.user.password) {
                    $scope.passwordError = $translate.instant('security.enter.password');
                    $scope.confirmPasswordError = '';
                } else {
                    $scope.passwordError = '';
                    $scope.confirmPasswordError = $translate.instant('security.confirm.password');
                }
                return false;
            } else {
                $scope.passwordError = '';
                $scope.confirmPasswordError = '';
            }
            return true;
        };

        $scope.isLocalAuthentication = function() {
            return $jwtAuth.getAuthImplementation() === 'Local';
        };

        $scope.updateUser = function() {
            if (!$scope.validateForm()) {
                return false;
            }

            if ($scope.isLocalAuthentication() || ($scope.canExtendExternalUserRole && $scope.isRoleExtensionEnabled)) {
                $scope.setGrantedAuthorities();
            }

            if (!$scope.repositoryCheckError) {
                $scope.updateUserHttp();
            }
        };

        $scope.setNoPassword = function() {
            if ($scope.noPassword) {
                $scope.user.password = '';
                $scope.user.confirmpassword = '';
                $scope.passwordError = '';
                $scope.confirmPasswordError = '';
            }
        };

        $scope.shouldDisableSameAs = function() {
            const sameAsCheckbox = $('#sameAsCheck');
            if ($scope.user && !$scope.user.appSettings.DEFAULT_INFERENCE && sameAsCheckbox.prop('checked')) {
                sameAsCheckbox.prop('checked', false);
                $scope.user.appSettings.DEFAULT_SAMEAS = false;
            }

            return $scope.user && !$scope.user.appSettings.DEFAULT_INFERENCE;
        };

        /**
         * The validity of the last user typed custom role.
         * @type {boolean}
         */
        $scope.isRoleValid = true;
        const minTagLength = 2;

        /**
         * Adds the user typed custom role and sets role validity flag to true.
         *
         * @param {{text: string}} role the user input
         * @return {{text: string}} the user input in uppercase
         */
        $scope.addCustomRole = function(role) {
            $scope.isRoleValid = true;
            role.text = role.text.toUpperCase();
            return role;
        };

        /**
         * Checks if the input text is valid or not.
         *
         * @param {{text: string}} fieldValue the user input
         * @return {boolean} true if valid, otherwise false
         */
        $scope.isCustomRoleValid = function(fieldValue) {
            $scope.isRoleValid = fieldValue.text.length >= minTagLength;
            return $scope.isRoleValid;
        };

        /**
         * Checks if the user pressed the 'Backspace' or 'Delete' key and sets the role validity flag accordingly.
         *
         * @param {Object} event
         */
        $scope.checkUserInput = function(event) {
            // If the key pressed is the backspace or delete key, the tag error message will be hidden
            if (event.keyCode === 8 || event.keyCode === 46) {
                $scope.isRoleValid = true;
            }
        };

        /**
         * Sets the role validity flag to true.
         */
        $scope.removeErrorOnCut = function() {
            // If the user cuts text from the field, the tag error message will be hidden
            $scope.isRoleValid = true;
        };
    }]);

securityModule.controller('AddUserCtrl', ['$scope', '$http', 'toastr', '$window', '$timeout', '$location', '$jwtAuth', '$controller', 'SecurityService', 'ModalService', '$translate',
    function($scope, $http, toastr, $window, $timeout, $location, $jwtAuth, $controller, SecurityService, ModalService, $translate) {
        // eslint-disable-next-line no-invalid-this
        angular.extend(this, $controller('CommonUserCtrl', {$scope: $scope, passwordPlaceholder: 'security.password.placeholder'}));
        const usersService = service(UsersService);

        $scope.mode = 'add';
        $scope.saveButtonText = $translate.instant('common.create.btn');
        $scope.goBack = function() {
            $location.url('users');
        };
        $scope.pageTitle = $translate.instant('view.create.user.title');
        $scope.passwordPlaceholder = $translate.instant('security.password.placeholder');

        $scope.user = {
            'username': '',
            'password': '',
            'confirmpassword': '',
            'grantedAuthorities': [],
            'appSettings': {
                'DEFAULT_SAMEAS': true,
                'DEFAULT_INFERENCE': true,
                'EXECUTE_COUNT': true,
                'IGNORE_SHARED_QUERIES': false,
                'DEFAULT_VIS_GRAPH_SCHEMA': true,
            },
        };

        $scope.isRoleExtensionEnabled = true;

        if ($scope.canExtendExternalUserRole) {
            $scope.noPassword = true;
            $scope.setNoPassword();
        }

        $scope.submit = function() {
            if (!$scope.canExtendExternalUserRole && $scope.noPassword && $scope.userType === UserType.ADMIN) {
                ModalService.openSimpleModal({
                    title: $translate.instant('security.create.admin'),
                    message: $translate.instant('security.admin.login.warning'),
                    warning: true,
                }).result.then(function() {
                    $scope.createUser();
                });
            } else {
                $scope.createUser();
            }
        };

        $scope.createUserHttp = function() {
            $scope.loader = true;
            const user = new User({
                username: $scope.user.username,
                password: $scope.user.password,
                appSettings: new AppSettings($scope.user.appSettings),
                authorities: new AuthorityList($scope.user.grantedAuthorities),
            });
            usersService.createUser(user)
                .then(() => {
                    toastr.success($translate.instant('security.user.created', {name: $scope.user.username}));
                    const timer = $timeout(function() {
                        $scope.loader = false;
                        $location.path('users');
                    }, 2000);
                    $scope.$on('$destroy', function() {
                        $timeout.cancel(timer);
                    });
                })
                .catch(async (data) => {
                    $scope.loader = false;
                    toastr.error(getError(data), $translate.instant('common.error'));
                });
        };

        $scope.createUser = function() {
            if ($scope.validateForm()) {
                $scope.setGrantedAuthorities();

                if (!$scope.repositoryCheckError) {
                    $scope.createUserHttp();
                }
            }
        };

        $scope.validateForm = function() {
            let result = true;
            if (!$scope.user.username) {
                $scope.usernameError = $translate.instant('security.enter.username');
                result = false;
            } else {
                $scope.usernameError = '';
            }
            if ($scope.noPassword) {
                $scope.passwordError = '';
                $scope.confirmPasswordError = '';
            } else {
                if (!$scope.user.password) {
                    $scope.passwordError = $translate.instant('security.enter.password');
                    result = false;
                } else {
                    $scope.passwordError = '';
                }
                if (!$scope.user.confirmpassword || $scope.user.password !== $scope.user.confirmpassword) {
                    $scope.confirmPasswordError = $translate.instant('security.confirm.password');
                    result = false;
                } else {
                    $scope.confirmPasswordError = '';
                }
            }

            return result;
        };
    }]);

securityModule.controller('EditUserCtrl', ['$scope', '$http', 'toastr', '$window', '$routeParams', '$timeout', '$location', '$jwtAuth', '$controller', 'SecurityService', 'ModalService', '$translate',
    function($scope, $http, toastr, $window, $routeParams, $timeout, $location, $jwtAuth, $controller, SecurityService, ModalService, $translate) {
        // eslint-disable-next-line no-invalid-this
        angular.extend(this, $controller('CommonUserCtrl', {$scope: $scope, passwordPlaceholder: 'security.new.password'}));
        const usersService = service(UsersService);
        const authorizationService = service(AuthorizationService);
        const securityContextService = service(SecurityContextService);

        $scope.mode = 'edit';
        $scope.saveButtonText = $translate.instant('common.save.btn');
        $scope.goBack = function() {
            $location.url('users');
        };
        $scope.params = $routeParams;
        $scope.pageTitle = $translate.instant('view.edit.user.title', {userId: $scope.params.userId});
        $scope.passwordPlaceholder = $translate.instant('security.new.password');
        $scope.userType = UserType.USER;
        const defaultUserSettings = {
            'DEFAULT_SAMEAS': true,
            'DEFAULT_INFERENCE': true,
            'EXECUTE_COUNT': true,
            'IGNORE_SHARED_QUERIES': false,
            'DEFAULT_VIS_GRAPH_SCHEMA': true,
        };

        $scope.isRoleExtensionEnabled = false;

        if (!authorizationService.hasRole(UserRole.ROLE_ADMIN)) {
            $location.url('settings');
        }
        $scope.getUserData = function() {
            usersService.getUser($scope.params.userId).then(function(data) {
                $scope.user = {username: data.username};
                $scope.user.password = '';
                $scope.user.confirmpassword = '';
                $scope.user.appSettings = data.appSettings || defaultUserSettings;
                $scope.userType = data.getUserType();
                $scope.grantedAuthorities = data.authorities.toUIModel();
                $scope.customRoles = data.authorities.getCustomRoles();
                $scope.user.isExtended = $scope.canExtendExternalUserRole && !!data.authorities.size();
                $scope.isRoleExtensionEnabled = $scope.user?.isExtended ?? false;
            }).catch(function(data) {
                const msg = getError(data);
                toastr.error(msg, $translate.instant('common.error'));
            });
        };

        $scope.getUserData();

        $scope.submit = function() {
            if (!$scope.canExtendExternalUserRole && $scope.noPassword && $scope.userType === UserType.ADMIN) {
                ModalService.openSimpleModal({
                    title: $translate.instant('security.save.admin.settings'),
                    message: $translate.instant('security.admin.pass.unset'),
                    warning: true,
                }).result.then(function() {
                    $scope.updateUser();
                });
            } else {
                $scope.updateUser();
            }
        };

        $scope.updateUserHttp = function() {
            $scope.loader = true;
            const user = new User({
                username: $scope.user.username,
                password: $scope.noPassword ? '' : $scope.user.password || undefined,
                appSettings: new AppSettings($scope.user.appSettings),
                authorities: new AuthorityList($scope.user.grantedAuthorities),
            });
            usersService.updateUser(user).then(() => {
                toastr.success($translate.instant('security.user.updated', {name: $scope.user.username}));
                const timer = $timeout(function() {
                    $scope.loader = false;
                    $location.path('users');
                }, 2000);
                $scope.$on('$destroy', function() {
                    $timeout.cancel(timer);
                });
                // if we update the settings of the currently logged user, update the principal
                const principal = securityContextService.getAuthenticatedUser();
                if ($scope.user.username === principal.username) {
                    // TODO: Discuss what's the point in updating the principal's appSettings here?!
                    // principal.appSettings = $scope.user.appSettings;
                    principal.setAppSettings(new AppSettings($scope.user.appSettings));
                }
            }).catch((data) => {
                const msg = getError(data);
                $scope.loader = false;
                toastr.error(msg, $translate.instant('common.error'));
            });
        };

        $scope.validateForm = function() {
            return $scope.validatePassword();
        };
    }]);

securityModule.controller('RolesMappingController', ['$scope', 'toastr', 'SecurityService', '$translate',
    function($scope, toastr, SecurityService, $translate) {
        $scope.debugMapping = function(role, mapping) {
            const method = mapping.split(':');
            SecurityService.getRolesMapping({
                role: role,
                method: method[1],
                mapping: method[0],
            });
        };

        const loadRoles = function() {
            SecurityService.getRoles()
                .success(function(data) {
                    $scope.roleMappings = data;
                    $scope.roles = _.keys($scope.roleMappings);
                    $scope.mappings = _.keys($scope.roleMappings[$scope.roles[0]]);
                    const permissionsCount = _.map($scope.roles, function(role) {
                        return [role, _.filter($scope.roleMappings[role]).length];
                    });
                    $scope.roles = _.reverse(_.map(_.orderBy(permissionsCount, function(p) {
                        return p[1];
                    }), function(p) {
                        return p[0];
                    }));
                })
                .error(function(data) {
                    const msg = getError(data);
                    $scope.loader = false;
                    toastr.error(msg, $translate.instant('common.error'));
                });
        };

        $scope.$on('repositoryIsSet', function() {
            loadRoles();
        });
    }]);

securityModule.controller('DeleteUserCtrl', ['$scope', '$uibModalInstance', 'username', function($scope, $uibModalInstance, username) {
    $scope.username = username;

    $scope.ok = function() {
        $uibModalInstance.close();
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}]);
