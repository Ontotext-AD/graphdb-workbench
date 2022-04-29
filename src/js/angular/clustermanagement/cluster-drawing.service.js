export const clusterColors = {
    ontoOrange: '#ED4F2F',
    ontoBlue: '#04355E',
    ontoGreen: '#0CB0A0',
    ontoGrey: '#97999C'
};

export function createClusterSvgElement(element) {
    return d3.select(element)
        .append('svg');
}

export function createClusterZone(parent, hasCluster) {
    const clusterZone = parent.append('g');
    clusterZone
        .append('g')
        .append("circle")
        .classed('cluster-zone', true)
        .style('fill', 'transparent')
        .style('stroke-width', '2');
    return clusterZone;
}

export function setCreateClusterZone(hasCluster, clusterZone) {
    clusterZone
        .select('.cluster-zone')
        .classed('no-cluster', !hasCluster);

    if (hasCluster) {
        clusterZone.selectAll('#no-cluster-zone').remove();
        clusterZone
            .append('g')
            .attr("id", "cluster-zone")
            .append('text')
            .text('Cluster')
            .attr('y', -50)
            .classed('h2', true)
            .style('text-anchor', "middle");
    } else {
        clusterZone.selectAll('#cluster-zone').remove();

        const textGroup = clusterZone
            .append('g')
            .attr("id", "no-cluster-zone");
        textGroup
            .append('text')
            .text('No cluster group configured')
            .attr('y', -50)
            .classed('h2', true)
            .style('text-anchor', "middle");
        textGroup.append('text')
            .classed('h3', true)
            .text('Click here to create a cluster')
            .style('text-anchor', "middle");
        textGroup.append('text')
            .attr('y', 130)
            .attr('class', 'icon-any repo')
            .attr('fill', clusterColors.ontoOrange)
            .style('text-anchor', "middle")
            .classed('settings-icon', true)
            .text("\ue92b");
    }
}

export function moveElement(element, x, y) {
    element.attr('transform', () => {
        return `translate(${x}, ${y})`;
    });
}
