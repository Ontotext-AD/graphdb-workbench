import SVG from 'lib/common/svg-export';
import D3 from 'lib/common/d3-utils';
import 'angular/utils/local-storage-adapter';

angular
    .module('graphdb.framework.graphexplore.directives.domainrange', [
        'graphdb.framework.graphexplore.controllers.domainrange',
        'graphdb.framework.utils.localstorageadapter'
    ])
    .constant('ONTO_RED', 'var(--primary-color)')
    .constant('ONTO_GREEN', 'var(--tertiary-color)')
    .constant('ONTO_BLUE', 'var(--secondary-color)')
    .constant('NON_COLLAPSED_REFLEXIVE_LINK_LIMIT', 6)
    .directive('domainRangeGraph', domainRangeGraphDirective);

domainRangeGraphDirective.$inject = ['$rootScope', '$window', '$repositories', 'GraphDataRestService', '$location', 'LocalStorageAdapter', 'LSKeys', '$timeout', 'toastr', 'ONTO_RED', 'ONTO_GREEN', 'ONTO_BLUE', 'NON_COLLAPSED_REFLEXIVE_LINK_LIMIT'];

function domainRangeGraphDirective($rootScope, $window, $repositories, GraphDataRestService, $location, LocalStorageAdapter, LSKeys, $timeout, toastr, ONTO_RED, ONTO_GREEN, ONTO_BLUE, NON_COLLAPSED_REFLEXIVE_LINK_LIMIT) {
    return {
        restrict: 'AE',
        template: '<div id="domain-range"></div>',
        scope: {
            showPredicatesInfoPanel: '=',
            selectedPredicate: '=',
            collapseEdges: '='
        },
        link: linkFunc
    };

    function linkFunc(scope) {
        const timer = $timeout(function () {
            renderDomainRangeGraph(scope);
        }, 50);

        scope.$on("$destroy", function () {
            $timeout.cancel(timer);
        });
    }

    function renderDomainRangeGraph(scope) {
        d3.selection.prototype.moveToFront = function () {
            return this.each(function () {
                d3.select(this.parentNode.appendChild(this));
            });
        };

        d3.selection.prototype.moveToBack = function () {
            return this.each(function () {
                const firstChild = this.parentNode.firstChild;
                if (firstChild) {
                    this.parentNode.insertBefore(this, firstChild);
                }
            });
        };

        var width = 1200,
            height = 600;

        var mainClassSize = width / 18,
            otherClassSize = width / 110,
            datatypeSize = otherClassSize / 2,
            labelFontSize = width / 90,
            basicArrowStrokeWidth = width / 1000,
            collapsedArrowStrokeWidth = width / 600;


        var force = d3.layout.force()
            .size([width, height])
            .charge(-900);

        var drag = force.drag()
            .on("dragstart", dragstart);

        var svg = d3.select("#domain-range")
            .append("svg")
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .on("dblclick.zoom", null);

        var defs = svg.append("defs");

        defs.append("marker")
            .attr({
                id: "arrow",
                viewBox: "0 -5 10 10",
                refX: 10,
                refY: 0,
                markerUnits: "strokeWidth",
                markerWidth: 5,
                markerHeight: 5,
                orient: "auto",
                fill: ONTO_BLUE
            })
            .append("path")
            .attr({
                d: "M0,-5L10,0L0,5",
                class: "arrowHead"
            });

        defs.append("marker")
            .attr({
                id: "collapsed-arrow",
                viewBox: "0 -5 10 10",
                refX: 9,
                refY: 0,
                markerUnits: "strokeWidth",
                markerWidth: 4,
                markerHeight: 4,
                orient: "auto",
                fill: ONTO_BLUE
            })
            .append("path")
            .attr({
                d: "M0,-5L10,0L0,5",
                class: "arrowHead"
            });

        defs.append("marker")
            .attr({
                id: "arrow-loop",
                viewBox: "0 -5 10 10",
                refX: 7,
                refY: 0,
                markerUnits: "strokeWidth",
                markerWidth: 5,
                markerHeight: 5,
                orient: "auto",
                fill: ONTO_BLUE
            })
            .append("path")
            .attr({
                d: "M0,-5L10,0L0,5",
                class: "arrowHead"
            });

        /*
         * Prepares SVG document image export by adding xml namespaces and
         * additional style information
         */
        function prepareForSVGImageExport() {
            // get css rules for the diagram
            var cssRules = SVG.Export.getCSSRules("css/domain-range-graph.css?v=[AIV]{version}[/AIV]");

            // inline css rules in a defs tag
            $("defs").append('<style type="text/css"><![CDATA[' + cssRules + ']]></style>');

            // convert selected html to base64
            var imgSrc = SVG.Export.generateBase64ImageSource("#domain-range svg");

            // set the binary image and a name for the downloadable file on the export button
            d3.select(this).attr({
                href: imgSrc,
                download: "domain-range-graph-" + $repositories.getActiveRepository() + ".svg"
            });
        }

        d3.select("#download-svg")
            .on("mouseover", prepareForSVGImageExport);

        // start of code for legend
        var legendBackgroundWidth = width / 7;
        var legendBackgroundHeight = legendBackgroundWidth * 1.2;

        var svgLegend = d3.select(".legend-container")
            .append("svg")
            .attr("viewBox", "0 0 " + legendBackgroundWidth + " " + legendBackgroundHeight)
            .attr("preserveAspectRatio", "xMidYMid meet");

        var legendCellGroup = svgLegend;

        legendCellGroup.append("rect")
            .attr({
                width: legendBackgroundWidth,
                height: legendBackgroundHeight
            })
            .style("fill", "rgba(235, 235, 235, 0.9)");

        var sourceX = width / 75;
        var sourceY = width / 40;
        var targetX = sourceX + mainClassSize / 2.5;
        var targetY = sourceY;

        var legendTextX = targetX + width / 90;
        var legendLabelFontSize = labelFontSize / 1.1;

        var classNodeY = sourceY;
        var legendClassNode = legendCellGroup
            .append("circle")
            .attr({
                class: "legend-class-node",
                cx: (sourceX + targetX) / 2,
                cy: classNodeY,
                r: mainClassSize / 4.5
            });

        var classNodeTextY = targetY + width / 370;
        legendCellGroup
            .append("text")
            .attr({
                x: legendTextX,
                y: classNodeTextY
            })
            .style('font-size', legendLabelFontSize + 'px')
            .text("main class node");

        var objectNodeY = classNodeY + width / 30;
        legendCellGroup
            .append("circle")
            .attr({
                class: "legend-object-node",
                cx: (sourceX + targetX) / 2,
                cy: objectNodeY,
                r: otherClassSize / 1.25
            });

        var objectNodeTextY = classNodeTextY + width / 30;
        legendCellGroup
            .append("text")
            .attr({
                x: legendTextX,
                y: objectNodeTextY
            })
            .style('font-size', legendLabelFontSize + 'px')
            .text("class node");

        var datatypeNodeY = objectNodeY + width / 45;
        legendCellGroup
            .append("circle")
            .attr({
                class: "legend-datatype-node",
                cx: (sourceX + targetX) / 2,
                cy: datatypeNodeY,
                r: datatypeSize
            });

        var datatypeNodeTextY = objectNodeTextY + width / 45;
        legendCellGroup
            .append("text")
            .attr({
                x: legendTextX,
                y: datatypeNodeTextY
            })
            .style('font-size', legendLabelFontSize + 'px')
            .text("datatype node");

        var basicPropertyArrowY = datatypeNodeY + width / 45;
        var classNodeSel = d3.select('.legend-class-node');
        legendCellGroup
            .append("line")
            .attr({
                class: "property-arrow",
                x1: sourceX,
                y1: basicPropertyArrowY,
                x2: targetX,
                y2: basicPropertyArrowY
            })
            .style("stroke-width", basicArrowStrokeWidth)
            .attr("marker-end", "url(" + $location.absUrl() + "#arrow)");

        legendCellGroup
            .append("text")
            .attr({
                x: legendTextX,
                y: basicPropertyArrowY + (width / 370)
            })
            .style('font-size', legendLabelFontSize + 'px')
            .text("explicit property");

        var implicitPropArrowY = basicPropertyArrowY + width / 45;
        legendCellGroup
            .append("line")
            .attr({
                class: "implicit-property-arrow",
                x1: sourceX,
                y1: implicitPropArrowY,
                x2: targetX,
                y2: implicitPropArrowY
            })
            .style("stroke-width", basicArrowStrokeWidth)
            .attr("marker-end", "url(" + $location.absUrl() + "#arrow)");

        legendCellGroup
            .append("text")
            .attr({
                x: legendTextX,
                y: implicitPropArrowY + (width / 370)
            })
            .style('font-size', legendLabelFontSize + 'px')
            .text("implicit property");

        var collapsedPropArrowY = implicitPropArrowY + width / 45;
        legendCellGroup
            .append("line")
            .attr({
                class: "collapsed-property-arrow",
                x1: sourceX,
                y1: collapsedPropArrowY,
                x2: targetX,
                y2: collapsedPropArrowY
            })
            .style("stroke-width", collapsedArrowStrokeWidth)
            .attr("marker-end", "url(" + $location.absUrl() + "#collapsed-arrow)");

        legendCellGroup
            .append("text")
            .attr({
                x: legendTextX,
                y: collapsedPropArrowY + (width / 370)
            })
            .style('font-size', legendLabelFontSize + 'px')
            .text("collapsed property");
        // end of code for legend

        // there doesn't seem to be a need for a separate group
        var g = svg; //svg.append("g");

        var selectedRdfUri = $location.search().uri;
        var classNodeLabel = $location.search().name;
        var collapsed = $location.search().collapsed;

        GraphDataRestService.getDomainRangeData(selectedRdfUri, collapsed)
            .success(function (response, status, headers) {
                scope.domainRangeGraphData = response;
            }).error(function (response) {
            toastr.error("Request for " + classNodeLabel + " failed!");
        });

        function switchEdgeMode(collapsed) {
            $rootScope.$broadcast('switchEdgeMode', {
                uri: selectedRdfUri,
                name: classNodeLabel,
                collapsed: collapsed
            });
        }

        // intercept back button press and set action to local storage
        $(window).on('popstate', function () {
            LocalStorageAdapter.set(LSKeys.DOMAIN_RANGE_WENT_BACK, true);
        });

        $window.onpopstate = function (event) {
            if (event.state) {
                $rootScope.$broadcast("changeCollapsedEdgesState", event.state.collapsed);
            }
        };

        scope.$watch('collapseEdges', function () {
            if (!angular.isUndefined(scope.collapseEdges)) {
                LocalStorageAdapter.set(LSKeys.DOMAIN_RANGE_COLLAPSE_EDGES, scope.collapseEdges);

                // if the back button has not been pressed, then switch to collapsed or non collapsed mode
                // otherwise skip, because back button will not function properly and will not pop the entire
                // history stack
                if (LocalStorageAdapter.get(LSKeys.DOMAIN_RANGE_WENT_BACK) !== "true") {
                    switchEdgeMode(scope.collapseEdges);
                }

                // after back button status has been checked, remove the action from local storage in order
                // to be clean for next check
                LocalStorageAdapter.remove(LSKeys.DOMAIN_RANGE_WENT_BACK);
            }
        });

        scope.$watch('domainRangeGraphData', function () {
            if (scope.domainRangeGraphData) {
                var graph = angular.copy(scope.domainRangeGraphData);

                force
                    .nodes(graph.nodes)
                    .links(graph.links);

                var linkGroup = g.selectAll(".link")
                    .data(graph.links)
                    .enter()
                    .append("g");

                function styleArrowsInCollapsedMode(sel) {
                    sel.style("stroke", ONTO_BLUE);
                    sel.style("stroke-width", collapsedArrowStrokeWidth);
                    sel.attr("marker-end", "url(" + $location.absUrl() + "#collapsed-arrow)");
                }

                var link,
                    loopLink,
                    loopLinkEdgeCount = 0;


                linkGroup
                    .each(function (d) {
                        if (d.objectPropNodeClassUri !== selectedRdfUri) {
                            link = linkGroup
                                .append("line")
                                .attr({
                                    class: "link",
                                    // absolute url needed because angular inserts a <base> tag
                                    "marker-end": "url(" + $location.absUrl() + "#arrow)"
                                })
                                .style("stroke-width", basicArrowStrokeWidth)
                                .each(function (d) {
                                    switch (d.propertyType) {
                                        case "objectLeft":
                                            d.targetRadius = mainClassSize;
                                            break;
                                        case "objectRight":
                                            d.targetRadius = otherClassSize;
                                            break;
                                        case "datatype":
                                            d.targetRadius = datatypeSize;
                                            break;
                                        default:
                                            d.targetRadius = 0;
                                    }
                                    var sel = d3.select(this);
                                    if (d.targetNodeEdgeCount > 1) {
                                        styleArrowsInCollapsedMode(sel);
                                    } else if (d.implicit) {
                                        sel.style("stroke-dasharray", "3, 3");
                                    }
                                });
                        } else {
                            if (angular.isUndefined(loopLink)) {
                                var loopLinkSize = mainClassSize / 2;
                                loopLink = d3.select(this)
                                    .append("path")
                                    .attr({
                                        d: "M 0 0 A " + loopLinkSize + " " + loopLinkSize + " 0 1 1 0 " + loopLinkSize,
                                        class: "loop-link",
                                        fill: "none",
                                        "marker-end": "url(" + $location.absUrl() + "#arrow-loop)"
                                    })
                                    .style("stroke-width", basicArrowStrokeWidth);
                            }

                            loopLinkEdgeCount += d.targetNodeEdgeCount;
                            if (loopLinkEdgeCount > 1) {
                                styleArrowsInCollapsedMode(d3.select(".loop-link"));
                            }
                        }
                    });

                var previousPropertyNameSelection = {};

                function disableCollapsedPredicateLabelHightlighting() {
                    if (!$.isEmptyObject(previousPropertyNameSelection)) {
                        previousPropertyNameSelection.text.style("fill", "black");
                        previousPropertyNameSelection.background.style("fill", "#f0f0f0");
                    }
                }

                // when clicking anywhere else but the collapsed labels disable highlighting
                // of the currently selected one
                $("document").ready(function () {
                    $("#domain-range").bind("click", disableCollapsedPredicateLabelHightlighting);
                });

                function onCollapsedPropertyNameClick(d) {
                    disableCollapsedPredicateLabelHightlighting();
                    previousPropertyNameSelection.text = d3.select(this);

                    previousPropertyNameSelection.background = d3.select(this.previousSibling);
                    previousPropertyNameSelection.text.style("fill", "white");

                    previousPropertyNameSelection.background.style("fill", ONTO_BLUE);
                    $timeout(function () {
                        scope.showPredicatesInfoPanel = true;
                        scope.selectedPredicate = d;
                    });
                    d3.event.stopPropagation();
                }


                var propertyNames = linkGroup
                    .append("text")
                    .attr("class", function (d) {
                        return d.objectPropNodeClassUri === selectedRdfUri ? "loop-link-property-name" : "property-name";
                    })
                    .attr("dx", function (d) {
                        // offset text more towards the main class
                        return mainClassSize / 2 * (d.propertyType === "objectLeft" ? 1 : -1);
                    })
                    .style("text-anchor", function (d) {
                        return d.propertyType === "objectLeft" ? "end" : "start";
                    })
                    .style("font-size", labelFontSize)
                    .text(function (d) {
                        return d.targetNodeEdgeCount > 1 ? d.targetNodeEdgeCount + " predicates" : d.name;
                    });


                propertyNames
                    .each(function (d) {
                        var sel = d3.select(this);
                        var isCompoundEdge = /\d\spredicates/.test(sel.text());

                        // handle collapsed predicates by making their font bold, make them highlight when clicked
                        // and make them trigger the side panel to display the collapsed edges
                        if (isCompoundEdge) {
                            sel
                                .style("font-weight", "bold")
                                .on("click", onCollapsedPropertyNameClick);
                        } else {
                            // for regular predicate labels just attach a link to the "Resources" view
                            // for more helpful information regarding them
                            sel.on("click", function (d) {
                                $window.open("resource?uri=" + encodeURIComponent(d.uri), "_blank");
                            });
                        }
                    });
                var textPadding = width / 600;


                var linkRect = linkGroup
                    .append("rect")
                    .attr("class", function (d) {
                        return d.objectPropNodeClassUri !== selectedRdfUri ? "link-background" : "loop-link-background"
                    })
                    .attr("width", function (d) {
                        d.calculatedWidth = this.previousSibling.getBBox().width;
                        return d.calculatedWidth + textPadding * 2;
                    })
                    .attr("height", function (d) {
                        d.calculatedHeight = this.previousSibling.getBBox().height;
                        return d.calculatedHeight + textPadding;
                    })
                    .attr("transform", function (d) {
                        // offset rect by the same amount as text (besides the padding)
                        var translateX = textPadding - mainClassSize / 2 * (d.propertyType === "objectLeft" ? 1 : -1);
                        if (d.propertyType === "objectLeft") {
                            translateX += d.calculatedWidth;
                        }
                        return "translate(-" + translateX + ",-" + (textPadding + d.calculatedHeight / 2) + ")";
                    })
                    .on("click", function (d) {
                        d3.event.stopPropagation();
                    });


                var nodeGroup = g.selectAll(".node")
                    .data(graph.nodes)
                    .enter()
                    .append("g");

                var node = nodeGroup
                    .filter(function (d) {
                        return d.objectPropClassUri !== selectedRdfUri;
                    })
                    .append("circle")
                    .each(function (d) {
                        var sel = d3.select(this);
                        if (d.classPosition === "main") {
                            sel.attr({
                                class: "class-node",
                                r: mainClassSize
                            })
                                .attr("marker-end", "url(" + $location.absUrl() + "#loop-link)");
                        } else if (d.objectPropClassName === null) {
                            sel.attr({
                                class: "datatype-node",
                                r: datatypeSize
                            });
                        } else {
                            sel.attr({
                                class: "object-prop-node",
                                r: otherClassSize
                            });
                        }
                    })
                    .call(drag);


                function reloadDomainRangeGraphView(d, collapsed) {
                    scope.$apply(function () {
                        $rootScope.$broadcast('reloadDomainRangeGraphView', d, collapsed);
                    });
                }

                d3.selectAll(".object-prop-node")
                    .on("dblclick", reloadDomainRangeGraphView);


                nodeGroup
                    .filter(function (d) {
                        return d.objectPropClassName && d.objectPropClassUri !== selectedRdfUri;
                    })
                    .append("text")
                    .attr("class", function (d) {
                        return d.classPosition + "-class-label";
                    })
                    .style("font-size", labelFontSize)
                    .text(function (d) {
                        return d.objectPropClassName;
                    })
                    .on("click", function (d) {
                        $window.open("resource?uri=" + encodeURIComponent(d.objectPropClassUri), "_blank");
                    });

                var objectPropClassName = nodeGroup.select("text");

                g.select(".class-node")
                    .each(function () {
                        d3.select(this.parentNode)
                            .append("text")
                            .attr("class", "rdf-class-label")
                            .style("font-size", function (d) {
                                return D3.Text.calcFontSize(classNodeLabel, mainClassSize)
                            })
                            .text(classNodeLabel)
                            .on("click", function (d) {
                                $window.open("resource?uri=" + encodeURIComponent(selectedRdfUri), "_blank");
                            });
                    });


                var rdfClassName = g.select(".class-node + text"),
                    classNode = d3.select(".class-node"),
                    loopLinkBackgroundSel = d3.selectAll(".loop-link-background"),
                    loopLinkPropertyName = d3.selectAll(".loop-link-property-name");

                propertyNames = d3.selectAll(".property-name");

                if (!angular.isUndefined(loopLink)) {
                    var loopLinkBackgroundProps = [];

                    loopLinkBackgroundSel.each(function (d, i) {
                        var sel = d3.select(this);
                        loopLinkBackgroundProps.push({
                            idx: i,
                            width: d.calculatedWidth,
                            height: d.calculatedHeight
                        });
                    });
                }

                function tick(e) {
                    var k = 8 * e.alpha;

                    function pushEdgesToLeftAndRight(d) {
                        if (d.propertyType === "objectLeft") {
                            d.source.x -= 8 * k;
                            d.source.y -= k / 9;
                        } else {
                            d.target.x += 8 * k;
                            d.target.y -= k / 9;
                        }
                    }

                    link
                        .filter(function (d) {
                            return d.objectPropNodeClassUri !== selectedRdfUri;
                        })
                        .attr("x1", function (d) {
                            return d.source.x;
                        })
                        .attr("y1", function (d) {
                            return d.source.y;
                        })
                        .attr("x2", function (d) {
                            return d.targetX;
                        })
                        .attr("y2", function (d) {
                            return d.targetY;
                        })
                        .each(function (d) {
                            pushEdgesToLeftAndRight(d);

                            // shortens the line to compensate for the circle at the target
                            var angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
                            d.targetX = d.target.x - Math.cos(angle) * d.targetRadius;
                            d.targetY = d.target.y - Math.sin(angle) * d.targetRadius;
                        });

                    function positionLoopLink(d) {
                        var loopTranslateX = d.x + mainClassSize * 0.96,
                            loopTranslateY = d.y - mainClassSize / 5.7 - 5;
                        loopLink.attr("transform", "rotate(270, " + d.x + "," + d.y + ") translate(" + loopTranslateX + "," + loopTranslateY + ")");
                    }

                    function positionLoopLinkLabels(d) {
                        function reposition(sel, i) {
                            var foundLoopLinkBackgroundProps =
                                $.grep(loopLinkBackgroundProps, function (obj) {
                                    return obj.idx == i;
                                });
                            var currentBackgroundHeight = 0;
                            if (i > 0) {
                                currentBackgroundHeight = parseFloat(2 * i * (foundLoopLinkBackgroundProps[0].height / 1.4));
                            }

                            var loopLinkLabelX = d.x,
                                loopLinkLabelY = d.y - mainClassSize * 2.1 - currentBackgroundHeight;

                            sel
                                .attr({
                                    x: loopLinkLabelX,
                                    y: loopLinkLabelY
                                })
                                .moveToFront();
                        }

                        /**
                         * Create a "View more" label to depict that the are more reflexive link labels
                         * left that could be seen in the side panel when clicking this label.
                         *
                         * @param labelSel
                         *          d3 selection of the text label
                         * @param backgroundSel
                         *          d3 selection of the rectangle element background
                         * @param predicatesLeft
                         *          number of predicates left that are collapsed
                         */
                        function createViewMorePredicatesLabel(labelSel, backgroundSel, predicatesLeft) {
                            labelSel
                                .classed("view-more-preds-label", true)
                                .text(predicatesLeft + " predicates more ...");
                            if (this.nextSibling !== null) {
                                backgroundSel
                                    .classed("view-more-preds-rect", true);
                            }
                        }

                        loopLinkPropertyName.each(function (dd, i) {
                            var sel = d3.select(this);

                            var predicatesLeft = loopLinkPropertyName.size() - NON_COLLAPSED_REFLEXIVE_LINK_LIMIT;
                            if (predicatesLeft < 0) {
                                reposition(sel, i);
                            } else {
                                if (i == 0 && !scope.collapseEdges && predicatesLeft > 1) {
                                    createViewMorePredicatesLabel(sel, d3.select(this.nextSibling), predicatesLeft);
                                    reposition(sel, i);
                                }

                                if (i < NON_COLLAPSED_REFLEXIVE_LINK_LIMIT) {
                                    reposition(sel, i);
                                } else {
                                    sel.remove();
                                }
                            }
                        });
                        // loopLinkPropertyName.each(function (dd, i) {
                        //     var sel = d3.select(this);
                        //     if (i < NON_COLLAPSED_REFLEXIVE_LINK_LIMIT) {
                        //         reposition(sel, i);
                        //     } else if (i == NON_COLLAPSED_REFLEXIVE_LINK_LIMIT) {
                        //         createViewMorePredicatesLabel(sel, d3.select(this.nextSibling));
                        //         reposition(sel, i);
                        //     } else {
                        //         sel.remove();
                        //     }
                        // });
                    }

                    function positionLoopLinkBackgrounds(d) {
                        var loopLinkBackgroundY = d.x + mainClassSize * 2,
                            loopLinkBackgroundX = d.y - mainClassSize / 1.9;

                        function reposition(sel, i) {
                            var foundLoopLinkBackgroundProps =
                                $.grep(loopLinkBackgroundProps, function (obj) {
                                    return obj.idx == i;
                                });
                            if (i > 0) {
                                loopLinkBackgroundY += parseFloat(i * (foundLoopLinkBackgroundProps[0].height / (i / 1.4)));
                            }

                            sel
                                .attr({
                                    transform: "rotate(270, " + d.x + "," + d.y + ") translate(" + loopLinkBackgroundY + "," + loopLinkBackgroundX + ")",
                                    width: foundLoopLinkBackgroundProps[0].height,
                                    height: foundLoopLinkBackgroundProps[0].width
                                });
                        }

                        /**
                         * Adjust new width of "View more" label background and add all reflexive link metadata the this
                         * label in order to render them in the side panel.
                         *
                         * @param allLoopLinkEdges
                         *              all reflexive links to the current class
                         */
                        function adjustViewMorePredicatesLabel(allLoopLinkEdges) {
                            var viewMoreTextWidth;
                            d3.select(".view-more-preds-label")
                            // make label bold to resemble a collapsed label
                                .style("font-weight", "bold")
                                .each(function (d) {
                                    // attach all reflexive links to the "view more" collapsed predicate
                                    // because in non collapsed mode the backend does not provide them
                                    d.target.allEdges = allLoopLinkEdges;

                                    // calculate text width in pixels in order to adjust background width accordingly
                                    viewMoreTextWidth = this.getComputedTextLength();
                                })
                                .on("click", onCollapsedPropertyNameClick);

                            d3.select(".view-more-preds-rect")
                            // we modify height property instead of width because they are reversed
                            // when we repositioned loop link labels
                                .attr("height", viewMoreTextWidth + 2 * textPadding);
                        }

                        var allLoopLinkEdges = [];
                        loopLinkBackgroundSel.each(function (dd, i) {
                            allLoopLinkEdges.push(dd);
                            if (i < NON_COLLAPSED_REFLEXIVE_LINK_LIMIT) {
                                reposition(d3.select(this), i);
                            } else {
                                d3.select(this).remove();
                            }
                        });

                        adjustViewMorePredicatesLabel(allLoopLinkEdges);
                    }


                    function centerClassNode(d) {
                        if (!(window.ActiveXObject) && "ActiveXObject" in window) {
                            Math.log10 = function (x) {
                                return Math.log(x) / Math.LN10;
                            };
                        }
                        var absDiff = classNode.attr("cx") - width / 2,
                            logOffset = Math.log10(Math.abs(absDiff)) * 0.5;
                        d.x += absDiff > 0 ? -logOffset : logOffset;
                        return d.x;
                    }

                    node
                        .each(function (d) {
                            if (d.classPosition === "main" && !angular.isUndefined(loopLink)) {
                                positionLoopLink(d);
                                positionLoopLinkLabels(d);
                                positionLoopLinkBackgrounds(d);
                            }

                            if (d.objectPropClassUri !== selectedRdfUri) {
                                d3.select(this)
                                    .attr("cx", function (d) {
                                        // pushes the main class circle to the centre
                                        if (d.classPosition === "main") {
                                            return centerClassNode(d);
                                        }
                                        return d.x;
                                    })
                                    .attr("cy", function (d) {
                                        return d.y;
                                    });
                            }
                        });


                    rdfClassName
                        .attr("x", function (d) {
                            return d.x;
                        })
                        .attr("y", function (d) {
                            return d.y;
                        })
                        .moveToFront();


                    linkRect
                        .filter(function (d) {
                            return d.objectPropNodeClassUri !== selectedRdfUri;
                        })
                        .attr("x", function (d) {
                            if (d.target.x > d.source.x) {
                                return (d.source.x + (d.target.x - d.source.x) / 2);
                            } else {
                                return (d.target.x + (d.source.x - d.target.x) / 2);
                            }
                        })
                        .attr("y", function (d) {
                            if (d.target.y > d.source.y) {
                                return (d.source.y + (d.target.y - d.source.y) / 2);
                            } else {
                                return (d.target.y + (d.source.y - d.target.y) / 2);
                            }
                        })
                        .moveToFront();


                    propertyNames
                        .attr("x", function (d) {
                            if (d.target.x > d.source.x) {
                                return (d.source.x + (d.target.x - d.source.x) / 2);
                            } else {
                                return (d.target.x + (d.source.x - d.target.x) / 2);
                            }
                        })
                        .attr("y", function (d) {
                            if (d.target.y > d.source.y) {
                                return (d.source.y + (d.target.y - d.source.y) / 2);
                            } else {
                                return (d.target.y + (d.source.y - d.target.y) / 2);
                            }
                        })
                        .moveToFront();


                    objectPropClassName
                        .attr("x", function (d) {
                            if (d.classPosition === "right") {
                                return d.x + otherClassSize * 1.2;
                            } else {
                                return d.x - otherClassSize * 1.2;
                            }
                        })
                        .attr("y", function (d) {
                            return d.y;
                        })
                        .moveToFront();
                }


                force
                    .on("tick", tick)
                    .linkDistance(width / 3.5)
                    .start();

            }
        });

        function dragstart(d) {
            d3.select(this)
                .classed("selected", d.selected = true);
        }
    }
}
