import SVG from 'lib/common/svg-export';
import 'angular/rest/graph-data.rest.service';

angular
    .module('graphdb.framework.graphexplore.directives.dependencies', [
        'graphdb.framework.graphexplore.controllers.dependencies',
        'graphdb.framework.rest.graphexplore.data.service'
    ])
    .directive('dependenciesChord', dependenciesChordDirective);

dependenciesChordDirective.$inject = ['$repositories', 'GraphDataRestService'];

function dependenciesChordDirective($repositories, GraphDataRestService) {
    return {
        restrict: 'A',
        template: '<div id="dependencies-chord"></div>',
        scope: {
            dependenciesData: '='
        },
        link: linkFunc
    };

    function linkFunc(scope) {
        // Used http://bost.ocks.org/mike/uberdata/

        const drawChord = function (matrix, nodes) {

            // Don't try to draw chord for zero matrix
            if (isZeroMatrix()) {
                return;
            }

            const fill = d3.scaleOrdinal(d3.schemeCategory10);

            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
            d3.select("body").on("click", function () {
                tooltip.style("opacity", 0);
            });

            const width = 800;
            const height = 800;
            const outerRadius = Math.min(width, height) / 2.8;
            const innerRadius = outerRadius - 24;

            const arc = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);

            const chordGraph = d3.chord()
                .padAngle(.04)
                .sortSubgroups(d3.descending)
                .sortChords(d3.ascending);

            const path = d3.ribbon()
                .radius(innerRadius);

            const svg = d3.select("#dependencies-chord").append("svg")
                .attr("viewBox", "0 0 " + width + " " + height)
                .attr("preserveAspectRatio", "xMidYMid meet")
                .style("font", "10px sans-serif")
                .append("g")
                .attr("id", "circle")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            svg.append("circle")
                .attr("r", outerRadius)
                .style("fill", "none");

            // Compute the chord layout.
            const layout = chordGraph(matrix);

            // Add a group per neighborhood.
            const group = svg.selectAll(".group")
                .data(layout.groups)
                .enter().append("g")
                .attr("class", "group")
                .on("mouseover", mouseover);

            // Add a mouseover title.
            group.append("title").text(function (d, i) {
                return nodes[i];
            });

            // Add the group arc.
            group.append("path")
                .attr("id", function (d, i) {
                    return "group" + i;
                })
                .attr("d", arc)
                .style("fill", function (d, i) {
                    return fill(i);
                });

            group.append("text")
                .each(function (d) {
                    d.angle = (d.startAngle + d.endAngle) / 2;
                })
                .attr("dy", ".35em")
                .attr("transform", function (d) {
                    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                        + "translate(" + (innerRadius + 26) + ")"
                        + (d.angle > Math.PI ? "rotate(180)" : "");
                })
                .style("text-anchor", function (d) {
                    return d.angle > Math.PI ? "end" : null;
                })
                .text(function (d) {
                    return nodes[d.index];
                });

            // Add the chords.
            const chord = svg.selectAll(".chord")
                .data(layout)
                .enter().append("path")
                .attr("class", "chord")
                .style("fill", function (d) {
                    return fill(d.target.index);
                })
                .style("fill-opacity", ".67")
                .style("stroke", "#000")
                .style("stroke-width", ".25px")
                .style("cursor", "pointer")
                .attr("d", path);

            chord.on("mouseover", function () {
                d3.select(this).style("fill-opacity", "1");
            });

            chord.on("mouseout", function () {
                d3.select(this).style("fill-opacity", ".67");
            });

            chord.on("click", function (event, d) {
                const sourceClass = nodes[d.source.index];
                const destinationClass = nodes[d.target.index];
                const px = event.pageX;
                const py = event.pageY;

                GraphDataRestService.getPredicates(sourceClass, destinationClass, scope.selectedGraph && scope.selectedGraph.contextID.uri)
                    .success(function (predicatesData) {
                        const directionIcon = " <i class='fa fa-exchange'></i> ";
                        const header = "<div class='row'>" + sourceClass + directionIcon + destinationClass + "</div>";
                        const predicatesList = _.map(predicatesData.slice(0, 10), function (p) {
                            const icon = " <i class='fa fa-long-arrow-" + (p.direction === "out" ? "right" : "left") + "'></i>";
                            return "<div class='row'>" + p.predicate + " : " + p.weight + icon + " </div>";
                        }).join("");

                        let tooltipContent = "<div class='dependencies-tooltip'>" + header + predicatesList;
                        if (predicatesData.length > 10) {
                            tooltipContent = tooltipContent + "<div class='pull-right'>And " + (predicatesData.length - 10).toString() + " more...</div></div>";
                        } else {
                            tooltipContent = tooltipContent + "</div>";
                        }
                        tooltip.html(tooltipContent)
                            .style("left", (px) + "px").style("top", (py) + "px");
                    });

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
            });

            function mouseover() {
                const nodes = group.nodes();
                const i = nodes.indexOf(this);
                chord.classed("fade", function (p) {
                    return p.source.index !== i
                        && p.target.index !== i;
                });
            }

            /**
             *  Checks if all values of the returned matrix are zero
             * @returns false if non zero value is found, true otherwise
             */
            function isZeroMatrix() {
                let zeroMatrix = true;

                for (const arr of matrix) {
                    const nonZeroFound = arr.some(item => item !== 0);
                    if (nonZeroFound) {
                        zeroMatrix = false;
                        break;
                    }
                }

                return zeroMatrix;
            }

            d3.select("#circle").on("mouseleave", function () {
                svg.selectAll(".chord").classed("fade", false);
            });

            /*
             * Prepares SVG document image export by adding xml namespaces and
             * additional style information
             */
            function prepareForSVGImageExport() {
                // convert selected html to base64
                const imgSrc = SVG.Export.generateBase64ImageSource('.dependencies-chord svg');
                // set the binary image and a name for the downloadable file on the export button
                d3.select(this).attrs({
                    href: imgSrc,
                    download: "dependencies-" + $repositories.getActiveRepository() + ".svg"
                });
            }

            d3.select("#download-svg")
                .on("mouseover", prepareForSVGImageExport);
        };

        scope.$watch('dependenciesData', function () {
            if (scope.dependenciesData) {
                const data = scope.dependenciesData;
                drawChord(data.matrix, data.nodes, data.direction);
            }
        });
    }

}
