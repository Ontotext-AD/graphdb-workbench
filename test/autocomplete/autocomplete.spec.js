import 'angular/autocomplete/app';
import 'angular/autocomplete/controllers';
import 'angular/rest/autocomplete.rest.service';
import {FakeModal} from '../mocks';
import {bundle} from "../test-main";

let mocks = angular.module('Mocks', []);
mocks.service('$repositories', function () {
    this.getActiveRepository = function () {
        return '';
    };
    this.isActiveRepoOntopType = function () {
        return false;
    };
    this.isActiveRepoFedXType = function () {
        return false;
    };
    this.getDegradedReason = function () {
    };
});
mocks.service('$autocompleteStatus', function () {
        this.setAutocompleteStatus = function (status) {
            return;
        };
    });
mocks.service('$licenseService', function() {
    this.isLicenseValid = function() {
        return true;
    }
});
describe('Autocomplete', function () {

    beforeEach(angular.mock.module('graphdb.framework.autocomplete.controllers'));

    describe('AutocompleteCtrl', () => {
        let $scope;
        let $http;
        let $interval;
        let toastr;
        let $repositories;
        let $licenseService;
        let $uibModal;
        let $timeout;
        let $controller;
        let AutocompleteRestService;
        let RDF4JRepositoriesRestService;
        let UriUtils;
        let $httpBackend;
        let createController;
        let modalInstance;
        let $autocompleteStatus;
        let $translate;

        beforeEach(angular.mock.module('Mocks'));

        beforeEach(angular.mock.inject(function (_$rootScope_, _$http_, _$interval_, _toastr_, _$repositories_, _$licenseService_, _$timeout_, _$controller_, _AutocompleteRestService_, _RDF4JRepositoriesRestService_, _UriUtils_, _$httpBackend_, $q, _$autocompleteStatus_, _$translate_) {
            $scope = _$rootScope_.$new();
            $http = _$http_;
            $interval = _$interval_;
            toastr = _toastr_;
            $repositories = _$repositories_;
            $licenseService = _$licenseService_;
            $uibModal = new FakeModal($q, _$rootScope_);
            modalInstance = $uibModal;
            $timeout = _$timeout_;
            $controller = _$controller_;
            AutocompleteRestService = _AutocompleteRestService_;
            RDF4JRepositoriesRestService = _RDF4JRepositoriesRestService_;
            UriUtils = _UriUtils_;
            $httpBackend = _$httpBackend_;
            $autocompleteStatus = _$autocompleteStatus_;
            $translate = _$translate_;

            $translate.instant = function (key) {
                return bundle[key];
            };

            createController = () => $controller('AutocompleteCtrl', {
                $scope: $scope,
                $http: $http,
                $interval: $interval,
                toastr: toastr,
                $repositories: $repositories,
                $licenseService: $licenseService,
                $uibModal: $uibModal,
                $timeout: $timeout,
                AutocompleteRestService,
                $autocompleteStatus,
                $translate
            });

            createController();

            $httpBackend.when('GET', 'rest/autocomplete/status').respond(200);

            $httpBackend.when('GET', 'rest/autocomplete/enabled').respond(200, true);
            $httpBackend.when('POST', 'rest/autocomplete/enabled?enabled=true').respond(200);
            $httpBackend.when('POST', 'rest/autocomplete/enabled?enabled=false').respond(200);

            $httpBackend.when('GET', 'rest/autocomplete/iris').respond(200);
            $httpBackend.when('POST', 'rest/autocomplete/iris?enabled=true').respond(200);
            $httpBackend.when('POST', 'rest/autocomplete/iris?enabled=false').respond(200);

            $httpBackend.when('POST', 'rest/autocomplete/reindex').respond(200);

            $httpBackend.when('POST', 'rest/autocomplete/interrupt').respond(200);

            $httpBackend.when('GET', 'rest/autocomplete/labels').respond(200);
            $httpBackend.when('GET', 'rest/autocomplete/labels').respond(200);
            $httpBackend.when('GET', 'repositories/repo/namespaces').respond(200, {results: {bindings: []}});
            $httpBackend.when('DELETE', 'rest/autocomplete/labels', {
                'Content-Type': 'application/json;charset=utf-8'
            }).respond(200);
        }));

        describe('getLoaderMessage', () => {
            it('should return default message', function () {
                expect($scope.getLoaderMessage()).toEqual('Loading...');
            });

            it('should custom message', () => {
                $scope.loaderMessage = 'Custom message';
                expect($scope.getLoaderMessage()).toEqual('Custom message');
            });
        });

        describe('toggleAutocomplete', () => {
            it('should enable autocomplete', () => {
                $scope.loader = false;
                $scope.autocompleteEnabled = false;
                // should call service to enable autocomplete
                $httpBackend.expectPOST('rest/autocomplete/enabled?enabled=true').respond(200);
                // should call service to refresh autocomplete status. Why?
                $httpBackend.expectGET('rest/autocomplete/enabled');
                // should call service to refresh index status.
                $httpBackend.expectGET('rest/autocomplete/status');

                $scope.toggleAutocomplete();

                $timeout.flush();
                $httpBackend.flush();

                // should set loader with message
                expect($scope.loaderMessage).toEqual('Enabling autocomplete...');
                // at the end it's hid again
                expect($scope.loader).toEqual(false);
            });

            it('should disable autocomplete', () => {
                $scope.loader = false;
                $scope.autocompleteEnabled = true;
                // should call service to enable autocomplete
                $httpBackend.expectPOST('rest/autocomplete/enabled?enabled=false').respond(200);
                // should call service to refresh autocomplete status. Why?
                $httpBackend.expectGET('rest/autocomplete/enabled');
                // should call service to refresh index status.
                $httpBackend.expectGET('rest/autocomplete/status');

                $scope.toggleAutocomplete();

                $timeout.flush();
                $httpBackend.flush();

                // should set loader with message
                expect($scope.loaderMessage).toEqual('Disabling autocomplete...');
                // at the end it's hid again
                expect($scope.loader).toEqual(false);
            });

            it('should show notification when autocomplete enable fails', () => {
                $scope.loader = false;
                $scope.autocompleteEnabled = true;
                spyOn(toastr, 'error');
                $httpBackend.expectPOST('rest/autocomplete/enabled?enabled=false')
                    .respond(500, {
                        error: {
                            message: 'Autocomplete enable error!'
                        }
                    });

                $scope.toggleAutocomplete();

                $timeout.flush();
                $httpBackend.flush();

                expect(toastr.error).toHaveBeenCalledWith('Autocomplete enable error!');
                expect($scope.loader).toEqual(false);
            });

            it('should show notification when autocomplete refresh fails', () => {
                $scope.loader = false;
                $scope.autocompleteEnabled = true;
                spyOn(toastr, 'error');
                $httpBackend.expectPOST('rest/autocomplete/enabled?enabled=false').respond(200);
                $httpBackend.expectGET('rest/autocomplete/enabled').respond(500, {
                    error: {
                        message: 'Autocomplete status refresh error!'
                    }
                });

                $scope.toggleAutocomplete();

                $timeout.flush();
                $httpBackend.flush();

                expect(toastr.error).toHaveBeenCalledWith('Autocomplete status refresh error!');
                expect($scope.loader).toEqual(false);
            });

            it('should show notification when index refresh fails', () => {
                $scope.loader = false;
                $scope.autocompleteEnabled = true;
                spyOn(toastr, 'error');
                $httpBackend.expectPOST('rest/autocomplete/enabled?enabled=false').respond(200);
                $httpBackend.expectGET('rest/autocomplete/status').respond(500, {
                    error: {
                        message: 'Autocomplete index refresh error!'
                    }
                });

                $scope.toggleAutocomplete();

                $timeout.flush();
                $httpBackend.flush();

                expect(toastr.error).toHaveBeenCalledWith('Autocomplete index refresh error!');
                expect($scope.loader).toEqual(false);
            });
        });

        describe('toggleIndexIRIs', () => {
            it('should enable iris', () => {
                $scope.shouldIndexIRIs = false;
                // should call service to enable iris
                $httpBackend.expectPOST('rest/autocomplete/iris?enabled=true').respond(200);
                // should call service to refresh iris status.
                $httpBackend.expectGET('rest/autocomplete/iris');
                // should call service to refresh index status.
                $httpBackend.expectGET('rest/autocomplete/status');

                $scope.toggleIndexIRIs();

                $timeout.flush();
                $httpBackend.flush();

                expect($scope.loaderMessage).toEqual('Setting index IRIs...');
                // at the end it's hid again
                expect($scope.loader).toEqual(false);
            });

            it('should disable iris', () => {
                $scope.shouldIndexIRIs = true;
                // should call service to enable iris
                $httpBackend.expectPOST('rest/autocomplete/iris?enabled=false').respond(200);
                // should call service to refresh autocomplete status.
                $httpBackend.expectGET('rest/autocomplete/iris');
                // should call service to refresh index status.
                $httpBackend.expectGET('rest/autocomplete/status');

                $scope.toggleIndexIRIs();

                $timeout.flush();
                $httpBackend.flush();

                expect($scope.loaderMessage).toEqual('Setting index IRIs...');
                // at the end it's hid again
                expect($scope.loader).toEqual(false);
            });

            it('should show notification on error', () => {
                $scope.loader = false;
                $scope.shouldIndexIRIs = true;
                spyOn(toastr, 'error');
                $httpBackend.expectPOST('rest/autocomplete/iris?enabled=false')
                    .respond(500, {
                        error: {
                            message: 'IRIS enable error!'
                        }
                    });

                $scope.toggleIndexIRIs();

                $timeout.flush();
                $httpBackend.flush();

                expect(toastr.error).toHaveBeenCalledWith('IRIS enable error!');
                expect($scope.loader).toEqual(false);
            });

            it('should show notification when iri refresh fails', () => {
                $scope.loader = false;
                $scope.shouldIndexIRIs = true;
                spyOn(toastr, 'error');
                $httpBackend.expectPOST('rest/autocomplete/iris?enabled=false').respond(200);
                $httpBackend.expectGET('rest/autocomplete/iris').respond(500, {
                    error: {
                        message: 'Autocomplete iri refresh error!'
                    }
                });

                $scope.toggleIndexIRIs();

                $timeout.flush();
                $httpBackend.flush();

                expect(toastr.error).toHaveBeenCalledWith('Autocomplete iri refresh error!');
                expect($scope.loader).toEqual(false);
            });
        });

        describe('buildIndex', () => {
            it('should trigger index rebuilding', () => {
                $scope.indexStatus = undefined;
                $httpBackend.expectPOST('rest/autocomplete/reindex').respond(200);

                $scope.buildIndex();

                $timeout.flush();
                $httpBackend.flush();

                expect($scope.loaderMessage).toEqual('Requesting index build...');
                // should set proper status
                expect($scope.indexStatus).toEqual('BUILDING');
                // at the end it's hid again
                expect($scope.loader).toEqual(false);
            });

            it('should show notification on error', () => {
                $scope.indexStatus = undefined;
                spyOn(toastr, 'error');
                $httpBackend.expectPOST('rest/autocomplete/reindex').respond(500, {
                    error: {
                        message: 'Index rebuilding error!'
                    }
                });

                $scope.buildIndex();

                $timeout.flush();
                $httpBackend.flush();

                expect(toastr.error).toHaveBeenCalledWith('Index rebuilding error!');
                expect($scope.indexStatus).toEqual(undefined);
                expect($scope.loader).toEqual(false);
            });
        });

        describe('interruptIndexing', () => {
            it('should interrupt indexing', () => {
                // should call service to interrupt indexing
                $httpBackend.expectPOST('rest/autocomplete/interrupt').respond(200);
                // should call service to refresh index status.
                $httpBackend.expectGET('rest/autocomplete/status');

                $scope.interruptIndexing();

                $timeout.flush();
                $httpBackend.flush();

                expect($scope.loaderMessage).toEqual('Interrupting index...');
                // at the end it's hid again
                expect($scope.loader).toEqual(false);
            });

            it('should show notification on error', () => {
                spyOn(toastr, 'error');
                $httpBackend.expectPOST('rest/autocomplete/interrupt').respond(500, {
                    error: {
                        message: 'Index interrupt error!'
                    }
                });

                $scope.interruptIndexing();

                $timeout.flush();
                $httpBackend.flush();

                expect(toastr.error).toHaveBeenCalledWith('Index interrupt error!');
                expect($scope.loader).toEqual(false);
            });
        });

        describe('getDegradedReason', () => {
            it('should return degraded reason', () => {
                spyOn($repositories, 'getDegradedReason');

                $scope.getDegradedReason();

                expect($repositories.getDegradedReason).toHaveBeenCalled();
            });
        });

        describe('addLabel', () => {
            it('should add new label', () => {
                spyOn($uibModal, 'open').and.returnValue(modalInstance);
                $scope.loader = false;
                // expect labels service to be called
                $httpBackend.expectPUT('rest/autocomplete/labels', {
                    labelIri: 'http://test',
                    languages: ''
                }).respond(200);
                // should refresh labels config.
                $httpBackend.expectGET('rest/autocomplete/labels');
                // should refresh index status.
                $httpBackend.expectGET('rest/autocomplete/status');

                $scope.addLabel();

                const argument = $uibModal.open.calls.first().args[0];
                expect(argument.templateUrl).toEqual('js/angular/autocomplete/templates/modal/add-label.html');
                expect(argument.controller).toEqual('AddLabelCtrl');

                modalInstance.close({labelIri: 'http://test', languages: ''});
                $timeout.flush();
                $httpBackend.flush();

                expect($scope.loaderMessage).toEqual('Updating label config...');
            });
        });

        describe('editLabel', () => {
            it('should edit label', () => {
                spyOn($uibModal, 'open').and.returnValue(modalInstance);
                $scope.loader = false;
                // expect labels service to be called
                $httpBackend.expectPUT('rest/autocomplete/labels', {
                    labelIri: 'http://test',
                    languages: ''
                }).respond(200);
                // should refresh labels config.
                $httpBackend.expectGET('rest/autocomplete/labels');
                // should refresh index status.
                $httpBackend.expectGET('rest/autocomplete/status');

                $scope.editLabel({labelIri: 'label/iri', languages: 'en'}, true);

                const argument = $uibModal.open.calls.first().args[0];
                expect(argument.templateUrl).toEqual('js/angular/autocomplete/templates/modal/add-label.html');
                expect(argument.controller).toEqual('AddLabelCtrl');

                modalInstance.close({labelIri: 'http://test', languages: ''});
                $timeout.flush();
                $httpBackend.flush();

                expect($scope.loaderMessage).toEqual('Updating label config...');
            });

            it('should show notification on error', () => {
                spyOn(toastr, 'error');
                spyOn($uibModal, 'open').and.returnValue(modalInstance);
                $scope.loader = false;
                // expect labels service to be called and respond with an error
                $httpBackend.expectPUT('rest/autocomplete/labels', {
                    labelIri: 'http://test',
                    languages: ''
                }).respond(500, {
                    error: {
                        message: 'Add label error!'
                    }
                });

                $scope.editLabel({labelIri: 'label/iri', languages: 'en'}, true);

                modalInstance.close({labelIri: 'http://test', languages: ''});
                $timeout.flush();
                $httpBackend.flush();

                expect($scope.loaderMessage).toEqual('Updating label config...');
                expect(toastr.error).toHaveBeenCalledWith('Add label error!');
                expect($scope.loader).toEqual(false);
            });

            it('should show notification when labels refresh fails', () => {
                spyOn(toastr, 'error');
                spyOn($uibModal, 'open').and.returnValue(modalInstance);
                $scope.loader = false;
                // expect labels service to be called and respond with an error
                $httpBackend.expectPUT('rest/autocomplete/labels', {
                    labelIri: 'http://test',
                    languages: ''
                }).respond(200);
                $httpBackend.expectGET('rest/autocomplete/labels').respond(500, {
                    error: {
                        message: 'Refresh labels error!'
                    }
                });

                $scope.editLabel({labelIri: 'label/iri', languages: 'en'}, true);

                modalInstance.close({labelIri: 'http://test', languages: ''});
                $timeout.flush();
                $httpBackend.flush();

                expect($scope.loaderMessage).toEqual('Updating label config...');
                expect(toastr.error).toHaveBeenCalledWith('Refresh labels error!');
                expect($scope.loader).toEqual(false);
            });
        });

        describe('removeLabel', () => {
            it('should remove label', () => {
                $scope.loader = false;
                $httpBackend.expectDELETE('rest/autocomplete/labels', {
                    'Content-Type': 'application/json;charset=utf-8',
                    'Accept': 'application/json, text/plain, */*'
                }).respond(200);
                // should refresh labels config.
                $httpBackend.expectGET('rest/autocomplete/labels');
                // should refresh index status.
                $httpBackend.expectGET('rest/autocomplete/status');

                $scope.removeLabel('label');

                $timeout.flush();
                $httpBackend.flush();

                // should set loader with message
                expect($scope.loaderMessage).toEqual('Updating label config...');
                // at the end it's hid again
                expect($scope.loader).toEqual(false);
            });

            it('should show notification on error', () => {
                spyOn(toastr, 'error');
                $scope.loader = false;
                $httpBackend.expectDELETE('rest/autocomplete/labels', {
                    'Content-Type': 'application/json;charset=utf-8',
                    'Accept': 'application/json, text/plain, */*'
                }).respond(500, {
                    error: {
                        message: 'Removing label error!'
                    }
                });

                $scope.removeLabel('label');

                $timeout.flush();
                $httpBackend.flush();

                expect($scope.loaderMessage).toEqual('Updating label config...');
                expect(toastr.error).toHaveBeenCalledWith('Removing label error!');
                expect($scope.loader).toEqual(false);
            });
        });

        describe('on repositoryIsSet', () => {
            it('should check if plugin is installed when repository is set', () => {
                spyOn($repositories, 'getActiveRepository').and.returnValue('');

                $scope.$broadcast('repositoryIsSet');
            });

            it('should do nothing if repository is not set', () => {
                spyOn($repositories, 'getActiveRepository').and.returnValue('repo');
                $scope.loader = false;
                $scope.pluginFound = false;
                $scope.autocompleteEnabled = false;
                $httpBackend.when('GET', 'rest/autocomplete/plugin-found').respond(200, true);
                // should check for the plugin
                $httpBackend.expectGET('rest/autocomplete/plugin-found');
                // should call namespaces
                $httpBackend.expectGET('repositories/repo/namespaces');
                // should refresh autocomplete status.
                $httpBackend.expectGET('rest/autocomplete/enabled');
                // should refresh iris status.
                $httpBackend.expectGET('rest/autocomplete/iris');
                // should refresh index status.
                $httpBackend.expectGET('rest/autocomplete/status');
                // should refresh labels config.
                $httpBackend.expectGET('rest/autocomplete/labels');

                $scope.$broadcast('repositoryIsSet');

                $httpBackend.flush();

                expect($repositories.getActiveRepository).toHaveBeenCalled();
                expect($scope.pluginFound).toEqual(true);
                expect($scope.autocompleteEnabled).toEqual(true);
                expect($scope.loader).toEqual(false);
            });
        });

        describe('init', () => {
            it('should not initiialize controller if no active repository is found', () => {
                $scope.pluginFound = false;
                spyOn($repositories, 'getActiveRepository').and.returnValue('');

                createController();

                expect($repositories.getActiveRepository).toHaveBeenCalled();
                expect($scope.pluginFound).toEqual(false);
            });

            it('should initialize controller if the autocomplete plugin is installed', () => {
                $scope.loader = false;
                $scope.pluginFound = false;
                $scope.autocompleteEnabled = false;
                spyOn($repositories, 'getActiveRepository').and.returnValue('repo');
                $httpBackend.when('GET', 'rest/autocomplete/plugin-found').respond(200, true);
                // should check for the plugin
                $httpBackend.expectGET('rest/autocomplete/plugin-found');
                // should call namespaces
                $httpBackend.expectGET('repositories/repo/namespaces');
                // should refresh autocomplete status.
                $httpBackend.expectGET('rest/autocomplete/enabled');
                // should refresh iris status.
                $httpBackend.expectGET('rest/autocomplete/iris');
                // should refresh index status.
                $httpBackend.expectGET('rest/autocomplete/status');
                // should refresh labels config.
                $httpBackend.expectGET('rest/autocomplete/labels');

                createController();
                $httpBackend.flush();

                expect($repositories.getActiveRepository).toHaveBeenCalled();
                expect($scope.pluginFound).toEqual(true);
                expect($scope.autocompleteEnabled).toEqual(true);
                expect($scope.loader).toEqual(false);

                spyOn($interval, 'cancel');
                $scope.$broadcast('$destroy');
                expect($interval.cancel).toHaveBeenCalled();
            });

            it('should disable autocomplete if the plugin is not installed', () => {
                $scope.loader = false;
                $scope.loading = true;
                $scope.pluginFound = false;
                $scope.autocompleteEnabled = false;
                spyOn($repositories, 'getActiveRepository').and.returnValue('repo');
                $httpBackend.when('GET', 'rest/autocomplete/plugin-found').respond(200, false);
                // should check for the plugin
                $httpBackend.expectGET('rest/autocomplete/plugin-found');

                createController();
                $httpBackend.flush();

                expect($repositories.getActiveRepository).toHaveBeenCalled();
                expect($scope.pluginFound).toEqual(false);
                expect($scope.autocompleteEnabled).toEqual(false);
                expect($scope.loader).toEqual(false);
                expect($scope.loading).toEqual(false);
            });

            it('should show notification on error', () => {
                $scope.loader = false;
                spyOn(toastr, 'error');
                spyOn($repositories, 'getActiveRepository').and.returnValue('repo');
                $httpBackend.when('GET', 'rest/autocomplete/plugin-found').respond(500, {
                    error: {
                        message: 'Plugin check failed!'
                    }
                });

                createController();
                $httpBackend.flush();

                expect(toastr.error).toHaveBeenCalledWith('Plugin check failed!');
                expect($scope.loader).toEqual(false);
            });
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

    describe('AddLabelCtrl', () => {
        let $scope;
        let $uibModalInstance;
        let $timeout;
        let createController;

        beforeEach(angular.mock.inject(function (_$rootScope_, _$timeout_, _$controller_, $q) {
            $scope = _$rootScope_.$new();
            $uibModalInstance = new FakeModal($q, _$rootScope_);
            $timeout = _$timeout_;

            createController = () => _$controller_('AddLabelCtrl', {
                $scope: $scope,
                $uibModalInstance: $uibModalInstance,
                $timeout: $timeout,
                data: {label: {label: 'test label'}, isNew: true}
            });
            createController();
        }));

        describe('on init', () => {
            it('should populate controller fields', () => {
                expect($scope.label).toEqual({label: 'test label'});
                expect($scope.isNew).toEqual(true);
            });
        });

        describe('when ok is selected', () => {
            it('should close the dialog when form is valid', () => {
                $scope.form = {$valid: true};
                spyOn($uibModalInstance, 'close');

                $scope.ok();

                expect($uibModalInstance.close).toHaveBeenCalledWith($scope.label);
            });

            it('should not close the dialog when form is invalid', () => {
                $scope.form = {$valid: false};
                spyOn($uibModalInstance, 'close');

                $scope.ok();

                expect($uibModalInstance.close).not.toHaveBeenCalled();
            });
        });

        describe('when cancel is selected', () => {
            it('should close the dialog', () => {
                spyOn($uibModalInstance, 'dismiss');

                $scope.cancel();

                expect($uibModalInstance.dismiss).toHaveBeenCalled();
            });
        });

        describe('setTemplate', () => {
            it('should set label iri and focus the field', () => {
                let elementMock = {
                    focus: () => {
                    }
                };
                spyOn(elementMock, 'focus');
                spyOn(window, '$').and.returnValue(elementMock);
                $scope.setTemplate('label_iri');

                $timeout.flush();

                expect($scope.label).toEqual({label: 'test label', labelIri: 'label_iri'});
                expect(elementMock.focus).toHaveBeenCalled();
            });
        });
    });
});
