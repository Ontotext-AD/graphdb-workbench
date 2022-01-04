import 'angular/core/services';
import 'angular/core/services/repositories.service';
import 'angular/rest/monitoring.rest.service';
import 'angular/utils/notifications';
import 'angular/utils/uri-utils';

const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.monitoring.service',
    'toastr'
];

angular.module('graphdb.framework.sparql-template.controllers', modules, [
    'graphdb.framework.utils.notifications'
])
    .controller('SparqlTemplatesCtrl', SparqlTemplatesCtrl)
    .controller('SparqlTemplateCreateCtrl', SparqlTemplateCreateCtrl);

SparqlTemplatesCtrl.$inject = ['$scope', '$repositories', 'SparqlTemplatesRestService', 'toastr', 'ModalService', '$licenseService'];

function SparqlTemplatesCtrl($scope, $repositories, SparqlTemplatesRestService, toastr, ModalService, $licenseService) {

    $scope.pluginName = 'sparql-template';

    $scope.setPluginIsActive = function (isPluginActive) {
        $scope.pluginIsActive = isPluginActive;
    }

    $scope.getSparqlTemplates = function () {
        // Only do this if there is an active repo that isn't an Ontop repo.
        // Ontop repos doesn't support update operations.
        if ($licenseService.isLicenseValid() &&
            $repositories.getActiveRepository()
                && !$repositories.isActiveRepoOntopType()
                    && !$repositories.isActiveRepoFedXType()) {
            SparqlTemplatesRestService.getSparqlTemplates().success(function (data) {
                $scope.sparqlTemplateIds = data;
            }).error(function (data) {
                const msg = getError(data);
                toastr.error(msg, 'Could not get SPARQL templates');
            });
        } else {
            $scope.sparqlTemplateIds = [];
        }
    };

    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function () {
        $scope.getSparqlTemplates();
    });

    $scope.deleteTemplate = function (templateID) {
        ModalService.openSimpleModal({
            title: 'Warning',
            message: 'Are you sure you want to delete the SPARQL template ' + '\'' + templateID + '\'?',
            warning: true
        }).result
            .then(function () {
                SparqlTemplatesRestService.deleteSparqlTemplate(templateID)
                    .success(function () {
                        toastr.success(templateID, 'Deleted successfully SPARQL template');
                        $scope.getSparqlTemplates();
                    }).error(function (e) {
                    toastr.error(getError(e), `Could not delete ${templateID} template`);
                });
            });
    };
}

SparqlTemplateCreateCtrl.$inject = ['$scope', '$location', 'toastr', '$repositories', '$window', '$timeout', 'SparqlTemplatesRestService', 'RDF4JRepositoriesRestService', 'SparqlRestService', 'UriUtils', 'ModalService'];

function SparqlTemplateCreateCtrl($scope, $location, toastr, $repositories, $window, $timeout, SparqlTemplatesRestService, RDF4JRepositoriesRestService, SparqlRestService, UriUtils, ModalService) {

    const hash = $location.hash() || '';
    $scope.templateID = ($location.search().templateID || '') + (hash ? (`#${hash}`) : '');
    $scope.title = ($scope.templateID ? 'Edit' : 'Create') + ' SPARQL Template';
    $scope.getNamespaces = getNamespaces;
    $scope.setLoader = setLoader;
    $scope.addKnownPrefixes = addKnownPrefixes;
    $scope.noPadding = {paddingRight: 0, paddingLeft: 0};
    $scope.currentTabConfig = {};
    // This property is obligatory in order to show YASQUE and YASR properly
    $scope.orientationViewMode = true;
    $scope.currentQuery = {};
    let templateExist = false;


    $scope.$watch(function () {
        return $repositories.getActiveRepository();
    }, function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $location.path('/sparql-templates');
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
        templateID: '',
        query: 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n' +
            'PREFIX ex: <http://example.com#>\n' +
            'DELETE {\n' +
            '  ?subject ex:myPredicate ?oldValue .\n' +
            '} INSERT {\n' +
            '  ?subject ex:myPredicate ?newValue .\n' +
            '} WHERE {\n' +
            '  ?id rdf:type ex:MyType .\n' +
            '  ?subject ex:isRelatedTo ?id .\n' +
            '}\n',
        inference: true,
        sameAs: true,
        isNewTemplate: true,
        isPristine: true
    };

    $scope.saveTab = function () {
        // Should have this empty function in this view
    };

    // Called when user clicks on a sample query
    $scope.setQuery = function (query) {
        // Hack for YASQE bug
        window.editor.setValue(query ? query : ' ');
    };

    if ($scope.templateID) {
        getSparqlTemplate($scope.templateID);
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

    function getSparqlTemplate(templateID) {
        SparqlTemplatesRestService.getSparqlTemplate(templateID).success(function (templateContent) {
            defaultTabConfig.query = templateContent;
            defaultTabConfig.templateID = templateID;

            defaultTabConfig.isNewTemplate = !templateID;

            setQueryFromTabConfig();
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, `Could not get ${$scope.currentQuery.templateID} template`);
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

        if (!$scope.currentQuery.templateID) {
            toastr.error('SPARQL template IRI is required');
            return;
        } else {
            validateTemplateID();
            if ($scope.isInvalidTemplateId) {
                return;
            }
        }

        if ($scope.currentQuery.isNewTemplate) {
            checkIfTemplateExists()
                .then(() => {
                    if (templateExist) {
                        const modalMsg = `<div>SPARQL Template <strong>${$scope.currentQuery.templateID}</strong> already exists.</div><br>
                                        <div><span class="icon-2x icon-warning" style="color: #d54a33"/> Do you want to override the template query?</div>`;
                        ModalService.openSimpleModal({
                            title: 'Confirm save',
                            message: modalMsg,
                            warning: true
                        }).result
                            .then(function () {
                                saveNewTemplate();
                            });
                    } else {
                        saveNewTemplate();
                    }
                });
        } else {
            if (!$scope.currentQuery.isPristine) {
                SparqlTemplatesRestService.updateSparqlTemplate($scope.currentQuery).success(function () {
                    $scope.currentQuery.isPristine = true;
                    $scope.currentQuery.isNewTemplate = false;
                    toastr.success($scope.currentQuery.templateID, 'Updated SPARQL template');
                    $scope.goBack();
                }).error(function (data) {
                    const msg = getError(data);
                    toastr.error(msg, `Could not save ${$scope.currentQuery.templateID} template`);
                });
            } else {
                // No changes to template query, go back to
                $scope.goBack();
            }
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

    function validateTemplateID() {
        $scope.isInvalidTemplateId = !UriUtils.isValidIri($scope.currentQuery.templateID);
    }

    function saveNewTemplate() {
        SparqlTemplatesRestService.createSparqlTemplate($scope.currentQuery).success(function () {
            $scope.currentQuery.isPristine = true;
            $scope.currentQuery.isNewTemplate = false;
            toastr.success($scope.currentQuery.templateID, 'Saved SPARQL template');
            $scope.goBack();
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, `Could not save ${$scope.currentQuery.templateID} template`);
        });
    }

    function checkIfTemplateExists() {
        return SparqlTemplatesRestService
            .getSparqlTemplates()
                .success(function (data) {
                    templateExist = data.find((templateId) => templateId === $scope.currentQuery.templateID);
        }).error(function (data) {
            const msg = getError(data);
            toastr.error(msg, 'Could not get SPARQL templates');
        });
    }
}
