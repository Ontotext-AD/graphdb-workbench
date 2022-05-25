import 'angular/utils/local-storage-adapter';
import * as CDS from "./cluster-drawing.service";
import {LinkState, NodeState} from "./controllers";


const navigationBarWidthFull = 240;
const navigationBarWidthCollapsed = 70;
let navigationBarWidth = navigationBarWidthFull;

const nodeRadius = 50;
const legendNodeRadius = 25;

const clusterManagementDirectives = angular.module('graphdb.framework.clustermanagement.directives', [
    'graphdb.framework.utils.localstorageadapter'
]);

clusterManagementDirectives.directive('clusterGraphicalView', ['$window', 'LocalStorageAdapter', 'LSKeys',
    function ($window, LocalStorageAdapter, LSKeys) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                scope.showLegend = false;

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

                let legendNodesGroup;
                let legendWidth;
                let legendHeight;

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
                    createClusterLegend();
                    plot();
                }

                function createClusterZone(hasCluster) {
                    svg = CDS.createClusterSvgElement(element[0])
                        .attr('width', width)
                        .attr('height', height);

                    clusterZone = CDS.createClusterZone(svg, hasCluster);

                    linksGroup = svg.append('g').attr('id', 'links-group');
                    nodesGroup = svg.append('g').attr('id', 'nodes-group');
                    legendNodesGroup = svg.append('g').attr('id', 'legend-nodes-group').classed('hidden', !scope.showLegend);
                }

                function createClusterLegend() {
                    const legendPadding = 10;
                    const nodeLinkStateTextHeight = 14;

                    const nodeStateLabelY = legendPadding + nodeLinkStateTextHeight;
                    const linkStateLabelY = nodeStateLabelY + legendPadding * 3 + legendNodeRadius * 5;

                    const legendColumns = 4;
                    const nodesXPadding = 10;
                    const nodesYPadding = 15;

                    legendNodesGroup.append('rect')
                        .attr('id', 'legend-background')
                        .attr('class', 'legend-background')
                        .attr('fill', '#EEEEEE');

                    const nodeStateGroup = legendNodesGroup
                        .append('text')
                        .attr('class', 'id id-host')
                        .attr('x', nodeRadius * 4)
                        .attr('y', nodeStateLabelY)
                        .text('NODE STATE');

                    const linkStateGroup = legendNodesGroup
                        .append('text')
                        .attr('class', 'id id-host')
                        .attr('x', nodeRadius * 4)
                        .attr('y', linkStateLabelY)
                        .text('LINK STATE');

                    const legendNodes = getLegendNodes();
                    const legendNodeData = legendNodesGroup.selectAll('#legend-nodes-group').data(legendNodes);
                    CDS.createNodes(legendNodeData, legendNodeRadius, true);
                    legendNodeData
                        .attr('transform', (d) => {
                            const row = Math.floor(d.id / legendColumns);
                            const column = d.id % legendColumns;
                            const x = legendPadding + legendNodeRadius + (nodesXPadding + legendNodeRadius * 2) * column;
                            const y = legendPadding * 2 + nodeLinkStateTextHeight + legendNodeRadius + (nodesYPadding + legendNodeRadius * 2) * row;
                            return `translate(${x}, ${y})`;
                        });
                    CDS.updateNodes(legendNodeData, true);

                    legendNodesGroup
                        .call(function () {
                            legendWidth = this.node().getBBox().width;
                        });

                    // Position node/link state labels
                    nodeStateGroup.attr('x', legendPadding + legendWidth / 2);
                    linkStateGroup.attr('x', legendPadding + legendWidth / 2);

                    const links = getLegendLinks();

                    const linkWidth = legendWidth / 3;

                    const linksGroup = legendNodesGroup.append('g').attr('id', 'links-group');
                    const linksGroupY = linkStateLabelY + legendPadding;
                    linksGroup.attr('transform', `translate(${legendPadding}, ${linksGroupY})`);

                    links.forEach((link, index) => {
                        const linkPadding = 5;
                        const startX = linkPadding;
                        const endX = linkWidth - linkPadding;

                        const linkG = linksGroup
                            .append('g')
                            .classed('link', true)
                            .classed('legend', true)
                            .attr('transform', () => {
                                const x = index * linkWidth;
                                return `translate(${x}, 0)`;
                            });

                        linkG
                            .append('path')
                            .classed('link', true)
                            .attr('stroke-dasharray', () => CDS.setLinkStyle(link))
                            .attr('stroke', () => CDS.setLinkColor(link))
                            .attr('d', () => {
                                return `M${startX},0,${endX},0`;
                            });

                        linkG
                            .append('text')
                            .attr('x', linkWidth / 2)
                            .attr('y', 15)
                            .attr('class', 'id id-host')
                            .text(link.linkTypeText);
                    });

                    legendNodesGroup
                        .call(function (d) {
                            legendHeight = this.node().getBBox().height;
                            legendWidth = this.node().getBBox().width;
                        });

                    legendNodesGroup.select('.legend-background')
                        .attr('height', legendHeight + legendPadding * 3)
                        .attr('width', legendWidth + legendPadding * 2)
                        .attr('rx', '6');

                    const y = height - (legendHeight + legendPadding * 3 + 50);
                    CDS.moveElement(legendNodesGroup, 0, y);
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
                scope.childContext.toggleLegend = () => {
                    scope.showLegend = !scope.showLegend;
                    legendNodesGroup.classed('hidden', !scope.showLegend);
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

const getLegendNodes = function () {
    const legendNodes = [];
    legendNodes.push({nodeState: NodeState.LEADER, customText: 'Leader'});
    legendNodes.push({nodeState: NodeState.FOLLOWER, customText: 'Follower'});
    legendNodes.push({nodeState: NodeState.CANDIDATE, customText: 'Candidate'});
    legendNodes.push({nodeState: NodeState.NO_CLUSTER, customText: 'No cluster'});
    legendNodes.push({nodeState: NodeState.OUT_OF_SYNC, customText: 'Out of sync'});
    legendNodes.push({nodeState: NodeState.NO_CONNECTION, customText: 'No connection'});
    legendNodes.push({nodeState: NodeState.READ_ONLY, customText: 'Read only'});
    legendNodes.push({nodeState: NodeState.RESTRICTED, customText: 'Restricted'});
    legendNodes.forEach((node, index) => node.id = index);
    return legendNodes;
};

const getLegendLinks = function () {
    const links = [];
    links.push({status: LinkState.IN_SYNC, linkTypeText: 'In sync'});
    links.push({status: LinkState.SYNCING, linkTypeText: 'Syncing'});
    links.push({status: LinkState.OUT_OF_SYNC, linkTypeText: 'Out of sync'});
    links.forEach((link, index) => link.id = index);
    return links;
};
