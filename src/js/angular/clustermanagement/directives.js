import 'angular/utils/local-storage-adapter';
import * as CDS from "./cluster-drawing.service";

const navigationBarWidthFull = 240;
const navigationBarWidthCollapsed = 70;
let navigationBarWidth = navigationBarWidthFull;

const clusterManagementDirectives = angular.module('graphdb.framework.clustermanagement.directives', [
    'graphdb.framework.utils.localstorageadapter'
]);

clusterManagementDirectives.directive('clusterGraphicalView', ['$window', 'LocalStorageAdapter', 'LSKeys',
    function ($window, LocalStorageAdapter, LSKeys) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                function getWindowWidth() {
                    const collapsed = LocalStorageAdapter.get(LSKeys.MENU_STATE) === 'collapsedMenu';
                    navigationBarWidth = collapsed ? navigationBarWidthCollapsed : navigationBarWidthFull;

                    // 95% avoids horizontal scrollbars and adds some margin
                    return Math.max(Math.floor(($window.innerWidth - navigationBarWidth) * 0.95), 600);
                }

                function getWindowHeight() {
                    // 95% avoids horizontal scrollbars and adds some margin
                    return Math.max((($window.innerHeight - 250) * 0.95), 600);
                }

                let width = getWindowWidth();
                let height = getWindowHeight();
                let clusterZoneRadius = Math.min(width, height) / 2 - 100;
                let hasCluster;

                scope.width = function () {
                    return width;
                };

                scope.height = function () {
                    return height;
                };

                // SVG components
                let svg;
                let clusterZone;

                function initialize() {
                    const hasCluster = !!(scope.clusterModel.nodes && scope.clusterModel.nodes.length);
                    createClusterZone(hasCluster);
                    plot();
                }

                function createClusterZone(hasCluster) {
                    svg = CDS.createClusterSvgElement(element[0])
                        .attr('width', width)
                        .attr('height', height);

                    clusterZone = CDS.createClusterZone(svg, hasCluster);
                }

                // Properties and functions that can be used by parent
                scope.childContext.redraw = plot;
                scope.childContext.resize = function () {
                    // recalculates with new screen width
                    width = getWindowWidth();
                    height = getWindowHeight();
                    svg.attr("width", width);
                    svg.attr("height", height);
                    plot();
                };

                function resizeClusterComponent() {
                    clusterZoneRadius = Math.min(width, height) / 2 - 100;
                    CDS.moveElement(clusterZone, width / 2, height / 2);
                    clusterZone
                        .select('.cluster-zone')
                        .attr('r', clusterZoneRadius);
                }

                function setClusterZoneType(hasCluster) {
                    CDS.setCreateClusterZone(hasCluster, clusterZone);
                    let mouseupCallback;
                    if (!hasCluster) {
                        mouseupCallback = () => {
                            scope.$apply(function () {
                                scope.showCreateClusterDialog();
                            });
                        };
                    }
                    clusterZone
                        .on('mouseup', mouseupCallback);
                }

                function plot() {
                    resizeClusterComponent();
                    if (hasCluster !== scope.clusterModel.hasCluster) {
                        hasCluster = !!scope.clusterModel.hasCluster;
                        setClusterZoneType(hasCluster);
                    }
                }

                initialize();
            }
        };
    }
]);
