import {LinkState, NodeState, RecoveryState} from "../controllers/cluster-management.controller";

export const clusterColors = {
    ontoOrange: 'var(--primary-color)',
    ontoBlue: 'var(--secondary-color)',
    ontoGreen: 'var(--tertiary-color)',
    ontoGrey: 'var(--gray-color)'
};

export const font = {
    FONT_AWESOME: 'FONT_AWESOME',
    ICOMOON: 'ICOMOON'
};

export const shortMessageLimit = 40;

export function createClusterSvgElement(element) {
    return d3.select(element)
        .append('svg');
}

export function createClusterZone(parent) {
    const clusterZone = parent.append('g');
    clusterZone
        .append("circle")
        .classed('cluster-zone', true)
        .style('fill', 'transparent')
        .style('stroke-width', '2');
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

    addHostnameToNodes(nodeGroup, nodeRadius, isLegend);
    return nodeUpdateElements;
}

function addHostnameToNodes(nodeElements, nodeRadius, isLegend) {
    const nodeTextHost = nodeElements.append('g');

    if (isLegend) {
        nodeTextHost.append('foreignObject')
            .attr('y', nodeRadius)
            .attr('x', -nodeRadius)
            .attr('width', nodeRadius * 2)
            .attr('height', 10)
            .attr('class', 'label-wrapper')
            .append('xhtml:div')
            .attr('class', 'id id-host');
    } else {
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
            .attr('y', nodeRadius + 15)
            .attr('class', 'id id-host');

        nodeTextHost
            .append('text')
            .attr('y', nodeRadius + 45)
            .attr('class', 'node-info-text');
    }
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
    return !_.isEmpty(node.recoveryStatus);
}

function getNodeInfoIconType(node) {
    if (_.isEmpty(node.recoveryStatus)) {
        return '';
    }

    switch (node.recoveryStatus.state) {
        case RecoveryState.SEARCHING_FOR_NODE:
            return {icon: '\uf29c', font: font.FONT_AWESOME};
        case RecoveryState.WAITING_FOR_SNAPSHOT:
            return {icon: '\uf017', font: font.FONT_AWESOME};
        case RecoveryState.RECEIVING_SNAPSHOT:
            return {icon: '\uf0ed', font: font.FONT_AWESOME};
        case RecoveryState.APPLYING_SNAPSHOT:
            return {icon: '\uf050', font: font.FONT_AWESOME};
        case RecoveryState.BUILDING_SNAPSHOT:
            return {icon: '\uf187', font: font.FONT_AWESOME};
        case RecoveryState.SENDING_SNAPSHOT:
            return {icon: '\uf0ee', font: font.FONT_AWESOME};
        case RecoveryState.RECOVERY_OPERATION_FAILURE_WARNING:
            return {icon: '\ue920', font: font.ICOMOON};
        default:
            return {icon: '', font: ''};
    }
}

function getNodeIconType(node) {
    if (node.nodeState === NodeState.LEADER) {
        return {icon: '\ue935', font: font.ICOMOON};
    } else if (node.nodeState === NodeState.FOLLOWER) {
        return {icon: '\ue963', font: font.ICOMOON};
    } else if (node.nodeState === NodeState.CANDIDATE) {
        return {icon: '\ue914', font: font.ICOMOON};
    } else if (node.nodeState === NodeState.NO_CONNECTION) {
        return {icon: '\ue931', font: font.ICOMOON};
    } else if (node.nodeState === NodeState.OUT_OF_SYNC) {
        return {icon: '\ue920', font: font.ICOMOON};
    } else if (node.nodeState === NodeState.READ_ONLY) {
        return {icon: '\ue95c', font: font.ICOMOON};
    } else if (node.nodeState === NodeState.RESTRICTED) {
        return {icon: '\ue933', font: font.ICOMOON};
    }
    return {icon: '', font: ''};
}

function updateNodesInfoText(nodes) {
    let objectHeight;
    let objectWidth;
    nodes.select('.node-info-text')
        .each(function (d) {
            d.infoNode = this;
        })
        .select(function () {
            return this.parentNode;
        })
        .append('foreignObject')
        .attr('width', function (d) {
            if (_.isEmpty(d.recoveryStatus)) {
                return 0;
            }
            const shortMessage = extractShortMessageFromNode(d);
            const rect = calculateElementSizeByText(shortMessage);
            objectHeight = rect.height;
            objectWidth = rect.width;
            return objectWidth;
        })
        .attr('height', function (d) {
            if (_.isEmpty(d.recoveryStatus)) {
                return 0;
            }
            return objectHeight;
        })
        .attr('x', function (d) {
            return - (objectWidth / 2);
        })
        .attr('y', function (d) {
            return 78;
        })
        .classed('hidden', function (d) {
            return _.isEmpty(d.recoveryStatus);
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

    addEventListeners(nodes);
}

function extractShortMessageFromNode(node) {
    return node.recoveryStatus.message && node.recoveryStatus.message.length > shortMessageLimit ?
        node.recoveryStatus.message.substring(0, shortMessageLimit) + '...' : node.recoveryStatus.message;
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

function addEventListeners(nodes) {
    nodes.select('.node-info-fo')
        .on('click', null)
        .on('click', function (event, d) {
            event.preventDefault();
            event.stopPropagation();
            const message = extractShortMessageFromNode(d);
            const object = d3.select(this);
            const isShorten = d.recoveryStatus.message && d.recoveryStatus.message.length > shortMessageLimit && object.text() !== d.recoveryStatus.message;

            let width;
            if (isShorten) {
                width = calculateElementSizeByText(d.recoveryStatus.message).width;
            } else {
                width = calculateElementSizeByText(message).width;
            }

            object
                .attr('width', function (d) {
                    return width;
                })
                .attr('x', function (d) {
                    return - (width / 2);
                })
                .html(`<div>${isShorten ? d.recoveryStatus.message : message}</div>`);
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
        .attr('stroke', setLinkColor)
        .style('stroke-dasharray', setLinkStyle)
        .attr('d', (link) => getLinkCoordinates(link, nodes));
}

export function setLinkColor(link) {
    if (link.status === LinkState.IN_SYNC || link.status === LinkState.SYNCING) {
        return clusterColors.ontoGreen;
    } else if (link.status === LinkState.OUT_OF_SYNC) {
        return clusterColors.ontoGrey;
    }
    return 'none';
}

export function setLinkStyle(link) {
    if (link.status === LinkState.OUT_OF_SYNC || link.status === LinkState.SYNCING) {
        return '10 10';
    }
    return 'none';
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
    return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
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

function createHexagon(nodeGroup, radius) {
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
        .attr("d", d3.line());
}
