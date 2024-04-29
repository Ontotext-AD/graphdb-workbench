import {CLUSTER_MANAGEMENT_CONSTANTS} from "../../models/clustermanagement/cluster-management-constants";
import * as CDS from "../services/cluster-drawing.service";
import {LinkState} from "../../models/clustermanagement/states";
import {ARROW_CONFIG} from "../services/cluster-drawing.service";

const modules = [];
angular.module('graphdb.framework.clustermanagement.directives.cluster-legend', modules)
    .directive('clusterLegend', clusterLegend);

clusterLegend.$inject = ['$rootScope', 'ClusterViewContextService', '$translate', '$document'];

function clusterLegend($rootScope, ClusterViewContextService, $translate, $document) {
    return {
        restrict: 'E',
        templateUrl: 'js/angular/clustermanagement/templates/cluster-legend.html',
        scope: {},
        link: ($scope) => {

            // =========================
            // Public variables
            // =========================

            $scope.hideLegend = true;

            // =========================
            // Private variables
            // =========================

            const subscriptions = [];
            let legendGroup;
            let legendHeight;
            let legendWidth;

            // =========================
            // Public functions
            // =========================

            $scope.toggleLegend = () => {
                $scope.hideLegend = !$scope.hideLegend;
                legendGroup.classed('hidden', $scope.hideLegend);
            };

            // =========================
            // Private functions
            // =========================

            const init = () => {
                const clusterViewD3Container = ClusterViewContextService.getClusterViewD3Container();
                createLegendGroup(clusterViewD3Container);
                createLegendBackground();
                addNodeStates(legendGroup);
                addSyncStatus();
                addLinks();
                updateLegendDimensions();
                updateLegendBackground();
            };

            const addNodeStates = (legendGroup) => {
                addTitle(legendGroup, 'cluster_management.cluster_graphical_view.legend_title_node_state');
                const legendNodeData = legendGroup
                    .selectAll('.node-group')
                    .data(CLUSTER_MANAGEMENT_CONSTANTS.getLegendNodes());
                const legendNodesElements = CDS.createNodes(legendNodeData, CLUSTER_MANAGEMENT_CONSTANTS.SVG_NODE_WIDTH, true);
                CDS.updateNodes(legendNodesElements);
                const LABEL_Y_POSITION = 3;
                legendNodesElements
                    .attr('transform', function (d, i) {
                        updateLegendDimensions();
                        return `translate(${CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_PADDING_LEFT}, ${legendHeight + CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_PADDING_TOP})`;
                    })
                    .append('text')
                    .style('font-size', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_FONT_SIZE)
                    .style('line-height', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_LINE_HEIGHT)
                    .style('font-weight', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_FONT_WEIGHT)
                    .style('fill', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_COLOR)
                    .attr('x', CLUSTER_MANAGEMENT_CONSTANTS.PADDING_LEFT + CLUSTER_MANAGEMENT_CONSTANTS.SVG_NODE_WIDTH)
                    .attr('y', LABEL_Y_POSITION)
                    .text(function (d) {
                        return translateAndSubscribe(this, 'cluster_management.cluster_graphical_view.' + d.customText);
                    });
            };

            const addSyncStatus = () => {
                addTitle(legendGroup, 'cluster_management.cluster_graphical_view.legend_title_sync_status');
                const syncStatusesGroups = legendGroup.selectAll('.sync-statuses-group')
                    .data(CLUSTER_MANAGEMENT_CONSTANTS.getSyncStatuses())
                    .enter()
                    .append('g')
                    .attr('class', 'sync-statuses-group');

                const rowY = new Map();

                syncStatusesGroups
                    .append('text')
                    .classed('sync-status', true)
                    .attr('class', (d) => d.classes)
                    .style('font-size', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_ICON_FONT_SIZE)
                    .style('line-height', CLUSTER_MANAGEMENT_CONSTANTS.TITLE_LINE_HEIGHT)
                    .attr('x', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_PADDING_LEFT - 10)
                    .attr('y', function (d, index) {
                        const rowTop = index * (20 + CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_PADDING_TOP) + legendHeight + CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEMS_PADDING_TOP;
                        rowY.set(index, rowTop);
                        return rowTop;
                    })
                    .text(function (d) {
                        return d.icon;
                    });

                const labelOffsetY = (CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_ICON_FONT_SIZE - CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_FONT_SIZE) / 2;
                syncStatusesGroups
                    .append('text')
                    .style('font-size', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_FONT_SIZE)
                    .style('line-height', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_LINE_HEIGHT)
                    .style('font-weight', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_FONT_WEIGHT)
                    .style('fill', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_COLOR)
                    .text(function (d) {
                        return translateAndSubscribe(this, 'cluster_management.cluster_graphical_view.' + d.labelKey);
                    })
                    .attr('x', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_PADDING_LEFT + CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_FONT_SIZE)
                    .attr('y', function (d, index) {
                        return rowY.get(index) - labelOffsetY;
                    })
                    .classed('links-statuses', true);
            };

            const addLinks = () => {
                addTitle(legendGroup, 'cluster_management.cluster_graphical_view.legend_title_link_states');
                const linkStatesGroup = legendGroup.selectAll('.link-states-group')
                    .data(CLUSTER_MANAGEMENT_CONSTANTS.getLegendLinks())
                    .enter()
                    .append('g')
                    .attr('class', 'link-state');

                // map vertical positions of each link in order to be able to draw labels next to the links
                const rowY = new Map();

                linkStatesGroup
                    .append('path')
                    .classed('link', true)
                    .attr('stroke-dasharray', CDS.setLinkStyle)
                    .attr('stroke', CDS.setLinkColor)
                    .attr('d', (link, index) => {
                        const y = index * (CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_FONT_SIZE + CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_PADDING_TOP) + legendHeight + CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEMS_PADDING_TOP;
                        const lineWidth = legendWidth / 2;
                        rowY.set(index, y);
                        let line;
                        if (link.status === LinkState.RECEIVING_SNAPSHOT) {
                            const lineMidPoint = lineWidth / 2;
                            // In order to draw an arrowhead in the middle of a line, the line needs to be composed by
                            // two segments, otherwise the arrowhead won't show up.
                            line = `M${CLUSTER_MANAGEMENT_CONSTANTS.PADDING_LEFT},${y},L${lineMidPoint},${y},L${lineWidth},${y}`;
                        } else {
                            line = `M${CLUSTER_MANAGEMENT_CONSTANTS.PADDING_LEFT},${y},${lineWidth},${y}`;
                        }
                        return line;
                    })
                    .style("marker-mid", (link) => CDS.setArrowLink(link, ARROW_CONFIG.SMALL));

                linkStatesGroup
                    .append('text')
                    .style('font-size', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_FONT_SIZE)
                    .style('line-height', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_LINE_HEIGHT)
                    .style('font-weight', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_FONT_WEIGHT)
                    .style('fill', CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_COLOR)
                    .text(function (d) {
                        return translateAndSubscribe(this, 'cluster_management.cluster_graphical_view.' + d.linkTypeKey);
                    })
                    .attr('x', legendWidth/2 + CLUSTER_MANAGEMENT_CONSTANTS.LEGEND_ITEM_PADDING_LEFT)
                    .attr('y', function (d, index) {
                        return rowY.get(index) + 4;
                    })
                    .classed('links-statuses', true);
            };

            /**
             * Creates main legend container with rectangle that defines width, height and corner radius of legend.
             * @param {*} clusterViewD3Container - main container where legend have to live.
             */
            const createLegendGroup = (clusterViewD3Container) => {
                legendGroup = clusterViewD3Container.append('g')
                    .classed('hidden', $scope.hideLegend)
                    .classed('cluster-legend-group', true);
            };

            const createLegendBackground = () => {
                legendGroup.append('rect')
                    .attr('class', 'legend-background')
                    .attr('fill', '#EEEEEE');
            };

            const updateLegendDimensions = () => {
                legendGroup
                    .call((d) => {
                        legendHeight = d.node().getBBox().height;
                    });
                legendWidth = getMaxWidthOfChildren(legendGroup) + 30;
            };

            const updateLegendBackground = () => {
                const maxWidth = getMaxWidthOfChildren(legendGroup);
                legendGroup.select('.legend-background')
                    .attr('height', legendHeight + CLUSTER_MANAGEMENT_CONSTANTS.PADDING_TOP * 3)
                    .attr('width', maxWidth + CLUSTER_MANAGEMENT_CONSTANTS.BACKGROUND_PADDING)
                    .attr('rx', '6');
            };

            const getMaxWidthOfChildren = (parent) => {
                let maxWidth = 0;

                parent.selectAll(':not(.legend-background)').each(function () {
                    const bbox = this.getBBox();
                    maxWidth = Math.max(maxWidth, bbox.width);
                });

                return maxWidth;
            };

            /**
             * Adds title to <code>legendGroup</code>.
             * @param {*} legendGroup - the root group tag (<g>) of legend.
             * @param {string} labelKey
             *
             * @return {*}
             */
            const addTitle = (legendGroup, labelKey) => {
                return legendGroup
                    .append('text')
                    .attr('class', 'legend-title')
                    .attr('x', CLUSTER_MANAGEMENT_CONSTANTS.PADDING_LEFT)
                    .style('font-size', CLUSTER_MANAGEMENT_CONSTANTS.TITLE_FONT_SIZE)
                    .style('font-weight', CLUSTER_MANAGEMENT_CONSTANTS.TITLE_FONT_WEIGHT)
                    .style('line-height', CLUSTER_MANAGEMENT_CONSTANTS.TITLE_LINE_HEIGHT)
                    .style('fill', CLUSTER_MANAGEMENT_CONSTANTS.TITLE_COLOR)
                    .text(function () {
                        return translateAndSubscribe(this, labelKey);
                    })
                    .attr('y', () => {
                        updateLegendDimensions();
                        return legendHeight + CLUSTER_MANAGEMENT_CONSTANTS.TITLE_PADDING_TOP;
                    });
            };

            const translateAndSubscribe = (domElement, labelKey) => {
                subscriptions.push($rootScope.$on('$translateChangeSuccess', () => {
                    d3.select(domElement).text($translate.instant(labelKey));
                    updateLegendBackground();
                }));

                return $translate.instant(labelKey);
            };

            const removeAllListeners = () => {
                $document.off('keydown', closeDialog);
                subscriptions.forEach((subscription) => subscription());
            };

            const closeDialog = () => {
                $scope.hideLegend = true;
                legendGroup.classed('hidden', $scope.hideLegend);
            };

            const onKeyDown = (event) => {
                if (event.key === 'Escape') {
                    closeDialog();
                }
            };

            // =========================
            // Subscriptions functions
            // =========================
            $document.on('keydown', onKeyDown);
            subscriptions.push(ClusterViewContextService.onClusterViewD3ContainerUpdated(init));

            // Deregister the watcher when the scope/directive is destroyed
            $scope.$on('$destroy', removeAllListeners);

            init();
        }
    };
}
