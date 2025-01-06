import 'angular/utils/local-storage-adapter';
import 'angular/clustermanagement/directives/cluster-legend.directive';
import * as CDS from "../services/cluster-drawing.service";
import {ARROW_CONFIG} from "../services/cluster-drawing.service";
import {cloneDeep, isEmpty} from "lodash";
import {CLICK_IN_VIEW, CREATE_CLUSTER, MODEL_UPDATED, NODE_SELECTED} from "../events";
import {select} from 'd3';

const d3 = {select};
const navigationBarWidthFull = 240;
const navigationBarWidthCollapsed = 70;
let navigationBarWidth = navigationBarWidthFull;
const nodeRadius = 45;

// Labels in translation map is dynamically translated and reassigned. It contains defaults
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
    link_state_out_of_sync: "Out of sync",
    recovery_state: {
        searching_for_node: "Searching for node",
        waiting_for_snapshot: "Waiting for snapshot from node",
        receiving_snapshot: "Receiving a snapshot from node",
        applying_snapshot: "Applying a snapshot",
        building_snapshot: "Building a snapshot for node",
        sending_snapshot: "Sending a snapshot to node",
        recovery_operation_failure_warning: "Node unable to recover. Action required"
    }
};

const idTranslationKeyMap = {
    node_state: 'legend_node_state',
    link_state: 'legend_link_state'
};

const clusterManagementDirectives = angular.module('graphdb.framework.clustermanagement.directives.cluster-graphical-view', [
    'graphdb.framework.utils.localstorageadapter',
    'graphdb.framework.clustermanagement.directives.cluster-legend'
]);

clusterManagementDirectives.directive('clusterGraphicalView', ['$window', 'LocalStorageAdapter', 'LSKeys', 'UriUtils', '$translate', '$jwtAuth', '$rootScope', 'ClusterViewContextService',
    function ($window, LocalStorageAdapter, LSKeys, UriUtils, $translate, $jwtAuth, $rootScope, ClusterViewContextService) {
        return {
            restrict: 'E',
            scope: {
                clusterModel: '='
            },
            link: function (scope, element) {

                // =========================
                // Private variables
                // =========================

                const w = angular.element($window);
                const subscriptions = [];
                let hasAccess;
                let width = getWindowWidth();
                let height = getWindowHeight();
                let clusterZoneRadius = Math.min(width, height) / 2 - 100;
                let clusterZoneX = width / 2;
                let clusterZoneY = height / 2;
                let hasCluster;

                // SVG components
                let clusterZone;
                let nodesGroup;
                let linksGroup;

                // =========================
                // Public variables
                // =========================

                // =========================
                // Public functions
                // =========================

                scope.width = function () {
                    return width;
                };

                scope.height = function () {
                    return height;
                };

                // =========================
                // Private functions
                // =========================

                function resize() {
                    const svg = ClusterViewContextService.getClusterViewD3Container();
                    // recalculates with new screen width
                    width = getWindowWidth();
                    height = getWindowHeight();
                    svg.attr("width", width);
                    svg.attr("height", height);
                    plot();
                }

                function updateTranslations(translationMapObject, translationAppend = '') {
                    Object.keys(translationMapObject).forEach((key) => {
                        let compoundKey = '';
                        if (translationAppend) {
                            compoundKey += translationAppend;
                        }
                        compoundKey += `.${key}`;
                        const value = translationMapObject[key];
                        if (typeof value === 'string') {
                            translationMapObject[key] = $translate.instant(`cluster_management.cluster_graphical_view${compoundKey}`);
                        } else if (typeof value === 'object') {
                            updateTranslations(value, compoundKey);
                        }
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
                    return Math.max((($window.innerHeight - 250) * 0.95), 675);
                }

                function updateLabels() {
                    CDS.updateClusterZoneLabels(hasCluster, clusterZone, translationsMap);
                    Object.keys(idTranslationKeyMap).forEach((elementId) => {
                        d3.select(`#${elementId}`).text(getLabelFor(elementId));
                    });
                }

                function getLabelFor(elementId) {
                    const labelKey = idTranslationKeyMap[elementId];
                    return translationsMap[labelKey];
                }

                function createClusterZone(hasCluster) {
                    const svg = CDS.createClusterSvgElement(element[0])
                        .attr('width', width)
                        .attr('height', height);

                    clusterZone = CDS.createClusterZone(svg, hasCluster);

                    linksGroup = svg.append('g').attr('id', 'links-group');
                    nodesGroup = svg.append('g').attr('id', 'nodes-group');

                    CDS.addArrowHead(svg, ARROW_CONFIG.BIG);
                    CDS.addArrowHead(svg, ARROW_CONFIG.SMALL);

                    ClusterViewContextService.updateClusterViewD3Container(svg);
                }

                function createNodes(nodes) {
                    const nodeData = nodesGroup.selectAll('#node-group').data(nodes, (node) => node.address);
                    const nodesElements = CDS.createNodes(nodeData, nodeRadius);
                    nodesElements
                        .on('click', (event, d) => {
                            scope.$emit(NODE_SELECTED, d);
                            // position the tooltip according to the node!
                            const tooltip = d3.select('.nodetooltip');
                            const windowWidth = $(window).width();
                            if (event.pageX < windowWidth / 2) {
                                // left
                                tooltip.style("left", event.pageX + "px");
                                tooltip.style("right", "");
                            } else {
                                // right
                                tooltip.style("left", "");
                                tooltip.style("right", (windowWidth - event.pageX) + "px");
                            }
                            tooltip.style("top", (event.pageY - 28) + "px");
                        });
                    CDS.updateNodes(nodesElements);
                    CDS.positionNodesOnClusterZone(nodesElements, clusterZoneX, clusterZoneY, clusterZoneRadius);
                }

                function drawLinks(links, nodes) {
                    const linksData = linksGroup.selectAll('.link').data(links, (link) => link.id);
                    CDS.createLinks(linksData);
                    CDS.updateLinks(linksData, nodes);
                }

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
                    if (!hasCluster && hasAccess) {
                        clusterZone.on('mouseup', () => {
                            scope.$emit(CREATE_CLUSTER);
                        });
                    }
                }

                function getNodesModel() {
                    const nodes = cloneDeep(scope.clusterModel.nodes) || [];
                    nodes.forEach((node) => {
                        node.hostname = UriUtils.shortenIri(node.endpoint);
                        if (!isEmpty(node.recoveryStatus)) {
                            let messageLabelKey = `cluster_management.cluster_graphical_view.recovery_state.${node.recoveryStatus.state.toLowerCase()}`;
                            const hasAffectedNodes = node.recoveryStatus.affectedNodes && node.recoveryStatus.affectedNodes.length > 0;
                            if (hasAffectedNodes) {
                                messageLabelKey += '_with_affected_node';
                            }
                            node.recoveryStatus.message = $translate.instant(messageLabelKey, {node: node.recoveryStatus.affectedNodes.join(', ')});
                        }
                    });
                    return nodes;
                }

                function mousedownHandler(event) {
                    scope.$emit(CLICK_IN_VIEW, event.target);
                }

                function plot() {
                    resizeClusterComponent();
                    if (hasCluster !== scope.clusterModel.hasCluster) {
                        hasCluster = !!scope.clusterModel.hasCluster;
                        setClusterZoneType(hasCluster);
                    }
                    const nodes = getNodesModel();
                    createNodes(nodes);
                    const links = cloneDeep(scope.clusterModel.links) || [];
                    drawLinks(links, nodes);
                }

                // =========================
                // Events and watchers
                // =========================

                const subscribeHandlers = () => {
                    w.bind('resize', resize);
                    w.bind('mousedown', mousedownHandler);

                    subscriptions.push($rootScope.$on('$translateChangeSuccess', function () {
                        updateTranslations(translationsMap);
                        updateLabels();
                    }));

                    subscriptions.push(scope.$on(MODEL_UPDATED, function () {
                        plot();
                    }));
                };

                const removeAllListeners = () => {
                    subscriptions.forEach((subscription) => subscription());
                };

                scope.$on("$destroy", function () {
                    w.unbind('resize', resize);
                    w.unbind('mousedown', mousedownHandler);
                    CDS.removeEventListeners();
                    removeAllListeners();
                });

                // =========================
                // Initialization
                // =========================

                function initialize() {
                    hasAccess = $jwtAuth.isAdmin();
                    subscribeHandlers();
                    updateTranslations(translationsMap);
                    const hasCluster = !!(scope.clusterModel.nodes && scope.clusterModel.nodes.length);
                    createClusterZone(hasCluster);
                    plot();
                }
                initialize();
            }
        };
    }
]);
