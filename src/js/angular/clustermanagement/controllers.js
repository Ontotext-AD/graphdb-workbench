import 'angular/core/services';
import 'angular/rest/cluster.rest.service';

const modules = [
    'ui.bootstrap',
    'graphdb.framework.core.services.repositories',
    'graphdb.framework.rest.repositories.service',
    'graphdb.framework.rest.cluster.service',
    'toastr'
];

angular
    .module('graphdb.framework.clustermanagement.controllers', modules)
    .controller('ClusterManagementCtrl', ClusterManagementCtrl)
    .controller('CloneRepositoryCtrl', CloneRepositoryCtrl);

function getLocation(node) {
    if (node.local) {
        return 'local';
    }
    return node.location.split('/repositories/')[0];
}

ClusterManagementCtrl.$inject = ['$scope', '$http', '$q', 'toastr', '$repositories', '$uibModal', '$sce',
    '$window', '$interval', 'ModalService', '$timeout', 'ClusterRestService', 'RepositoriesRestService'];

function ClusterManagementCtrl($scope, $http, $q, toastr, $repositories, $uibModal, $sce,
                               $window, $interval, ModalService, $timeout, ClusterRestService,
                               RepositoriesRestService) {
    // TODO: Similar function is declared multiple times in different components. Find out how to avoid it!
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

    $scope.getMaster = function (masterRepositoryID) {
        ClusterRestService.getMaster(masterRepositoryID)
            .success(function (data) {
                $scope.masterInformation = data;
            });
    };

    $scope.setMasterAttribute = function (master, attribute, value) {
        const attrData = {};
        attrData[attribute] = value;

        $scope.setLoader(true, 'Setting attribute...');
        ClusterRestService.configureMaster($scope.getLabel(master.location), getLocation(master), attrData)
            .success(function () {
                $scope.attributeChange = false;
                toastr.success("Set " + attribute + " to " + value + ".", "");
                $scope.refreshMastersIcons();
                return true;
            }).error(function (data) {
                $scope.attributeChange = false;
                toastr.error(getError(data), "Error setting attribute " + attribute);
                return true;
            }).finally(function () {
                $scope.setLoader(false);
            });
    };

    $scope.hasInfo = function (node) {
        if (node == null) {
            return true;
        }
        if ($scope.isWorker(node)) {
            return 'fingerprint' in node;
        } else {
            return 'failedReads' in node;
        }
    };

    $scope.locations = function () {
        return $repositories.getLocations();
    };

    $scope.showCloneModal = function () {
        $scope.clone.locations = $scope.locations();
        $scope.clone.repositoryID = $scope.selectedNode.name;
        const modalInstance = $uibModal.open({
            templateUrl: 'js/angular/clustermanagement/templates/modal/clone-modal.html',
            controller: 'CloneRepositoryCtrl',
            resolve: {
                clone: function () {
                    return $scope.clone;
                }
            }
        });
        modalInstance.result.then(function (clone) {
            $scope.clone = clone;
            $scope.cloneCurrentRepository();
        }, function () {
            $scope.selectedNode = null;
        });
    };

    $scope.cloneCurrentRepository = function () {
        const currentNodeLocation = getLocation($scope.selectedNode);

        $scope.setLoader(true, 'Cloning worker...');

        ClusterRestService.cloneRepository({
            currentNodeLocation: currentNodeLocation,
            selectedNodeName: $scope.selectedNode.name,
            repositoryID: $scope.clone.repositoryID,
            locationUri: $scope.clone.location.uri,
            repositoryTitle: $scope.clone.repositoryTitle
        }).success(function () {
            toastr.success('Cloned node into ' + $scope.clone.location);
            $scope.getNodes();
        }).error(function (data) {
            toastr.error(getError(data), "Error cloning node");
        }).finally(function () {
            $scope.setLoader(false);
        });
    };

    $scope.getLabel = function (url) {
        if (url.indexOf("http") !== 0) {
            return name;
        }
        return url.substring(url.indexOf('/repositories') + 14);
    };

    /**
     * Creates a link between two nodes. That this function abstracts away
     * if firstNode is a master or it's secondNode
     */
    $scope.connectNodes = function (source, target, onSuccess) {
        let master;
        let worker;

        if ('disabledReason' in source) {
            toastr.error(source.disabledReason, "Error");
            return;
        }

        if ('disabledReason' in target) {
            toastr.error(target.disabledReason, "Error");
            return;
        }

        if (source.repositoryType === 'master' && target.repositoryType === 'master') {
            if (source.location in target.peers && target.location in source.peers) {
                toastr.error("Masters already connected", "Error");
            } else if (source.location in target.peers) {
                $scope.connectMasters(source, target, false, onSuccess);
            } else if (target.location in source.peers) {
                $scope.connectMasters(target, source, false, onSuccess);
            } else {
                $scope.connectMasters(source, target, true, onSuccess);
            }
            return;
        } else if (source.repositoryType === 'master') {
            master = source;
            worker = target;
        } else if (target.repositoryType === 'master') {
            master = target;
            worker = source;
        } else {
            toastr.error("You cannot connect two workers", "Error");
            return;
        }

        if (worker.location in master.workers) {
            toastr.error("Worker already connected to that master", "Error");
            return;
        }

        $scope.setLoader(true, 'Connecting nodes...');

        ClusterRestService.connectWorker($scope.getLabel(master.location), getLocation(master), worker.location)
            .success(function () {
                const timestamp = Date.now();

                worker.cluster = worker.cluster || [];
                worker.cluster.push(master.cluster);

                $scope.addOrUpdateLink(master, worker, '', timestamp);

                master.workers[worker.location] = 1;

                onSuccess();

                toastr.success("Connected worker to master.", "");
            }).error(function (data) {
                toastr.error(getError(data), "Error connecting worker");
            }).finally(function () {
                $scope.setLoader(false);
            });
    };

    $scope.disconnectLinkConfirm = function (d, onSuccess) {
        ModalService.openSimpleModal({
            title: 'Confirm disconnect',
            message: 'Are you sure you want to disconnect the nodes?',
            warning: true
        }).result
            .then(function () {
                $scope.disconnectLink(d, onSuccess);
            });
    };

    function disconnectWorker(d, master, worker, onSuccess) {
        ClusterRestService.disconnectWorker($scope.getLabel(master.location), $.param({
            workerURL: worker.location,
            masterLocation: getLocation(master)
        })).success(function () {
            $scope.deleteLink(d);

            worker.cluster = worker.cluster.filter(function (x) {
                return x !== master.cluster;
            });

            delete master.workers[worker.location];

            onSuccess();

            toastr.success("Disconnected worker from master.", "");
        }).error(function (data) {
            toastr.error(getError(data), "Error disconnecting worker");
        }).finally(function () {
            $scope.setLoader(false);
        });
    }

    function disconnectNodes(d, master, worker, onSuccess) {
        ClusterRestService.disconnectNodes($scope.getLabel(master.location), $.param({
            masterLocation: getLocation(master),
            masterNodeID: master.nodeID,
            peerLocation: getLocation(worker),
            peerRepositoryID: $scope.getLabel(worker.location),
            peerNodeID: worker.nodeID
        })).success(function (data) {
            $scope.deleteLink(d, true);

            delete worker.peers[master.location];
            delete master.peers[worker.location];

            onSuccess();

            toastr.success(data, "");
        }).error(function (data) {
            toastr.error(getError(data), "Error disconnecting masters");
        }).finally(function () {
            $scope.setLoader(false);
        });
    }

    $scope.disconnectLink = function (d, onSuccess, overrideDisabled) {
        let master = {};
        let worker = {};
        if (d.source.repositoryType === 'master') {
            master = d.source;
            worker = d.target;
        } else if (d.target.repositoryType === 'master') {
            master = d.target;
            worker = d.source;
        }

        if (!overrideDisabled && ('disabledReason' in master || worker.repositoryType === 'master' && 'disabledReason' in worker)) {
            ModalService.openSimpleModal({
                title: 'Confirm disconnect',
                message: 'One of the masters is currently unreachable and will be disconnected only at the reachable master.'
                + '<br><br>Proceed only if you know what you are doing.',
                warning: true
            }).result
                .then(function () {
                    $scope.disconnectLink(d, onSuccess, true);
                });

            return;
        }

        $scope.setLoader(true, 'Disconnecting nodes...');

        if (worker.repositoryType === 'worker') {
            disconnectWorker(d, master, worker, onSuccess);
        } else {
            // Both are masters, despite the var name worker
            disconnectNodes(d, master, worker, onSuccess);
        }
    };

    // Called directives so we include scope apply here
    $scope.selectNode = function (node) {
        if ($scope.selectedNode !== node) {
            $scope.selectedNode = node;
        } else {
            $scope.selectedNode = null;
        }
        $scope.$apply();
    };

    $scope.isWorker = function (node) {
        return node !== undefined && node !== null && node.repositoryType === 'worker';
    };

    $scope.connectMasters = function (first, second, bidirectional, onSuccess) {
        const firstConfigs = first.location.split('/repositories/');
        const secondConfigs = second.location.split('/repositories/');

        $scope.setLoader(true, 'Connecting nodes...');

        ClusterRestService.connectNodes(firstConfigs[1], {
            masterLocation: first.local ? 'local' : firstConfigs[0],
            masterNodeID: first.nodeID,
            peerLocation: second.local ? 'local' : secondConfigs[0],
            peerRepositoryID: secondConfigs[1],
            peerNodeID: second.nodeID,
            bidirectional: bidirectional
        }).success(function (data) {
            // FIXME?? is there a proper connection between the masters. We don't know so we use 'ON'
            const timestamp = Date.now();

            $scope.addOrUpdateLink(first, second, 'ON', timestamp);
            first.peers[second.location] = 1;

            if (bidirectional) {
                second.peers[first.location] = 1;
                $scope.addOrUpdateLink(second, first, 'ON', timestamp);
            }

            onSuccess();

            toastr.success(data, "");
        }).error(function (data) {
            toastr.error(getError(data), "Error connecting masters");
        }).finally(function () {
            $scope.setLoader(false);
        });
    };

    $scope.addOrUpdateLink = function (source, target, status, timestamp) {
        const key = source.location + '|' + target.location;
        let link = $scope.linksHash[key];
        const reverseKey = target.location + '|' + source.location;
        const reverseLink = $scope.linksHash[reverseKey];
        if (!link) {
            // adding a new link
            link = {};
            $scope.linksHash[key] = link;
            $scope.links.push(link);
            link['source'] = source;
            link['target'] = target;
            $scope.needsToRestart = true;
        } else {
            // updating, check if status changed
            // no-op at the moment
        }
        link['status'] = status;
        link['timestamp'] = timestamp;

        link['reversePeerMissing'] = source.repositoryType === 'master' && target.repositoryType === 'master' && !reverseLink;
        if (reverseLink && reverseLink['reversePeerMissing']) {
            reverseLink['reversePeerMissing'] = false;
        }
        $scope.linksHash[key] = link;

        if ($scope.updateWarnings) { // function isn't defined before render() is called
            $scope.updateWarnings();
        }

        return link;
    };

    $scope.deleteLink = function (link, deleteReverse) {
        $scope.links.splice($scope.links.indexOf(link), 1);
        const key = link.source.location + '|' + link.target.location;
        delete $scope.linksHash[key];
        if (link.source.disabledReason || link.target.disabledReason) {
            // removing a link to a funky node triggers a refresh to get rid of that node
            console.log("link to funky node removed, refresh");
            $scope.needsToRefresh = true;
        }

        if (deleteReverse) {
            const reverseKey = link.target.location + '|' + link.source.location;
            const reverseLink = $scope.linksHash[reverseKey];
            if (reverseLink) {
                $scope.deleteLink(reverseLink, false);
            }
        }
    };

    $scope.updateMasterNode = function (node, timestamp, isUpdate, isRandomLink) {
        return ClusterRestService.getMaster(node.name, {
            params: {
                masterLocation: getLocation(node)
            }
        })
            .error(function (data) {
                const newDisabledReason = "The location is unreachable.";

                if (node.disabledReason !== newDisabledReason) {
                    // show toast only once per disabled reason
                    toastr.error(getError(data), "Error accessing master " + node.name);

                    node.disabledReason = newDisabledReason;

                    // Disabled, we don't know these so reset them to sane empty defaults
                    node.peers = {};
                    node.workers = {};
                    node.hasWorkers = false;
                }

                node.timestamp = timestamp;

                return true;
            })
            .success(function (masterData) {
                node.averageReadTime = masterData.averageReadTime;
                node.completedReads = masterData.completedReads;
                node.completedWrites = masterData.completedWrites;
                node.failedReads = masterData.failedReads;
                node.failedWrites = masterData.failedWrites;
                node.pendingWrites = masterData.pendingWrites;
                node.runningReads = masterData.runningReads;
                node.runningWrites = masterData.runningWrites;
                node.readonly = masterData.readonly;
                node.mode = masterData.mode;
                node.nodeID = masterData.nodeID;
                node.peers = {};
                node.workers = {};
                node.timestamp = timestamp;
                node.hasWorkers = masterData.workers.length > 0;

                masterData.peers.forEach(function (peer) {
                    node.peers[peer.location] = 1;
                    if (!(peer.location in $scope.urlToNode)) {
                        // either someone added a repository behind our back or it's a repository we don't have in our locations
                        if (isUpdate) {
                            console.log('master disappeared, refreshing');
                            $scope.needsToRefresh = true;
                        } else {
                            // TODO: Test this properly. Nodes shouldn't get events, should look disabled properly
                            $scope.urlToNode[peer.location] = {
                                name: $scope.getLabel(peer.location),
                                disabledReason: "You are not connected to this master's location or the master was deleted",
                                location: peer.location,
                                nodeID: peer.nodeID,
                                repositoryType: 'master',
                                artificiallyAdded: true
                            };
                        }
                    }

                    // FIXME?? is there a proper connection between the masters
                    $scope.addOrUpdateLink(node, $scope.urlToNode[peer.location], 'ON', timestamp);
                });

                masterData.workers.forEach(function (worker) {
                    node.workers[worker.location] = 1;
                    let workerNode = {};
                    if (worker.location in $scope.urlToNode) {
                        workerNode = $scope.urlToNode[worker.location];
                    } else {
                        // either someone added a repository behind our back or it's a repository we don't have in our locations
                        if (isUpdate) {
                            console.log('worker disappeared, refreshing');
                            $scope.needsToRefresh = true;
                            return;
                        } else {
                            workerNode = $scope.urlToNode[worker.location] = {
                                name: $scope.getLabel(worker.location),
                                location: worker.location,
                                repositoryType: 'worker',
                                artificiallyAdded: true
                            };
                        }
                    }

                    workerNode.fingerprint = worker.fingerprint;
                    workerNode.averageTaskTime = worker.averageTaskTime;
                    workerNode.failedTasks = worker.failedTasks;
                    workerNode.completedTasks = worker.completedTasks;
                    workerNode.runningTasks = worker.runningTasks;
                    workerNode.timestamp = timestamp;

                    if (workerNode.artificiallyAdded) {
                        workerNode.disabledReason = "You are not connected to this worker's location.";
                        if (worker.lastError) {
                            workerNode.disabledReason += '<br>' + worker.lastError;
                        }
                    } else if (worker.lastError) {
                        workerNode.disabledReason = worker.lastError;
                    } else {
                        delete workerNode.disabledReason;
                    }

                    if (workerNode.disabledReason) {
                        workerNode.disabledReason = $sce.trustAsHtml(workerNode.disabledReason);
                    }

                    workerNode.cluster = workerNode.cluster || [];
                    if (workerNode.cluster.indexOf(node.cluster) === -1) {
                        workerNode.cluster.push(node.cluster);
                    }

                    let status = worker.status;

                    // debug stuff
                    if (isRandomLink) {
                        status = ['UNINITIALIZED', 'ON', 'OFF', 'REPLICATION_SERVER', 'REPLICATION_CLIENT',
                            'OUT_OF_SYNC', 'OUT_OF_SYNC_FORCED', 'WAITING_WRITE', 'WRITING'][Math.floor(Math.random() * 9)]; // NOSONAR
                    }
                    // end of debug stuff

                    $scope.addOrUpdateLink(node, $scope.urlToNode[worker.location], status, timestamp);
                });
            }).catch(function () {
                return true;
            });
    };

    $scope.getNodes = function () {
        // Reset all of these, just in case
        $scope.nodes = [];
        $scope.links = [];
        $scope.linksHash = {};
        $scope.clone = {};
        $scope.selectedNode = null;
        $scope.clusters = [];

        $scope.setLoader(true);

        return RepositoriesRestService.getCluster()
            .success(function (data) {
                $scope.hasNodes = data.length > 0;
                $scope.links = [];
                $scope.linksHash = {};
                $scope.clusters = [];

                const timestamp = Date.now();

                $scope.urlToNode = data.reduce(function (result, node) {
                    if (node.type === "master" || node.type === "worker") {
                        result[node.uri] = {
                            name: $scope.getLabel(node.uri),
                            local: node.local,
                            location: node.uri,
                            repositoryType: node.type,
                            timestamp: timestamp
                        };
                    }
                    return result;
                }, {});

                let clusterIdx = 0;

                const mastersData = Object.keys($scope.urlToNode).filter(function (key) {
                    return $scope.urlToNode[key].repositoryType === 'master';
                }).sort(function (k1, k2) {
                    if (k1 < k2) {
                        return -1;
                    } else if (k1 > k2) {
                        return 1;
                    }

                    return 0;
                }).map(function (key) {
                    const node = $scope.urlToNode[key];

                    node.cluster = clusterIdx;
                    $scope.clusters.push(node);
                    clusterIdx++;
                    return $scope.updateMasterNode(node, timestamp);
                });

                return $q.all(mastersData).finally(function () {
                    $scope.nodes = _.sortBy(
                        Object.keys($scope.urlToNode).map(function (key) {
                            return $scope.urlToNode[key];
                        }),
                        ['name']
                    );

                    $scope.render();

                    $scope.setLoader(false);
                });

            })
            .error(function (data) {
                $scope.hasNodes = false;
                toastr.error(getError(data), "Error getting nodes");
                $scope.setLoader(false);
            })
            .finally(function () {
                $scope.needsToRefresh = false;
            });
    };

    $scope.trackAddedOrRemovedNodes = function (timestamp) {
        return RepositoriesRestService.getCluster()
            .success(function (data) {
                const uri2tempNode = data.reduce(function (result, node) {
                    if (node.type === "master" || node.type === "worker") {
                        result[node.uri] = {
                            location: node.uri,
                            repositoryType: node.type
                        };
                    }
                    return result;
                }, {});

                for (let i = 0; i < $scope.nodes.length; i++) {
                    const node = $scope.nodes[i];
                    if (node.location in uri2tempNode) {
                        if (!node.artificiallyAdded) {
                            // old node exists in new list, update timestamp and delete from new list
                            node.timestamp = timestamp;
                            delete uri2tempNode[node.location];
                        }
                    } else if (!node.artificiallyAdded) {
                        // old node disappeared and it's not disabled, force refresh
                        console.log("old node disappeared, refresh");
                        $scope.needsToRefresh = true;
                        return true;
                    }
                }

                if (Object.keys(uri2tempNode).length > 0) {
                    // there are still nodes in the new list, which means someone added a repo, force refresh
                    console.log("new nodes appeared, refresh");
                    $scope.needsToRefresh = true;
                }
            })
            .error(function (data) {
                toastr.error(getError(data), "Error getting nodes");
            });
    };

    $scope.updateClusterIfNeeded = function (checkNodes) {
        // raise flag to prevent calling this more than once before one invocation completes
        $scope.updating = true;

        const timestamp = Date.now();

        const processUpdate = function () {
            if (!$scope.needsToRefresh) {
                // check for nodes disconnected behind our back, or nodes entirely removed
                for (let i = 0; i < $scope.links.length; i++) {
                    const link = $scope.links[i];
                    if (link['timestamp'] !== timestamp) {
                        console.log('nodes disconnected, removing link');
                        // In reality if a user disconnects the bidirectional peer-to-peer link
                        // between masters in only one direction we'd still have a single link
                        // in the cluster manager. This is tricky and we can't do much about it for now.
                        $scope.deleteLink(link, false);
                    }
                }
            }

            if ($scope.needsToRefresh) {
                // major changes, we need to refresh
                console.log('refresh requested');
                $scope.getNodes();
            } else if ($scope.needsToRestart) {
                // only statuses changed, just restart the graph
                console.log('only links changed, restarting');
                $scope.restart();
            } else {
                // updates the statuses (colours of links)
                $scope.updateStatuses();
                // update colours for multimaster workers
                $scope.updateColors();
                // update warnings for missing bidi links
                $scope.updateWarnings();
                // updating done (when we refresh, restart() will do that instead)
                $scope.updating = false;
            }
        };

        if (checkNodes) {
            $scope.trackAddedOrRemovedNodes(timestamp).then(function () {
                if (!$scope.needsToRefresh) {
                    const promises = [];
                    for (let i = 0; i < $scope.nodes.length; i++) {
                        const node = $scope.nodes[i];
                        if (node.repositoryType === 'master') {
                            promises.push($scope.updateMasterNode(node, timestamp, true));
                        }
                    }
                    $q.all(promises).finally(processUpdate);
                } else {
                    processUpdate();
                }
            });
        } else {
            const promises = [];
            for (let i = 0; i < $scope.nodes.length; i++) {
                const node = $scope.nodes[i];
                if (node.repositoryType === 'master') {
                    promises.push($scope.updateMasterNode(node, timestamp, true));
                }
            }
            $q.all(promises).finally(processUpdate);
        }
    };

    $scope.getNodes();

    $scope.setMode = function (mode) {
        $scope.attributeChange = true;
        $scope.setMasterAttribute($scope.selectedNode, 'Mode', mode);
    };

    $scope.setReadonly = function (readonly) {
        $scope.attributeChange = true;
        $scope.selectedNode.readonly = readonly;
        $scope.setMasterAttribute($scope.selectedNode, 'ReadOnly', readonly);
    };

    let timerCounter = 0;
    const timer = $interval(function () {
        // check for update only if not in the middle of set attribute operation
        if (!$scope.attributeChange && !$scope.updating) {
            timerCounter++;
            // every third iteration also checks for added/removed nodes
            $scope.updateClusterIfNeeded(timerCounter % 3 === 0);
        }
    }, 2000);

    $scope.$on("$destroy", function () {
        $interval.cancel(timer);
    });

    $scope.attributeChange = false;
    $scope.updating = false;

    // track window resizing
    const w = angular.element($window);
    const resize = function () {
        $scope.resize();
    };
    w.bind('resize', resize);
    $scope.$on('$destroy', function () {
        w.unbind('resize', resize);
    });

    // track collapsing the nav bar
    $scope.$on('onToggleNavWidth', function () {
        $scope.resize();
    });
}

CloneRepositoryCtrl.$inject = ['$scope', '$uibModalInstance', 'clone'];

function CloneRepositoryCtrl($scope, $uibModalInstance, clone) {

    $scope.clone = angular.copy(clone);
    $scope.ok = function () {
        const patt = new RegExp('^[a-zA-Z0-9-_]+$');
        $scope.isInvalidRepoName = !patt.test($scope.clone.repositoryID);
        if (!$scope.isInvalidRepoName) {
            $uibModalInstance.close($scope.clone);
        }
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}
