import {LinkState, NodeState, RecoveryState} from "../controllers/cluster-management.controller";

export const clusterColors = {
    ontoOrange: 'var(--primary-color)',
    ontoBlue: 'var(--secondary-color)',
    ontoGreen: 'var(--tertiary-color)',
    ontoGrey: 'var(--gray-color)'
};

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
        if (hasAccess ){
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
    return nodeUpdateElements
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
            .append('text')
            .attr('y', nodeRadius + 15)
            .attr('class', 'id id-host');

        nodeTextHost
            .append('rect')
            .attr('class', 'node-info-background')
            .attr('rx', 6);

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
        .classed('icon-any', function (d) {
            return !hasRecoveryState(d);
        })
        .classed('fa-d3', hasRecoveryState)
        .text(function (d) {
            if (hasRecoveryState(d)) {
                return getNodeInfoIconType(d);
            } else {
                return getNodeIconType(d);
            }
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
            return '\uf29c';
        case RecoveryState.WAITING_FOR_SNAPSHOT:
            return '\uf017';
        case RecoveryState.RECEIVING_SNAPSHOT:
            return '\uf0ed';
        case RecoveryState.APPLYING_SNAPSHOT:
            return '\uf050';
        case RecoveryState.BUILDING_SNAPSHOT:
            return '\uf187';
        case RecoveryState.SENDING_SNAPSHOT:
            return '\uf0ee';
        default:
            return '';
    }
}

function getNodeIconType(node) {
    if (node.nodeState === NodeState.LEADER) {
        return '\ue935';
    } else if (node.nodeState === NodeState.FOLLOWER) {
        return '\ue963';
    } else if (node.nodeState === NodeState.CANDIDATE) {
        return '\ue914';
    } else if (node.nodeState === NodeState.NO_CONNECTION) {
        return '\ue931';
    } else if (node.nodeState === NodeState.OUT_OF_SYNC) {
        return '\ue920';
    } else if (node.nodeState === NodeState.READ_ONLY) {
        return '\ue95c';
    } else if (node.nodeState === NodeState.RESTRICTED) {
        return '\ue933';
    }
    return '';
}

function updateNodesInfoText(nodes) {
    nodes
        .select('.node-info-text')
        .each(function (d) {
            d.infoNode = this;
        })
        .text(function (d) {
            return d.recoveryStatus && d.recoveryStatus.message;
        });

    // Add padding styling to text background. left/right/top/bottom +5
    nodes
        .select('.node-info-background')
        .attr('width', function (d) {
            return d3.select(d.infoNode).node().getBBox().width + 10;
        })
        .attr('height', function (d) {
            return d3.select(d.infoNode).node().getBBox().height + 10;
        })
        .attr('x', function (d) {
            return d3.select(d.infoNode).node().getBBox().x - 5;
        })
        .attr('y', function (d) {
            return d3.select(d.infoNode).node().getBBox().y - 5;
        })
        .classed('hidden', function (d) {
            return _.isEmpty(d.recoveryStatus);
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
