angular
    .module('graphdb.framework.core.directives.queryeditor.sparqltab', [
        'graphdb.framework.core'
    ])
    .directive('sparqlTab', sparqlTabDirective);

sparqlTabDirective.$inject = ['$rootScope', 'localStorageService', 'ModalService'];

function sparqlTabDirective($rootScope, localStorageService, ModalService) {
    const SparqlTabCtrl = ['$scope', '$element', '$rootScope', 'ModalService', 'toastr', function ($scope, $element, $rootScope, ModalService, toastr) {
        $scope.state = {};

        function getQueryID(element) {
            return $(element).attr('data-id');
        }

        function findTabIndexByID(id) {
            for (let i = 0; i < $scope.tabs.length; i++) {
                const tab = $scope.tabs[i];
                if (tab.id === id) {
                    return i;
                }
            }
        }

        $($element).on('shown.bs.tab', function (e) {
            $rootScope.$broadcast('tabAction', e);
        });

        $scope.deleteTab = deleteTab;
        $scope.editCurrentTab = editCurrentTab;
        $scope.selectThisTab = selectThisTab;

        function selectThisTab(e) {
            e.preventDefault();
            e.stopPropagation();
            if ($scope.isTabChangeOk(false)) {
                $($element).tab('show');
            }
        }

        function selectTab(id) {
            $('a[data-id = "' + id + '"]').tab('show');
        }

        function deleteTab(e) {
            e.preventDefault();
            e.stopPropagation();

            if ($scope.tabs.length < 2) {
                toastr.warning('Last tab must remain open.');
                return;
            }

            if (e.shiftKey) {
                $scope.state.selectedTabId = getQueryID($element);

                ModalService.openSimpleModal({
                    title: 'Confirm',
                    message: 'Are you sure you want to delete all query tabs except selected tab?',
                    warning: true
                }).result.then(function () {
                    deleteAllTabsExceptSelected($scope.state.selectedTabId);
                });
            } else {
                $scope.state.idForDelete = getQueryID($element);

                ModalService.openSimpleModal({
                    title: 'Confirm',
                    message: 'Are you sure you want to close this query tab?',
                    warning: true
                }).result.then(function () {
                    deleteTabByID($scope.state.idForDelete);
                });
            }
            angular.element(document).find('.CodeMirror textarea:first-child').focus();
        }

        function editCurrentTab() {
            if (getQueryID($element) !== $scope.currentQuery.id) {
                return;
            }
            $scope.editCurrentlySelectedOnly.$show();
            //fix for buttons for edit
            const $editableButtons = $(".editable-buttons");
            $editableButtons.children(".btn.btn-primary").addClass('btn-sm');
            $editableButtons.children(".btn.btn-default").addClass('btn-sm');
            $('.editable-controls .editable-input').addClass('form-control-sm').on('change', function ($el) {
                $scope.currentQuery.name = $el.currentTarget.$$currentValue;
            });
            //$('.editable-buttons').css('margin-top', '5px');
            //$('.editable-input.editable-has-buttons').css('width', '50%');
            $('.editable-buttons .glyphicon.glyphicon-ok')
                .removeClass('glyphicon glyphicon-ok')
                .addClass('fa fa-check');
            $('.editable-buttons .glyphicon.glyphicon-remove')
                .removeClass('glyphicon glyphicon-remove')
                .addClass('fa fa-close');
        }

        function deleteTabByID(id) {
            if (angular.isUndefined(id)) {
                throw 'Delete by id was called with undefined id';
            }
            const idx = findTabIndexByID(id);
            $scope.tabs.splice(idx, 1);

            if (id === $scope.currentQuery.id) {
                if ($scope.tabs.length > 0) {
                    if (idx > 0) {
                        // select previous tab if we deleted any but the first tab
                        selectTab($scope.tabs[idx - 1].id);
                    } else {
                        // select first tab if we deleted the first tab
                        selectTab($scope.tabs[0].id);
                    }
                }
            }
        }

        function deleteAllTabsExceptSelected(id) {
            $scope.tabs = $scope.tabs.filter(function (obj) {
                if (obj.id === id) {
                    return obj;
                }
            });
            selectTab($scope.tabs[0].id);
            localStorageService.set('tabs-state', $scope.tabs);
            $rootScope.$broadcast('deleteAllexeptSelected', $scope.tabs);
        }
    }];

    return {
        restrict: 'AE',
        // for some reason when you extract this template in a file and use templateUrl it selects all tabs when editing the tab name, not only the currently selected one
        template: '<a class="nav-link" role="tab" data-toggle="tab" blur="submit" editable-text="tab.name" e-form="editCurrentlySelectedOnly" ng-click="selectThisTab($event)" ng-dblclick="editCurrentTab()" ><span ng-class="{\'text-muted\': !tab.name}">{{ tab.name || \'Unnamed\'}}</span><button type="button" ng-click="deleteTab($event)" class="btn btn-link btn-sm secondary delete-sparql-tab-btn" title="Delete tab"><i class="icon-close"></i></button></a>',
        replace: true,
        controller: SparqlTabCtrl
    };
}
