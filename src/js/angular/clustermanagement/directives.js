import 'angular/utils/local-storage-adapter';
import * as CDS from "./cluster-drawing.service";

const navigationBarWidthFull = 240;
const navigationBarWidthCollapsed = 70;
let navigationBarWidth = navigationBarWidthFull;

const nodeRadius = 50;

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
                let clusterZoneX = width / 2;
                let clusterZoneY = height / 2;
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
                let nodesGroup;
                let linksGroup;

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

                    linksGroup = svg.append('g').attr('id', 'links-group');
                    nodesGroup = svg.append('g').attr('id', 'nodes-group');
                    plot();
                }

                function createNodes(nodes) {
                    const nodeData = nodesGroup.selectAll('#node-group').data(nodes, (node) => node.address);
                    nodeData
                        .on('click', (d) => {
                            scope.childContext.selectNode(d);

                            // position the tooltip according to the node!
                            const tooltip = d3.select('.nodetooltip');
                            const windowWidth = $(window).width();
                            if (d3.event.pageX < windowWidth / 2) {
                                // left
                                tooltip.style("left", d3.event.pageX + "px");
                                tooltip.style("right", "");
                            } else {
                                // right
                                tooltip.style("left", "");
                                tooltip.style("right", (windowWidth - d3.event.pageX) + "px");
                            }
                            tooltip.style("top", (d3.event.pageY - 28) + "px");
                        });
                    CDS.createNodes(nodeData, nodeRadius);
                    CDS.updateNodes(nodeData);
                    CDS.positionNodesOnClusterZone(nodeData, clusterZoneX, clusterZoneY, clusterZoneRadius);
                }

                function drawLinks(links, nodes) {
                    const linksData = linksGroup.selectAll('.link').data(links, (link) => link.id);
                    CDS.createLinks(linksData);
                    CDS.updateLinks(linksData, nodes);
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
                    calculateClusterZoneProperties();
                    CDS.moveElement(clusterZone, clusterZoneX, clusterZoneY);
                    clusterZone
                        .select('.cluster-zone')
                        .attr('r', clusterZoneRadius);
                }

                function calculateClusterZoneProperties() {
                    clusterZoneRadius = Math.min(width, height) / 2 - 100;
                    clusterZoneX = width / 2;
                    clusterZoneY = height / 2;
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
                    const nodes = _.cloneDeep(scope.clusterModel.nodes) || [];
                    const links = _.cloneDeep(scope.clusterModel.links) || [];
                    createNodes(nodes);
                    drawLinks(links, nodes);
                }

                initialize();
            }
        };
    }
]);
