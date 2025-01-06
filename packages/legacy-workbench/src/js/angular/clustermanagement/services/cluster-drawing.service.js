import {LinkState, NodeState, RecoveryState} from "../../models/clustermanagement/states";
import {isEmpty} from "lodash";
import {select, line} from 'd3';

const d3 = {
  line,
  select
};

const clusterColors = {
    ontoOrange: 'var(--primary-color)',
    ontoBlue: 'var(--secondary-color)',
    ontoGreen: 'var(--tertiary-color)',
    ontoGrey: 'var(--gray-color)'
};

const linkStateColors = {
    [LinkState.IN_SYNC]: clusterColors.ontoBlue,
    [LinkState.SYNCING]: clusterColors.ontoBlue,
    [LinkState.OUT_OF_SYNC]: clusterColors.ontoGrey,
    [LinkState.RECEIVING_SNAPSHOT]: clusterColors.ontoBlue
};

const linkStateStyle = {
    // solid line
    [LinkState.IN_SYNC]: 'none',
    // dashed line
    [LinkState.SYNCING]: '10 10',
    // dashed line
    [LinkState.OUT_OF_SYNC]: '10 10',
    // dashed line
    [LinkState.RECEIVING_SNAPSHOT]: '10 10'
};

const font = {
    FONT_AWESOME: 'FONT_AWESOME',
    ICOMOON: 'ICOMOON'
};

const shortMessageLimit = 40;

export function createClusterSvgElement(element) {
    return d3.select(element)
        .append('svg')
        .classed('cluster-diagram', true);
}

export function createClusterZone(parent) {
    const clusterZone = parent.append('g');
    clusterZone
        .append("circle")
        .classed('cluster-zone', true)
        .style('fill', 'transparent')
        .style('stroke-width', '4');
    return clusterZone;
}

export function setCreateClusterZone(hasCluster, clusterZone, translationsMap, hasAccess = false) {
    clusterZone
        .select('.cluster-zone')
        .classed('no-cluster', !hasCluster)
        .classed('has-access', hasAccess);

    if (hasCluster) {
        clusterZone.selectAll('#no-cluster-zone').remove();
    } else {
        const textGroup = clusterZone
            .append('g')
            .attr("id", "no-cluster-zone");
        textGroup
            .append('text')
            .attr('id', 'no-cluster-label')
            .text(translationsMap.no_cluster_configured)
            .attr('y', -50)
            .classed('h2', true)
            .style('text-anchor', "middle");
        if (hasAccess) {
            textGroup.append('text')
                .attr('id', 'create-cluster-label')
                .classed('h3', true)
                .text(translationsMap.create_cluster_btn)
                .style('text-anchor', "middle");
        }
        textGroup.append('text')
            .attr('y', 130)
            .attr('class', 'icon-any repo')
            .attr('fill', clusterColors.ontoOrange)
            .style('text-anchor', "middle")
            .classed('settings-icon', true)
            .text("\ue92b");
    }
}

export function updateClusterZoneLabels(hasCluster, clusterZone, translationsMap) {
    if (hasCluster) {
        return;
    }
    clusterZone.select('#no-cluster-zone #no-cluster-label')
        .text(translationsMap.no_cluster_configured);
    clusterZone.select('#no-cluster-zone #create-cluster-label')
        .text(translationsMap.create_cluster_btn);
}

export function moveElement(element, x, y) {
    element.attr('transform', () => {
        return `translate(${x}, ${y})`;
    });
}

export function createNodes(nodesDataBinding, nodeRadius, isLegend) {
    const nodeGroup = nodesDataBinding.enter()
        .append('g')
        .attr('id', 'node-group')
        .classed('legend', isLegend);

    const nodeUpdateElements = nodeGroup
        .merge(nodesDataBinding)
        .attr('id', 'node-group')
        .classed('legend', isLegend);

    createHexagon(nodeGroup, nodeRadius);
    nodesDataBinding.exit().remove();

    nodeGroup
        .append('text')
        .attr('class', 'icon-any node-icon');

    if (!isLegend) {
        addHostnameToNodes(nodeGroup, nodeRadius, isLegend);
    }
    return nodeUpdateElements;
}

function addHostnameToNodes(nodeElements, nodeRadius) {
    const nodeTextHost = nodeElements.append('g');

    nodeTextHost
        .append('rect')
        .attr('class', 'id-host-background')
        .attr('rx', 6);

    nodeTextHost
        .append('rect')
        .attr('class', 'node-info-background')
        .attr('rx', 6);

    nodeTextHost
        .append('text')
        .attr('y', nodeRadius + 25)
        .attr('class', 'id id-host');

    nodeTextHost
        .append('text')
        .attr('y', nodeRadius + 55)
        .attr('class', 'node-info-text');
}

export function updateNodes(nodes) {
    updateNodesIcon(nodes);
    updateNodesClasses(nodes);
    updateNodesHostnameText(nodes);
    updateNodesInfoText(nodes);
}

function updateNodesClasses(nodes) {
    nodes
        .select('.node.member')
        .classed('leader', (node) => node.nodeState === NodeState.LEADER)
        .classed('follower', (node) => node.nodeState === NodeState.FOLLOWER)
        .classed('candidate', (node) => node.nodeState === NodeState.CANDIDATE)
        .classed('other', (node) => {
            return node.nodeState !== NodeState.LEADER &&
                node.nodeState !== NodeState.FOLLOWER &&
                node.nodeState !== NodeState.CANDIDATE;
        });
}

function updateNodesIcon(nodes) {
    nodes.select('.node-icon')
        .each(function (d) {
            const iconType = hasRecoveryState(d) ? getNodeInfoIconType(d) : getNodeIconType(d);
            d3.select(this)
                .classed('icon-any', iconType.font === font.ICOMOON)
                .classed('fa-d3', iconType.font === font.FONT_AWESOME)
                .text(iconType.icon);
        });
}

function hasRecoveryState(node) {
    return !isEmpty(node.recoveryStatus);
}

const iconMap = {
    [RecoveryState.SEARCHING_FOR_NODE]: {icon: '\uf29c', font: font.FONT_AWESOME},
    [RecoveryState.WAITING_FOR_SNAPSHOT]: {icon: '\uf017', font: font.FONT_AWESOME},
    [RecoveryState.RECEIVING_SNAPSHOT]: {icon: '\uf0ed', font: font.FONT_AWESOME},
    [RecoveryState.APPLYING_SNAPSHOT]: {icon: '\uf050', font: font.FONT_AWESOME},
    [RecoveryState.BUILDING_SNAPSHOT]: {icon: '\uf187', font: font.FONT_AWESOME},
    [RecoveryState.SENDING_SNAPSHOT]: {icon: '\uf0ee', font: font.FONT_AWESOME},
    [RecoveryState.RECOVERY_OPERATION_FAILURE_WARNING]: {icon: '\ue920', font: font.ICOMOON}
};

const nodeStateIcons = {
    [NodeState.CANDIDATE]: {icon: '\ue914', font: font.ICOMOON},
    [NodeState.NO_CONNECTION]: {icon: '\ue931', font: font.ICOMOON},
    [NodeState.OUT_OF_SYNC]: {icon: '\ue920', font: font.ICOMOON},
    [NodeState.READ_ONLY]: {icon: '\ue95c', font: font.ICOMOON},
    [NodeState.RESTRICTED]: {icon: '\ue933', font: font.ICOMOON}
};

function getNodeInfoIconType(node) {
    const status = node.recoveryStatus;

    if (!status || !status.state) {
        return {icon: '', font: ''};
    }

    return iconMap[status.state] || {icon: '', font: ''};
}

function getNodeIconType(node) {
    const iconType = nodeStateIcons[node.nodeState];
    return iconType ? iconType : {icon: '', font: ''};
}

function updateNodesInfoText(nodes) {
    let objectHeight;
    let objectWidth;
    // Set initial text element
    nodes.select('.node-info-text')
        .each(function (d) {
            d.infoNode = this;
        })
        .select(function () {
            return this.parentNode;
        })
        .append('foreignObject')
        .attr('width', function (d) {
            if (isEmpty(d.recoveryStatus)) {
                return 0;
            }
            const shortMessage = extractShortMessageFromNode(d);
            const rect = calculateElementSizeByText(shortMessage);
            objectHeight = rect.height;
            objectWidth = rect.width;
            return objectWidth;
        })
        .attr('height', function (d) {
            if (isEmpty(d.recoveryStatus)) {
                return 0;
            }
            return objectHeight;
        })
        .attr('x', function (d) {
            return -(objectWidth / 2);
        })
        .attr('y', function (d) {
            return 78;
        })
        .classed('hidden', function (d) {
            return isEmpty(d.recoveryStatus);
        })
        .style('font-size', '12px')
        .style('font-weight', '400')
        .style('text-align', 'center')
        .style('padding', '4px')
        .style('background', '#EEEEEE')
        .style('border-radius', '6px')
        .attr('class', 'node-info-fo')
        .append('xhtml:div')
        .html(function (d) {
            return extractShortMessageFromNode(d);
        });

    // Remove the original text elements, as they are now replaced by foreignObjects
    nodes.select('.node-info-text').remove();

    resizeLabelDynamic(nodes);
}

function extractShortMessageFromNode(node) {
    return node.recoveryStatus.message && node.recoveryStatus.message.length > shortMessageLimit ?
        node.recoveryStatus.message.substring(0, shortMessageLimit) + '...' : node.recoveryStatus.message || '';
}

function calculateElementSizeByText(text) {
    const tmp = document.createElement('div');
    tmp.innerHTML = text;
    tmp.style.padding = '4px';
    tmp.style.position = 'absolute';
    tmp.style.visibility = 'hidden';
    tmp.style.fontSize = '12px';
    tmp.style.fontWeight = '400';
    tmp.style.textAlign = 'center';
    tmp.style.height = 'auto';
    tmp.style.width = 'auto';
    tmp.style.whiteSpace = 'nowrap';

    document.body.appendChild(tmp);
    const rect = tmp.getBoundingClientRect();
    const height = rect.height;
    const width = rect.width;
    document.body.removeChild(tmp);

    return {height, width};
}

function addRecoveryLabelListeners(object, message, truncatedSize, displayMessage, fullSize) {
    object.on('mouseover.tooltip', () => {
        object
            .attr('width', fullSize.width)
            .attr('height', fullSize.height)
            .attr('x', -fullSize.width / 2)
            .html(`<div>${message}</div>`);
    });
    object.on('mouseout.tooltip', () => {
        object
            .attr('width', truncatedSize.width)
            .attr('height', truncatedSize.height)
            .attr('x', -truncatedSize.width / 2)
            .html(`<div>${displayMessage}</div>`);
    });
}

function resizeLabelDynamic(nodes) {
    nodes.select('.node-info-fo')
        .each(function (d) {
            const object = d3.select(this);
            if (isEmpty(d.recoveryStatus)) {
                object.attr('width', 0);
                return;
            }
            const shortMessage = extractShortMessageFromNode(d);
            const isShorten = d.recoveryStatus.message && d.recoveryStatus.message.length > shortMessageLimit && shortMessage !== d.recoveryStatus.message;
            const displayMessage = isShorten ? shortMessage : d.recoveryStatus.message;
            const truncatedSize = calculateElementSizeByText(shortMessage);
            const fullSize = calculateElementSizeByText(d.recoveryStatus.message);
            object.on('.tooltip', null);

            if (isShorten) {
                addRecoveryLabelListeners(object, d.recoveryStatus.message, truncatedSize, displayMessage, fullSize);
            }

            // Set initial size and text
            object
                .attr('width', truncatedSize.width)
                .attr('height', truncatedSize.height)
                .attr('x', -truncatedSize.width / 2)
                .html(`<div>${displayMessage}</div>`);
        });
}

function updateNodesHostnameText(nodes) {
    nodes
        .select('.id.id-host')
        .each(function (d) {
            d.labelNode = this;
        })
        .text(function (d) {
            return d.hostname;
        });

    // Add padding styling to text background. left/right/top/bottom +5
    nodes
        .select('.id-host-background')
        .attr('width', function (d) {
            return d3.select(d.labelNode).node().getBBox().width + 10;
        })
        .attr('height', function (d) {
            return d3.select(d.labelNode).node().getBBox().height + 10;
        })
        .attr('x', function (d) {
            return d3.select(d.labelNode).node().getBBox().x - 5;
        })
        .attr('y', function (d) {
            return d3.select(d.labelNode).node().getBBox().y - 5;
        });
}

export function createLinks(linksDataBinding) {
    linksDataBinding.enter()
        .append('path')
        .classed('link', true);

    linksDataBinding.exit().remove();
}

export function updateLinks(linksDataBinding, nodes) {
    linksDataBinding
        .attr('class', (link) => {
            // add the link id as a css class for testing purposes
            const idClass = link.id.replaceAll(':', '-');
            return `link ${idClass}`;
        })
        .attr('stroke', setLinkColor)
        .style('stroke-dasharray', setLinkStyle)
        .style("marker-mid", (link) => setArrowLink(link, ARROW_CONFIG.BIG))
        .attr('d', (link) => getLinkCoordinates(link, nodes));
}

export const ARROW_CONFIG = {
    SMALL: {name: 'small', size: 3},
    BIG: {name: 'big', size: 5}
};

export function addArrowHead(svg, config) {
    svg.append("svg:defs").append("svg:marker")
        .attr("id", `arrowhead_${config.name}`)
        .attr("viewBox", `0 0 ${config.size * 2} ${config.size * 2}`)
        .attr("refX", config.size)
        .attr("refY", config.size)
        .attr("markerWidth", config.size)
        .attr("markerHeight", config.size)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", `M 0 0 L ${config.size * 2} ${config.size} L 0 ${config.size * 2} z`)
        .style("fill", "var(--secondary-color)");
}

export function setArrowLink(link, config) {
    if (link.status === LinkState.RECEIVING_SNAPSHOT) {
        return `url(#arrowhead_${config.name})`;
    }
}

export function setLinkColor(link) {
    const linkColor = linkStateColors[link.status];
    return linkColor || 'none';
}

export function setLinkStyle(link) {
    const linkStyle = linkStateStyle[link.status];
    return linkStyle || 'none';
}

function getLinkCoordinates(link, nodes) {
    const source = nodes.find((node) => node.address === link.source);
    const target = nodes.find((node) => node.address === link.target);
    const deltaX = target.x - source.x;
    const deltaY = target.y - source.y;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normX = deltaX / dist;
    const normY = deltaY / dist;
    // Padding from node center point
    const sourcePadding = 55;
    const targetPadding = 55;
    const sourceX = source.x + (sourcePadding * normX);
    const sourceY = source.y + (sourcePadding * normY);
    const targetX = target.x - (targetPadding * normX);
    const targetY = target.y - (targetPadding * normY);
    // Calculate midpoint
    const midpointX = (sourceX + targetX) / 2;
    const midpointY = (sourceY + targetY) / 2;
    // In order to draw an arrowhead in the middle of a line, the line needs to be composed by
    // two segments, otherwise the arrowhead won't show up.
    return 'M' + sourceX + ',' + sourceY + 'L' + midpointX + ',' + midpointY +
        'L' + targetX + ',' + targetY;
}

export function positionNodesOnClusterZone(nodeElements, clusterZoneX, clusterZoneY, clusterZoneRadius) {
    nodeElements
        .attr('transform', (node, index) => {
            // Calculate initial positions for the new nodes based on
            // spreading them evenly on a circle around the center of the page.
            const theta = 2 * Math.PI * index / nodeElements.size();
            const x = clusterZoneX + Math.cos(theta) * clusterZoneRadius;
            const y = clusterZoneY + Math.sin(theta) * clusterZoneRadius;
            node.x = x;
            node.y = y;
            return `translate(${x}, ${y})`;
        });
}

export function createHexagon(nodeGroup, radius) {
    const _s32 = (Math.sqrt(3) / 2);
    const xDiff = 0;
    const yDiff = 0;
    const points = [[radius + xDiff, yDiff], [radius / 2 + xDiff, radius * _s32 + yDiff], [-radius / 2 + xDiff, radius * _s32 + yDiff],
        [-radius + xDiff, yDiff],
        [-radius / 2 + xDiff, -radius * _s32 + yDiff], [radius / 2 + xDiff, -radius * _s32 + yDiff], [radius + xDiff, yDiff],
        [radius / 2 + xDiff, radius * _s32 + yDiff]];
    return nodeGroup
        .selectAll("path.area")
        .data([points])
        .enter()
        .append("path")
        .attr('class', 'node member')
        .attr("stroke-width", "10")
        .attr("stroke-linejoin", "round")
        .attr("d", d3.line());
}

export function removeEventListeners() {
    d3.select(document).selectAll('.node-info-fo').on('.tooltip', null);
}
