import 'angular/utils/local-storage-adapter';
import * as CDS from "./cluster-drawing.service";
import {LinkState, NodeState} from "./controllers";
import d3tip from 'lib/d3-tip/d3-tip-patch';


const navigationBarWidthFull = 240;
const navigationBarWidthCollapsed = 70;
let navigationBarWidth = navigationBarWidthFull;

const nodeRadius = 50;
const legendNodeRadius = 25;

const clusterManagementDirectives = angular.module('graphdb.framework.clustermanagement.directives', [
    'graphdb.framework.utils.localstorageadapter'
]);

const translationsMap = {
    no_cluster_configured: '',
    create_cluster_btn: '',
    legend_node_state: '',
    legend_link_state: '',
    node_state_leader: "Leader",
    node_state_follower: "Follower",
    node_state_candidate: "Candidate",
    node_state_no_cluster: "No cluster",
    node_state_out_of_sync: "Out of sync",
    node_state_no_connection: "No connection",
    node_state_read_only: "Read only",
    node_state_restricted: "Restricted",
    link_state_in_sync: "In sync",
    link_state_syncing: "Syncing",
    link_state_out_of_sync: "Out of sync"
};

const idTranslationKeyMap = {
    node_state: 'legend_node_state',
    link_state: 'legend_link_state'
};

clusterManagementDirectives.directive('clusterGraphicalView', ['$window', 'LocalStorageAdapter', 'LSKeys', 'UriUtils', '$translate', '$rootScope',
    function ($window, LocalStorageAdapter, LSKeys, UriUtils, $translate, $rootScope) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                const hasAccess = scope.isAdmin();

                scope.showLegend = false;
                $rootScope.$on('$translateChangeSuccess', function () {
                    updateTranslations();
                    updateLabels();
                });
                scope.$on("$destroy", function () {
                    legendTooltip.destroy();
                });
                function updateTranslations() {
                    Object.keys(translationsMap).forEach((key) => {
                        translationsMap[key] = $translate.instant('cluster_management.cluster_graphical_view.' + key);
                    });
                }

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
                const legendPadding = 10;

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

                function updateLabels() {
                    CDS.updateClusterZoneLabels(hasCluster, clusterZone, translationsMap);
                    Object.keys(idTranslationKeyMap).forEach((elementId) => {
                        d3.select(`#${elementId}`).text(getLabelFor(elementId));
                    });
                    if (legendNodesGroup) {
                        legendNodesGroup.remove();
                    }
                    createLegendGroup();
                    createClusterLegend();
                }

                function translateLegendLinksAndNodes(legendNodes, legendLinks) {
                    legendNodes.forEach((node) => {
                        node.toolTip = node.hostname = translationsMap[node.customText];
                    });
                    legendLinks.forEach((link) => {
                        link.toolTip = link.linkTypeText = translationsMap[link.linkTypeKey];
                    });
                }

                function getLabelFor(elementId) {
                    const labelKey = idTranslationKeyMap[elementId];
                    return translationsMap[labelKey];
                }

                function initialize() {
                    updateTranslations();
                    const hasCluster = !!(scope.clusterModel.nodes && scope.clusterModel.nodes.length);
                    createClusterZone(hasCluster);
                    createClusterLegend();
                    plot();
                }

                function createClusterZone(hasCluster) {
                    svg = CDS.createClusterSvgElement(element[0])
                        .attr('width', width)
                        .attr('height', height);
                    svg.call(legendTooltip);

                    clusterZone = CDS.createClusterZone(svg, hasCluster);

                    linksGroup = svg.append('g').attr('id', 'links-group');
                    nodesGroup = svg.append('g').attr('id', 'nodes-group');
                    createLegendGroup();
                }

                function createLegendGroup() {
                    legendNodesGroup = svg.append('g').attr('id', 'legend-group')
                        .classed('hidden', !scope.showLegend)
                        .classed('legend-group', true);
                }

                let tooltipElement;
                const legendTooltip = d3tip()
                    .attr('class', 'd3-tip')
                    .customPosition(function () {
                        const bbox = tooltipElement.getBoundingClientRect();
                        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                        const scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

                        return {
                            left: bbox.left + scrollLeft + 'px',
                            top: (bbox.top - 30) + scrollTop + 'px'
                        };
                    })
                    .html(function (d) {
                        return d.toolTip;
                    });

                // Shows tooltip with legend node or link state
                const showLegendTooltip = function (d, element) {
                    tooltipElement = element;
                    legendTooltip.show(d, tooltipElement);
                };

                // Hides the tooltip with legend node or link state
                const hideLegendTooltip = function () {
                    tooltipElement = null;
                    legendTooltip.hide();
                };

                function createClusterLegend() {
                    const nodeLinkStateTextHeight = 14;

                    const nodeStateLabelY = legendPadding + nodeLinkStateTextHeight;
                    const linkStateLabelY = nodeStateLabelY + legendPadding * 3 + legendNodeRadius * 5;

                    const legendColumns = 4;
                    const nodesXPadding = 15;
                    const nodesYPadding = 15;

                    const legendNodes = getLegendNodes();
                    const legendLinks = getLegendLinks();
                    translateLegendLinksAndNodes(legendNodes, legendLinks);

                    legendNodesGroup.append('rect')
                        .attr('id', 'legend-background')
                        .attr('class', 'legend-background')
                        .attr('fill', '#EEEEEE');

                    const nodeStateLabel = legendNodesGroup
                        .append('text')
                        .attr('id', 'node_state')
                        .attr('class', 'id id-host')
                        .attr('x', nodeRadius * 4)
                        .attr('y', nodeStateLabelY)
                        .text(getLabelFor('node_state'));

                    const linkStateLabel = legendNodesGroup
                        .append('text')
                        .attr('id', 'link_state')
                        .attr('class', 'id id-host')
                        .attr('x', nodeRadius * 4)
                        .attr('y', linkStateLabelY)
                        .text(getLabelFor('link_state'));

                    const legendNodeData = legendNodesGroup.selectAll('#node-group').data(legendNodes);
                    CDS.createNodes(legendNodeData, legendNodeRadius, true);
                    CDS.updateNodes(legendNodeData);

                    legendNodeData.select('.node.member')
                        .on("mouseover", function (d) {
                            d3.event.stopPropagation();
                            showLegendTooltip(d, this);
                        })
                        .on('mouseout', hideLegendTooltip);

                    legendNodeData
                        .attr('transform', function (d) {
                            const row = Math.floor(d.id / legendColumns);
                            const column = d.id % legendColumns;
                            const x = legendPadding + legendNodeRadius + (nodesXPadding + legendNodeRadius * 2) * column;
                            const y = legendPadding * 2 + nodeLinkStateTextHeight + legendNodeRadius + (nodesYPadding + legendNodeRadius
                                * 2) * row;
                            return `translate(${x}, ${y})`;
                        });

                    legendNodesGroup
                        .call(function () {
                            legendWidth = this.node().getBBox().width;
                        });

                    // Position node/link state labels
                    nodeStateLabel.attr('x', legendPadding + legendWidth / 2);
                    linkStateLabel.attr('x', legendPadding + legendWidth / 2);


                    const linkWidth = legendWidth / 3;

                    const linksGroup = legendNodesGroup.append('g').attr('id', 'links-group');
                    const linksGroupY = linkStateLabelY + legendPadding;
                    linksGroup.attr('transform', `translate(${legendPadding}, ${linksGroupY})`);

                    legendLinks.forEach((link, index) => {
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

                        linkG.append('foreignObject')
                            .attr('y', 10)
                            .attr('x', 5)
                            .attr('width', linkWidth - 10)
                            .attr('height', 10)
                            .attr('class', 'label-wrapper')
                            .append('xhtml:div')
                            .attr('class', 'id id-host')
                            .style("font-size", "9px")
                            .html(link.linkTypeText);

                        linkG
                            .on('mouseover', function () {
                                d3.event.stopPropagation();
                                showLegendTooltip(link, this);
                            })
                            .on('mouseout', hideLegendTooltip);
                    });


                    legendNodesGroup
                        .call(function (d) {
                            legendHeight = this.node().getBBox().height;
                            legendWidth = this.node().getBBox().width;
                        });

                    legendNodesGroup.select('.legend-background')
                        .attr('height', legendHeight + legendPadding * 4)
                        .attr('width', legendWidth + legendPadding * 2)
                        .attr('rx', '6');

                    positionLegend();
                }

                function positionLegend() {
                    const y = height - (legendHeight + legendPadding * 3 + 50);
                    CDS.moveElement(legendNodesGroup, 0, y);
                }

                function createNodes(nodes) {
                    nodes.forEach((node) => node.hostname = UriUtils.shortenIri(node.endpoint));
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
                    positionLegend();
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
                    CDS.setCreateClusterZone(hasCluster, clusterZone, translationsMap, hasAccess);
                    let mouseupCallback;
                    if (!hasCluster && hasAccess) {
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
    legendNodes.push({nodeState: NodeState.LEADER, customText: 'node_state_leader'});
    legendNodes.push({nodeState: NodeState.FOLLOWER, customText: 'node_state_follower'});
    legendNodes.push({nodeState: NodeState.CANDIDATE, customText: 'node_state_candidate'});
    legendNodes.push({nodeState: NodeState.NO_CLUSTER, customText: 'node_state_no_cluster'});
    legendNodes.push({nodeState: NodeState.OUT_OF_SYNC, customText: 'node_state_out_of_sync'});
    legendNodes.push({nodeState: NodeState.NO_CONNECTION, customText: 'node_state_no_connection'});
    legendNodes.push({nodeState: NodeState.READ_ONLY, customText: 'node_state_read_only'});
    legendNodes.push({nodeState: NodeState.RESTRICTED, customText: 'node_state_restricted'});
    legendNodes.forEach((node, index) => node.id = index);
    return legendNodes;
};

const getLegendLinks = function () {
    const links = [];
    links.push({status: LinkState.IN_SYNC, linkTypeKey: 'link_state_in_sync'});
    links.push({status: LinkState.SYNCING, linkTypeKey: 'link_state_syncing'});
    links.push({status: LinkState.OUT_OF_SYNC, linkTypeKey: 'link_state_out_of_sync'});
    links.forEach((link, index) => link.id = index);
    return links;
};
