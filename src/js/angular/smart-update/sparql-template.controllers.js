import 'angular/core/services';
import 'angular/core/services/repositories.service';
import 'angular/rest/monitoring.rest.service';
import 'angular/utils/notifications';
import {FILENAME_PATTERN} from "../repositories/repository.constants";


const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.monitoring.service',
    'toastr'
];

angular.module('graphdb.framework.smart-update.smart-update.controllers', modules, [
    'graphdb.framework.utils.notifications'
])
    .controller('SmartUpdateListCtrl', SmartUpdateListCtrl)
    .controller('SmartUpdateCreateCtrl', SmartUpdateCreateCtrl);

SmartUpdateListCtrl.$inject = ['$scope', '$repositories', 'SmartUpdatesRestService', 'toastr', 'ModalService'];

function SmartUpdateListCtrl($scope, $repositories, SmartUpdatesRestService, toastr, ModalService) {

    $scope.getSparqlTemplates = function () {
        // Only do this if there is an active repo that isn't an Ontop repo.
        // Ontop repos don't support Smart updates.
        if ($repositories.getActiveRepository() && !$repositories.isActiveRepoOntopType()) {
            SmartUpdatesRestService.getSmartUpdateTemplates().success(function (data) {
                $scope.smartUpdatesNames = data;
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Could not get Smart update templates');
            });
        } else {
            $scope.smartUpdatesNames = [];
        }
    };

    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function () {
        $scope.getSparqlTemplates();
    });

    $scope.deleteTemplate = function (name) {
        ModalService.openSimpleModal({
            title: 'Warning',
            message: 'Are you sure you want to delete the Smart update template ' + '\'' + name + '\'?',
            warning: true
        }).result
            .then(function () {
                SmartUpdatesRestService.deleteSmartUpdateTemplate(name)
                    .success(function () {
                        toastr.success(`${name} template deleted successfully`);
                        $scope.getSparqlTemplates();
                    }).error(function (e) {
                    toastr.error(getError(e), `Could not delete ${name} template`);
                });
            });
    };

    // Check if warning message should be shown or removed on repository change
    const repoIsSetListener = $scope.$on('repositoryIsSet', function () {
        $scope.setRestricted();
    });

    window.addEventListener('beforeunload', removeRepoIsSetListener);

    function removeRepoIsSetListener() {
        repoIsSetListener();
        window.removeEventListener('beforeunload', removeRepoIsSetListener);
    }
}

SmartUpdateCreateCtrl.$inject = ['$scope', '$location', 'toastr', '$repositories', '$window', '$timeout', 'SmartUpdatesRestService', 'RDF4JRepositoriesRestService', 'SparqlRestService', 'ModalService'];

function SmartUpdateCreateCtrl($scope, $location, toastr, $repositories, $window, $timeout, SmartUpdatesRestService, RDF4JRepositoriesRestService, SparqlRestService, ModalService) {

    $scope.name = $location.search().name || '';
    $scope.title = $scope.name ? `Edit ${$scope.name} Template` : 'Create Smart Update Template';
    $scope.getNamespaces = getNamespaces;
    $scope.setLoader = setLoader;
    $scope.addKnownPrefixes = addKnownPrefixes;
    $scope.noPadding = {paddingRight: 0, paddingLeft: 0};
    $scope.currentTabConfig = {};
    // This property is obligatory in order to show YASQUE and YASR properly
    $scope.orientationViewMode = true;
    $scope.currentQuery = {};


    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $location.path('smart-update');
        }
    });

    let timer = null;
    $scope.goBack = function () {
        timer = $timeout(function () {
            $window.history.back();
        }, 1000);
    };

    const locationChangeListener = $scope.$on('$locationChangeStart', function (event) {
        confirmExit(event);
    });

    window.addEventListener('beforeunload', showBeforeunloadMessage);

    function showBeforeunloadMessage(event) {
        if (!$scope.currentQuery.isPristine) {
            event.returnValue = true;
        }
    }

    function confirmExit(event) {
        if (!$scope.currentQuery.isPristine) {
            if (!confirm('You have unsaved changes. Are you sure that you want to exit?')) {
                event.preventDefault();
            } else {
                window.removeEventListener('beforeunload', showBeforeunloadMessage);
                locationChangeListener();
                $timeout.cancel(timer);
            }
        }
    }

    $scope.$on('$destroy', function (event) {
        window.removeEventListener('beforeunload', showBeforeunloadMessage);
        locationChangeListener();
        $timeout.cancel(timer);
    });

    const defaultTabConfig = {
        id: '1',
        name: '',
        query: 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
            'PREFIX urn: <http://example.com#>\n' +
            'DELETE {\n' +
            '  ?worker urn:hasSalary ?xxx .\n' +
            '} INSERT {\n' +
            '  ?id <urn:updatedOn> ?now .\n' +
            '} WHERE {\n' +
            '  ?id rdf:type urn:Factory .\n' +
            '  ?worker urn:worksIn ?id .\n' +
            '  bind(now() as ?now)\n' +
            '}\n',
        inference: true,
        sameAs: true,
        isNewTemplate: true,
        isPristine: true
    };

    $scope.saveTab = function () {
    };

    // Called when user clicks on a sample query
    $scope.setQuery = function (query) {
        // Hack for YASQE bug
        window.editor.setValue(query ? query : ' ');
    };

    if ($scope.name) {
        getSmartTemplate($scope.name);
    } else {
        setQueryFromTabConfig();
    }

    // FIXME: this is copy-pasted in graphs-config.controller.js and query-editor.controller.js. Find a way to avoid duplications
    function getNamespaces() {
        // Signals the namespaces are to be fetched => loader will be shown
        setLoader(true, 'Refreshing namespaces', 'Normally this is a fast operation but it may take longer if a bigger repository needs to be initialised first.');
        RDF4JRepositoriesRestService.getRepositoryNamespaces()
            .success(function (data) {
                const usedPrefixes = {};
                data.results.bindings.forEach(function (e) {
                    usedPrefixes[e.prefix.value] = e.namespace.value;
                });
                $scope.namespaces = usedPrefixes;
            })
            .error(function (data) {
                $scope.repositoryError = getError(data);
            })
            .finally(function () {
                // Signals namespaces were fetched => loader will be hidden
                setLoader(false);
                loadTab();
            });
    }

    function setLoader(isRunning, progressMessage, extraMessage) {
        const yasrInnerContainer = angular.element(document.getElementById('yasr-inner'));
        $scope.queryIsRunning = isRunning;
        if (isRunning) {
            $scope.queryStartTime = Date.now();
            $scope.countTimeouted = false;
            $scope.progressMessage = progressMessage;
            $scope.extraMessage = extraMessage;
            yasrInnerContainer.addClass('hide');
        } else {
            $scope.progressMessage = '';
            $scope.extraMessage = '';
            yasrInnerContainer.removeClass('hide');
        }

        // We might call this from angular or outside angular so take care of applying the scope.
        if ($scope.$$phase === null) {
            $scope.$apply();
        }
    }

    function loadTab() {
        $scope.tabsData = [$scope.currentQuery];

        const tab = $scope.currentQuery;

        if (!$scope.currentQuery.query) {
            // hack for YASQE bug
            window.editor.setValue(' ');
        } else {
            window.editor.setValue($scope.currentQuery.query);
        }

        $timeout(function () {
            $scope.currentTabConfig = {};
            $scope.currentTabConfig.queryType = tab.queryType;
            $scope.currentTabConfig.resultsCount = tab.resultsCount;

            $scope.currentTabConfig.offset = tab.offset;
            $scope.currentTabConfig.allResultsCount = tab.allResultsCount;
            $scope.currentTabConfig.page = tab.page;
            $scope.currentTabConfig.pageSize = tab.pageSize;

            $scope.currentTabConfig.timeFinished = tab.timeFinished;
            $scope.currentTabConfig.timeTook = tab.timeTook;
            $scope.currentTabConfig.sizeDelta = tab.sizeDelta;
            $scope.$apply();
        }, 0);

        if (!$scope.canWriteActiveRepo()) {
            window.editor.options.readOnly = true;
        }
    }

    function getSmartTemplate(name) {
        SmartUpdatesRestService.getSmartUpdateTemplate(name).success(function (templateContent) {
            defaultTabConfig.query = templateContent;
            defaultTabConfig.name = name;

            defaultTabConfig.isNewTemplate = !name;

            setQueryFromTabConfig();
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, `Could not get ${$scope.currentQuery.name} template`);
            $scope.repositoryError = msg;
        });
    }

    function setQueryFromTabConfig() {
        $scope.tabsData = $scope.tabs = [defaultTabConfig];
        $scope.currentQuery = angular.copy(defaultTabConfig);

        if (window.editor) {
            $scope.setQuery($scope.currentQuery.query);
            loadTab();
        }

        $scope.$watch(function () {
            return $scope.currentQuery.query;
        }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.setDirty();
            }
        });
    }

    $scope.saveTemplate = function () {
        if (!validateQuery()) {
            return;
        }

        if (!$scope.currentQuery.name) {
            toastr.error('Smart update template name is required');
            return;
        } else {
            $scope.isInvalidTemplateName = !FILENAME_PATTERN.test($scope.currentQuery.name);
            if ($scope.isInvalidTemplateName) {
                toastr.error('Invalid Smart update template name');
                return;
            }
        }

        if ($scope.currentQuery.isNewTemplate) {
            SmartUpdatesRestService.createSmartUpdateTemplate($scope.currentQuery).success(function () {
                $scope.currentQuery.isPristine = true;
                $scope.currentQuery.isNewTemplate = false;
                toastr.success(`${$scope.currentQuery.name} template saved`);
                $scope.goBack();
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, `Could not save ${$scope.currentQuery.name} template`);
            });
        } else {
            SmartUpdatesRestService.updateSmartUpdateTemplate($scope.currentQuery).success(function () {
                $scope.currentQuery.isPristine = true;
                $scope.currentQuery.isNewTemplate = false;
                toastr.success(`${$scope.currentQuery.name} template updated`);
                $scope.goBack();
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, `Could not save ${$scope.currentQuery.name} template`);
            });
        }
    };


    // Add known prefixes
    function addKnownPrefixes() {
        SparqlRestService.addKnownPrefixes(JSON.stringify(window.editor.getValue()))
            .success(function (data) {
                if (angular.isDefined(window.editor) && angular.isDefined(data) && data !== window.editor.getValue()) {
                    window.editor.setValue(data);
                }
            })
            .error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Error! Could not add known prefixes');
                return true;
            });
    }

    $('textarea').on('paste', function () {
        $timeout(function () {
            addKnownPrefixes();
        }, 0);
    });

    $scope.setDirty = function () {
        $scope.currentQuery.isPristine = false;
    };

    function hasValidQuery() {
        return window.editor && window.editor.getQueryMode() === 'update';
    }

    function validateQuery() {
        if (!hasValidQuery()) {
            toastr.error('The template query must be an UPDATE query', 'Invalid query');
            return false;
        }

        return true;
    }
}
