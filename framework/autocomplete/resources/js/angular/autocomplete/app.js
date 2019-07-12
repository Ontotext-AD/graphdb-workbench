define(['angular/core/services',
        'angular/core/directives'],

	function() {

		var autocompleteApp = angular.module(
				'graphdb.framework.autocomplete',
				['ngRoute', 'toastr'])

		autocompleteApp.config(['$routeProvider', '$menuItemsProvider', function($routeProvider, $menuItemsProvider) {
	        $routeProvider.when('/autocomplete', {
		  		templateUrl : 'pages/autocomplete.html',
		  		controller : 'AutocompleteCtrl',
				title: 'Autocomplete index',
				helpInfo: 'The Autocomplete index is used for automatic completion of URIs in the SPARQL editor and the View resource page. Use this view to enable or disable the index and check its status.'
		  	});

		    $menuItemsProvider.addItem({label : 'Setup', href : '#', order : 5, role : 'IS_AUTHENTICATED_FULLY', icon: "icon-settings"});
			$menuItemsProvider.addItem({label : 'Autocomplete', href: 'autocomplete', order : 40, parent: 'Setup', role: "IS_AUTHENTICATED_FULLY"});
	    }]);

        autocompleteApp.controller('AutocompleteCtrl', ['$scope', '$http', '$interval', 'toastr', '$repositories', '$modal', '$timeout', function($scope, $http, $interval, toastr, $repositories, $modal, $timeout) {

			var refreshEnabledStatus = function() {
                $http.get('rest/autocomplete/enabled')
                .success(function(data, status, headers, config) {
                    $scope.autocompleteEnabled = data;
                }).error(function(data, status, headers, config) {
                    toastr.error(getError(data));
                });
			};

			var refreshIndexIRIs = function() {
                $http.get('rest/autocomplete/iris')
                .success(function(data, status, headers, config) {
                    $scope.shouldIndexIRIs = data;
                }).error(function(data, status, headers, config) {
                    toastr.error(getError(data));
                });
			};

			var refreshIndexStatus = function() {
                $http.get('rest/autocomplete/status')
                .success(function(data, status, headers, config) {
                    $scope.indexStatus = data;
                }).error(function(data, status, headers, config) {
                    toastr.error(getError(data));
                });
			};

			var refreshLabelConfig = function() {
                $http.get('rest/autocomplete/labels')
                .success(function(data, status, headers, config) {
                    $scope.labelConfig = data;
                }).error(function(data, status, headers, config) {
                    toastr.error(getError(data));
                });
			};

			var addLabelConfig = function(label) {
			    $scope.setLoader(true, 'Updating label config...');

                $http.put('rest/autocomplete/labels', label)
                .success(function(data, status, headers, config) {
                    refreshLabelConfig();
                    refreshIndexStatus();
                }).error(function(data, status, headers, config) {
                    toastr.error(getError(data));
                }).finally(function() {
                    $scope.setLoader(false);
                });
			};

			var removeLabelConfig = function(label) {
			    $scope.setLoader(true, 'Updating label config...');

                $http.delete('rest/autocomplete/labels', {
                    data: label,
                    headers: {
                        "Content-Type": "application/json;charset=utf-8"
                    }
                })
                .success(function(data, status, headers, config) {
                    refreshLabelConfig();
                    refreshIndexStatus();
                }).error(function(data, status, headers, config) {
                    toastr.error(getError(data));
                }).finally(function() {
                    $scope.setLoader(false);
                });
			};

            $scope.setLoader = function (loader, message) {
                $timeout.cancel($scope.loaderTimeout);
                if (loader) {
                    $scope.loaderTimeout = $timeout(function () {
                        $scope.loader = loader;
                        $scope.loaderMessage = message;
                    }, 300);
                } else {
                    $scope.loader = false;
                }
            };

            $scope.getLoaderMessage = function () {
                return $scope.loaderMessage || 'Loading...';
            };

            $scope.toggleAutocomplete = function() {
                var newValue = !$scope.autocompleteEnabled;
                $scope.setLoader(true, newValue ? 'Enabling autocomplete...' : 'Disabling autocomplete...');

                $http.post('rest/autocomplete/enabled?enabled=' + newValue).success(function() {
                    refreshEnabledStatus();
                    refreshIndexStatus();
                }).error(function(data) {
                    toastr.error(getError(data));
                }).finally(function() {
                    $scope.setLoader(false);
                });
            };

            $scope.toggleIndexIRIs = function() {
                $scope.setLoader(true, 'Setting index IRIs...');

                $http.post('rest/autocomplete/iris?enabled=' + !$scope.shouldIndexIRIs).success(function() {
                    refreshIndexIRIs();
                    refreshIndexStatus();
                }).error(function(data) {
                    toastr.error(getError(data));
                }).finally(function() {
                    $scope.setLoader(false);
                });
            };

            $scope.buildIndex = function() {
                $scope.setLoader(true, 'Requesting index build...');

                $http.post('rest/autocomplete/reIndex').success(function(data, status, headers, config) {
                    $scope.indexStatus = 'BUILDING'
                }).error(function(data) {
                    toastr.error(getError(data));
                }).finally(function() {
                    $scope.setLoader(false);
                });
            };

            var pullStatus = function() {
                var timer = $interval(function() {
                    if ($scope.autocompleteEnabled) {
                        refreshIndexStatus();
                    }
                }, 5000);

                $scope.$on("$destroy", function(event) {
                    $interval.cancel(timer);
                });
            };

            $scope.interruptIndexing = function() {
                $scope.setLoader(true, 'Interrupting index...');

                $http.post('rest/autocomplete/interrupt').success(function() {
                    refreshIndexStatus();
                }).error(function(data) {
                    toastr.error(getError(data));
                }).finally(function() {
                    $scope.setLoader(false);
                });
            };

            $scope.getDegradedReason = function() {
                return $repositories.getDegradedReason();
            };

            var checkForPlugin = function() {
                $scope.pluginFound = false;

                if (!$repositories.getActiveRepository()) {
                    return;
                }

                $scope.setLoader(true);

                $http.get('rest/autocomplete/pluginFound')
                .success(function(data) {
                    $scope.pluginFound = (data === true);
                    if ($scope.pluginFound) {
                        refreshEnabledStatus();
                        refreshIndexIRIs();
                        refreshIndexStatus();
                        refreshLabelConfig();
                    } else {
                        $scope.autocompleteEnabled = false;
                        $scope.loading = false;
                    }
                })
                .error(function(data) {
                    toastr.error(getError(data));
                }).finally(function() {
                    $scope.setLoader(false);
                });
            };

            $scope.addLabel = function() {
                $scope.editLabel({labelIri: '', languages: ''}, true);
            };

            $scope.editLabel = function(label, isNew) {
                var modalInstance = $modal.open({
                    templateUrl: 'js/angular/autocomplete/templates/modal/add-label.html',
                    controller: 'AddLabelCtrl',
                    resolve: {
                        data: function () {
                            return {
                                label: label,
                                isNew: isNew
                            }
                        }
                    }
                });

                modalInstance.result.then(function (label) {
                    addLabelConfig(label);
                    console.log(label);
                }, function () {
                });
            };

            $scope.removeLabel = function(label) {
                removeLabelConfig(label);
            };

            if ($repositories.getActiveRepository()) {
                checkForPlugin();
            }

            $scope.$on('repositoryIsSet', function(){
                if (!$repositories.getActiveRepository()) {
                    return;
                }
                checkForPlugin();
            });

            pullStatus();

        }]);

        AddLabelCtrl.$inject = ['$scope', '$modalInstance', '$timeout', 'data'];
        function AddLabelCtrl($scope, $modalInstance, $timeout, data) {
            $scope.label = angular.copy(data.label);
            $scope.isNew = data.isNew;

            $scope.ok = function () {
                if ($scope.form.$valid) {
                    $modalInstance.close($scope.label);
                }
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            $scope.setTemplate = function(iri) {
                $scope.label.labelIri = iri;
                $timeout(function() {
                    $('#wb-autocomplete-languages').focus();
                }, 0);
            };
        }
        autocompleteApp.controller('AddLabelCtrl', AddLabelCtrl);

		return autocompleteApp;

	});
