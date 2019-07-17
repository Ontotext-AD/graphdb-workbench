define([],
    function () {
        angular
            .module('graphdb.framework.graphexplore.directives.dependencies', ['graphdb.framework.graphexplore.controllers.dependencies'])
            .directive('dependenciesChord', dependenciesChordDirective);

        dependenciesChordDirective.$inject = ['$rootScope', '$location', '$window', '$timeout', '$repositories', '$http', 'toastr', '$filter'];

        function dependenciesChordDirective($rootScope, $location, $window, $timeout, $repositories, $http, toastr, $filter) {
            return {
                restrict: 'A',
                template: '<div id="dependencies-chord"></div>',
                scope: {
                    dependenciesData: '='
                },
                link: linkFunc
            };

            function linkFunc(scope, element, attrs) {
                // Used http://bost.ocks.org/mike/uberdata/

                var drawChord = function (matrix, nodes, direction) {

                    var fill = d3.scale.category20();

                    var tooltip = d3.select("body").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);
                    d3.select("body").on("click", function () {
                        tooltip.style("opacity", 0);
                    });

                    var width = 800,
                        height = 800,
                        outerRadius = Math.min(width, height) / 2.8,
                        innerRadius = outerRadius - 24;

                    var arc = d3.svg.arc()
                        .innerRadius(innerRadius)
                        .outerRadius(outerRadius);

                    var layout = d3.layout.chord()
                        .padding(.04)
                        .sortSubgroups(d3.descending)
                        .sortChords(d3.ascending);

                    var path = d3.svg.chord()
                        .radius(innerRadius);

                    var svg = d3.select("#dependencies-chord").append("svg")
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
                    layout.matrix(matrix);

                    // Add a group per neighborhood.
                    var group = svg.selectAll(".group")
                        .data(layout.groups)
                        .enter().append("g")
                        .attr("class", "group")
                        .on("mouseover", mouseover);

                    // Add a mouseover title.
                    group.append("title").text(function (d, i) {
                        return nodes[i];
                    });

                    // Add the group arc.
                    var groupPath = group.append("path")
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
                    var chord = svg.selectAll(".chord")
                        .data(layout.chords)
                        .enter().append("path")
                        .attr("class", "chord")
                        .style("fill", function (d) {
                            return fill(d.target.index)
                        })
                        .style("fill-opacity", ".67")
                        .style("stroke", "#000")
                        .style("stroke-width", ".25px")
                        .style("cursor", "pointer")
                        .attr("d", path);

                    chord.on("mouseover", function (d) {
                        d3.select(this).style({"fill-opacity": "1"});
                    });

                    chord.on("mouseout", function (d) {
                        d3.select(this).style({"fill-opacity": ".67"});
                    });

                    chord.on("click", function (d) {
                        var sourceClass = nodes[d.source.index];
                        var destinationClass = nodes[d.target.index];
                        var px = d3.event.pageX;
                        var py = d3.event.pageY;
                        $http.get("rest/dependencies/predicates", {
                            params: {
                                "from": sourceClass,
                                "to": destinationClass,
                                "mode": "all"
                            }
                        })
                            .success(function (predicatesData) {
                                var directionIcon = " <i class='fa fa-exchange'></i> ";
                                var header = "<div class='row'>" + sourceClass + directionIcon + destinationClass + "</div>";
                                var predicatesList = _.map(predicatesData.slice(0, 10), function (p) {
                                    var icon = " <i class='fa fa-long-arrow-" + (p.direction == "out" ? "right" : "left") + "'></i>";
                                    return "<div class='row'>" + p.predicate + " : " + p.weight + icon + " </div>";
                                }).join("");
                                var tooltipContent = "<div class='dependencies-tooltip'>" + header + predicatesList;
                                if (predicatesData.length > 10) {
                                    tooltipContent = tooltipContent + "<div class='pull-right'>And " + (predicatesData.length - 10).toString() + " more...</div></div>"
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

                    // Add an elaborate mouseover title for each chord.
//                    chord.append("title").text(function (d) {
//                        return nodes[d.source.index]
//                            + " → " + nodes[d.target.index]
//                            + ": " + d.source.value
//                            + "\n" + nodes[d.target.index]
//                            + " → " + nodes[d.source.index]
//                            + ": " + $filter('number')(d.target.value);
//                    });


                    function mouseover(d, i) {
                        chord.classed("fade", function (p) {
                            return p.source.index != i
                                && p.target.index != i;
                        });
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
                        var imgSrc = SVG.Export.generateBase64ImageSource();

                        // set the binary image and a name for the downloadable file on the export button
                        d3.select(this).attr({
                            href: imgSrc,
                            download: "dependencies-" + $repositories.getActiveRepository() + ".svg"
                        });
                    }

                    d3.select("#download-svg")
                        .on("mouseover", prepareForSVGImageExport);
                };

                scope.$watch('dependenciesData', function () {
                    if (scope.dependenciesData) {
                        var data = scope.dependenciesData;
                        drawChord(data.matrix, data.nodes, data.direction);
                    }
                });
            }

        }
    });