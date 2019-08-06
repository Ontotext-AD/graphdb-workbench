const navigationBarWidthFull = 240;
const navigationBarWidthCollapsed = 70;
let navigationBarWidth = navigationBarWidthFull;

const radius = 24;
const radius_x = 28;
const clusterColors = ['#0CB0A0', '#F04E23', '#003663', '#ffcc99', '#99ccff', '#ccff99', '#ff99cc', '#99ffcc'];

function containsIPV4(ip) {
    var blocks = ip.split(".");
    for (var i = 0, sequence = 0; i < blocks.length; i++) {
        if (parseInt(blocks[i], 10) >= 0 && parseInt(blocks[i], 10) <= 255) {
            sequence++;
        } else {
            sequence = 0;
        }
        if (sequence === 4) {
            return true;
        }
    }
    return false;
}

function workerIsConnected(n) {
    return n.weight > 0;
}

function masterIsConnected(n) {
    return n.weight > 0;
}

var clusterManagementDirectives = angular.module('graphdb.framework.clustermanagement.directives', []);

clusterManagementDirectives.directive('clusterGraphicalView', ['$window', '$timeout', 'localStorageService', function ($window, $timeout, localStorageService) {
    return {
        restrict: 'A',
        //scope: {}, //no need for isolated scope here
        link: function (scope, element) {
            function getWindowWidth() {
                var collapsed = localStorageService.get('menu-state') === 'collapsedMenu';
                navigationBarWidth = collapsed ? navigationBarWidthCollapsed : navigationBarWidthFull;

                // 95% avoids horizontal scrollbars and adds some margin
                return Math.max(Math.floor(($window.innerWidth - navigationBarWidth) * 0.95), 600);
            }

            function getWindowHeight() {
                // 95% avoids horizontal scrollbars and adds some margin
                return Math.max($window.innerHeight - 120, 600);
            }

            var width = getWindowWidth(),
                height = getWindowHeight(),
                colors = function (i) {
                    return clusterColors[i % clusterColors.length];
                };

            scope.width = function () {
                return width;
            };

            scope.height = function () {
                return height;
            };

            var svg = d3.select(element[0])
                .append('svg')
                .attr('width', width)
                .attr('height', height);

            // line displayed when dragging new nodes
            var drag_line = svg.append('svg:path')
                .attr('class', 'link dragline')
                .attr('visibility', 'hidden')
                .attr('d', 'M0,0L0,0');

            var force = null;

            var currentCluster = 0;

            // mouse event vars
            var mousedown_link = null,
                mousedown_node = null,
                mousedown_svg = null,
                mouseup_node = null;

            function resetMouseVars() {
                mousedown_node = null;
                mouseup_node = null;
                mousedown_link = null;
            }

            function mousedown() {
                // prevent I-bar on drag
                d3.event.preventDefault();

                // because :active only works in WebKit?
                svg.classed('active', true);

                if (d3.event.ctrlKey || mousedown_node || mousedown_link) return;

                scope.selectNode(null);
            }

            function mousemove() {
                if (!mousedown_node) return;

                // update drag line
                drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
            }

            function mouseup() {
                if (mousedown_node) {
                    // hide drag line
                    drag_line
                        .attr('visibility', "hidden")
                        .style('marker-end', '');
                }

                // because :active only works in WebKit?
                svg.classed('active', false);

                // unhighlight source node
                d3.select(mousedown_svg).classed('dragged', false);

                // clear mouse event vars
                resetMouseVars();
            }

            // app starts here
            svg.on('mousedown', mousedown)
                .on('mousemove', mousemove)
                .on('mouseup', mouseup);

            var maxScreenWidthForReposition = 1200;

            function repositionNodes() {
                repositionUnconnectedWorkers();
                repositionUnconnectedMasters();
                repositionConnectedMastersAndWorkers();
            }

            function repositionConnectedMastersAndWorkers() {
                var masters = [];
                var workers = [];

                _.each(scope.nodes, function (n) {
                    if (n.repositoryType === "master" && masterIsConnected(n)) {
                        masters.push(n);
                    } else if (n.repositoryType === "worker" && workerIsConnected(n)) {
                        workers.push(n);
                    }
                });

                var horizontalSpacing = scope.width() / 3;

                // Masters initial positions are in the left side of the screen,
                // ordered top to bottom
                var mastersSpacing = scope.height() / (masters.length + 1);
                for (var i = 0; i < masters.length; i++) {
                    masters[i].px = masters[i].x = horizontalSpacing;
                    masters[i].py = masters[i].y = mastersSpacing * (i + 1);
                    masters[i].fixed = false;
                }

                // Workers initial positions are in the right side of the screen,
                // ordered top to bottom
                var workersSpacing = scope.height() / (workers.length + 1);
                for (var i = 0; i < workers.length; i++) {
                    workers[i].px = workers[i].x = horizontalSpacing * 2;
                    workers[i].py = workers[i].y = workersSpacing * (i + 1);
                    workers[i].fixed = false;
                }
            }

            function repositionUnconnectedWorkers() {
                var workers = _.filter(scope.nodes, function (n) {
                    return n.repositoryType === 'worker' && !workerIsConnected(n);
                });

                // Between 3 and 6 rows, depending on window height
                console.log(Math.floor((height - 50) / 110));
                var workerRows = Math.max(Math.min(Math.floor(height / 110), 6), 3);
                var workerColumns = Math.ceil(workers.length / workerRows);

                for (var i = 0; i < workers.length; i++) {
                    var wRow = i % workerRows;
                    var wCol = workerColumns - Math.floor(i / workerRows) - 1;

                    var usableWidth = Math.min(maxScreenWidthForReposition, scope.width());
                    var widthDelta = scope.width() - usableWidth;
                    workers[i].px = workers[i].x = scope.width() - widthDelta / 2 - wCol * 64 - 35;
                    workers[i].py = workers[i].y = wRow * 110 + 50;

                    workers[i].fixed = true;
                }
            }

            function repositionUnconnectedMasters() {
                var masters = _.filter(scope.nodes, function (n) {
                    return n.repositoryType === 'master' && !masterIsConnected(n);
                });

                // Between 3 and 6 rows, depending on window height
                var masterRows = Math.max(Math.min(Math.floor((height - 200) / 110), 6), 3);
                var masterColumns = Math.ceil(masters.length / masterRows);

                for (var i = 0; i < masters.length; i++) {
                    var mRow = i % masterRows;
                    var mCol = masterColumns - Math.floor(i / masterRows) - 1;

                    var usableWidth = Math.min(maxScreenWidthForReposition, scope.width());
                    var widthDelta = scope.width() - usableWidth;
                    masters[i].px = masters[i].x = widthDelta / 2 + mCol * 64 + 35;
                    masters[i].py = masters[i].y = mRow * 110 + 50;

                    masters[i].fixed = true;
                }
            }

            /* Main function that builds the d3 UI */
            scope.render = function () {
                if (scope.nodes === undefined) {
                    return;
                }

                if (force !== null) {
                    force.stop();
                }

                // remove all previous items before render
                svg.selectAll('g').remove();

                // init D3 force layout
                force = d3.layout.force()
                    .nodes(scope.nodes)
                    .links(scope.links)
                    // Those parameters are really important for stacking the clusters properly.
                    // Take care when changing them please!
                    .gravity(0)
                    .charge(-50)
                    .size([width, height])
                    .linkStrength(0.05)
                    .linkDistance(function (link) {
                        if (link.source.repositoryType === "master" && link.target.repositoryType === "master") {
                            return Math.min(width, 1200) * 0.208;
                        }
                        return Math.min(width, 1200) * 0.375;
                    })
                    .on('tick', tick);

                // handles to link and node element groups
                var path = svg.append('svg:g').selectAll('g'),
                    circle = svg.append('svg:g').selectAll('g'),
                    pathLinks,
                    pathGroupWarnings;

                // update force layout (called automatically each iteration)
                function tick() {
                    // draw directed edges with proper padding from node centers

                    pathLinks.attr('d', function (d) {
                        var deltaX = d.target.x - d.source.x,
                            deltaY = d.target.y - d.source.y,
                            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                            normX = deltaX / dist,
                            normY = deltaY / dist,
                            sourcePadding = d.left ? 17 : 12,
                            targetPadding = d.right ? 17 : 12,
                            sourceX = d.source.x + (sourcePadding * normX),
                            sourceY = d.source.y + (sourcePadding * normY),
                            targetX = d.target.x - (targetPadding * normX),
                            targetY = d.target.y - (targetPadding * normY);
                        return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
                    });

                    // Position reversePeerMissing warning icons
                    pathGroupWarnings.attr('transform', function (d) {
                        var deltaX = d.target.x - d.source.x,
                            deltaY = d.target.y - d.source.y,
                            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                            normX = deltaX / dist,
                            normY = deltaY / dist,
                            targetPadding = 70,
                            targetX = d.target.x - (targetPadding * normX),
                            targetY = d.target.y - (targetPadding * normY);

                        return 'translate(' + targetX + ' ' + targetY + ')';
                    });

                    circle.attr('transform', function (d) {
                        if (!d.fixed) {
                            if (d.x > width - 50) {
                                d.x -= 50;
                            } else if (d.x < 50) {
                                d.x = 50;
                            }

                            if (d.y > height - 50) {
                                d.y -= 50;
                            } else if (d.y < 50) {
                                d.y = 50;
                            }
                        }

                        return 'translate(' + d.x + ',' + d.y + ')';
                    });
                }

                function nodeColors(d) {
                    if (d.cluster === undefined || d.cluster.length === 0) {
                        return "#888";
                    }
                    if (d.repositoryType === "worker") {
                        if (d.cluster.indexOf(currentCluster) >= 0) {
                            return colors(currentCluster);
                        } else {
                            return colors(d.cluster[0]);
                        }
                    } else {
                        return colors(d.cluster);
                    }
                }

                function iconTextContour(d) {
                    if (d.repositoryType === "master") {
                        if (d.readonly && d.mode === "MUTE") {
                            return "\ue910";
                        } else if (d.readonly) {
                            return "\ue90b";
                        } else if (d.mode === "MUTE") {
                            return "\ue90b";
                        } else {
                            return "\ue906";
                        }
                    } else if (d.repositoryType === "worker") {
                        return "\ue906";
                    }
                }

                function iconText(d) {
                    if (d.repositoryType === "master") {
                        if (d.readonly && d.mode === "MUTE") {
                            return "\ue913";
                        } else if (d.readonly) {
                            return "\ue938";
                        } else if (d.mode === "MUTE") {
                            return "\ue937";
                        } else {
                            return "\ue939";
                        }
                    } else if (d.repositoryType === "worker") {
                        return "\ue93c";
                    }
                }

                // Updates the status of existing links
                function updateStatuses() {
                    path.select('.link').attr('class', function (link) {
                        return link.status + ' link';
                    });
                }

                // update graph (called when needed)
                function restart() {
                    // path (link) group
                    path = path.data(scope.links);

                    // add new links
                    var pathGroup = path.enter().append('svg:g');

                    pathGroup.append('svg:path')
                        .attr('class', function (link) {
                            var status = link.status;
                            return status + ' link';
                        })
                        .on('mousedown', function (d) {
                            // delete link
                            if (d3.event.button === 0) {
                                // Primary mouse button
                                d3.event.stopPropagation();
                                scope.disconnectLinkConfirm(d, restart);
                            }
                        })
                        .on('mouseover', function () {
                            $('.node-default-tip').hide();
                            $('.node-disconnect-tip').show();
                        })
                        .on('mouseout', function () {
                            $('.node-default-tip').show();
                            $('.node-disconnect-tip').hide();
                        });

                    pathLinks = path.select('path');

                    pathGroupWarnings = pathGroup.append('svg:g')
                        .classed('link-warning', true)
                        .on('mouseover', function () {
                            $('.node-default-tip').hide();
                            $('.node-warning-tip').show();
                        })
                        .on('mouseout', function () {
                            $('.node-default-tip').show();
                            $('.node-warning-tip').hide();
                        });

                    pathGroupWarnings.append('svg:polygon')
                    //.attr('points', '0 -13.333, 11.547 6.666, -11.547 6.666')
                    //.attr('points', '0 -14.6666, 12.7017 7.3333, -12.7017 7.3333')
                        .attr('points', '0 -16.6666, 14.4337 8.3333, -14.4337 8.3333')
                        .attr('fill', 'white');
                    pathGroupWarnings.append('svg:text')
                        .text('\ue920')
                        .attr('text-anchor', 'middle')
                        .attr('alignment-baseline', 'baseline')
                        .classed('icon-any', true);

                    pathGroupWarnings = path.select('g');

                    // remove old links
                    path.exit().remove();


                    // circle (node) group
                    circle = circle.data(scope.nodes);

                    // update existing nodes (reflexive & selected visual states)

                    circle.selectAll('.repo')
                        .style('fill', nodeColors)
                        .classed('reflexive', function (d) {
                            return d.reflexive;
                        });

                    // add new nodes
                    var g = circle.enter().append('svg:g');

                    var circleGroup = g.append('svg:g')
                        .attr('class', 'node')
                        .attr('title', 'Drag and drop node to connect to other nodes')
                        .classed('reflexive', function (d) {
                            return d.reflexive;
                        })
                        .on('mouseover', function (d) {
                            if (!mousedown_node || d === mousedown_node) {
                                $('.node-default-tip').hide();
                                $('.node-connect-tip').show();
                            } else {
                                // highlight target node
                                d3.select(this).classed('dragged', true);
                            }
                        })
                        .on('mouseout', function (d) {
                            if (!mousedown_node || d === mousedown_node) {
                                $('.node-default-tip').show();
                                $('.node-connect-tip').hide();
                            } else {
                                // unhighlight target node
                                d3.select(this).classed('dragged', false);
                            }
                        })
                        .on('mousedown', function (d) {
                            if (d3.event.ctrlKey || d3.event.button !== 0) return;

                            // select node
                            mousedown_node = d;
                            mousedown_svg = this;

                            // reposition drag line
                            drag_line
                                .style('marker-end', 'url(#end-arrow)')
                                .attr('visibility', "visible")
                                .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

                            // highlight source node
                            d3.select(this).classed('dragged', true);
                        })
                        .on('click', function (d) {
                            // highlight node for tooltip
                            d3.select(this).classed('dragged', true);

                            scope.selectNode(d);
                            // position the tooltip according to the node!

                            var tooltip = d3.select('.nodetooltip');
                            var windowWidth = $(window).width();
                            if (d3.event.pageX < windowWidth / 2) {
                                // left
                                tooltip.style("left", d3.event.pageX + "px")
                                tooltip.style("right", "")
                            } else {
                                // right
                                tooltip.style("left", "");
                                tooltip.style("right", (windowWidth - d3.event.pageX) + "px")
                            }
                            tooltip.style("top", (d3.event.pageY - 28) + "px");

                            console.log(angular.copy(d3.event));
                        })
                        .on('mouseup', function (d) {
                            if (!mousedown_node) return;

                            drag_line
                                .attr('visibility', 'hidden')
                                .style('marker-end', '');

                            // check for drag-to-self
                            mouseup_node = d;
                            if (mouseup_node === mousedown_node) {
                                resetMouseVars();
                                return;
                            }

                            // unhighlight target node
                            d3.select(this).classed('dragged', false);

                            scope.connectNodes(mousedown_node, mouseup_node, restart);
                            scope.selectNode(null);
                        });

                    // The icons for workers and masters consist of several elements:
                    // 1) Outer bigger circle, normally kept transparent and used for better mouse aim
                    //    as well as for highlighting nodes when it becomes visible.
                    circleGroup.append('svg:circle')
                        .attr('r', radius + 10);

                    // Create a dummy anchor node
                    var parser = document.createElement('a');

                    // 2) Contour icon in white to keep the transparent parts of the actual icons white
                    g.append('svg:text')
                        .attr('y', 25)
                        .attr('text-anchor', 'middle')
                        // attribute not supported by firefox so we instead play with the y axis
                        //.attr('alignment-baseline', 'central')
                        .attr('class', 'icon-any')
                        .attr('fill', 'white')
                        .text(iconTextContour);

                    // 3) Actual master or worker icon.
                    g.append('svg:text')
                        .attr('y', 25)
                        .attr('text-anchor', 'middle')
                        // attribute not supported by firefox so we instead play with the y axis
                        //.attr('alignment-baseline', 'central')
                        .attr('class', 'icon-any repo')
                        .attr('fill', nodeColors)
                        .text(iconText);

                    var gHostLabel = g.append('svg:g');

                    var gHostLabelRect = gHostLabel.append('svg:rect');

                    var textOffset = 38;
                    var hostTextDelta = 15;

                    // node host:port or local
                    gHostLabel.append('svg:text')
                        .attr('x', 0)
                        .attr('y', function (d) {
                            return textOffset + hostTextDelta;
                        })
                        .attr('class', 'id id-host')
                        .text(function (d) {
                            if (d.local) {
                                return 'local';
                            } else {
                                parser.href = d.location;
                                var hostname = parser.hostname;
                                if (!containsIPV4(parser.hostname)) {
                                    hostname = parser.hostname.split('.')[0];
                                }
                                return hostname + ":" + parser.port;
                            }
                        })
                        //.style('opacity', 0.7)
                        .each(function (d) {
                            d.labelHost = this;
                        });


                    var gNodeLabel = g.append('svg:g');

                    var gNodeLabelRect = gNodeLabel.append('svg:rect');

                    // show node names
                    gNodeLabel.append('svg:text')
                        .attr('x', 0)
                        .attr('y', textOffset)
                        .attr('class', 'id')
                        .text(function (d) {
                            return d.name;
                        })
                        .each(function (d) {
                            d.labelNode = this;
                        });


                    // this will draw a single line that will strike i.e. mark the node as disabled
                    // this is mostly done when the node is in some inconsistent state(we don't know
                    // it's location or it is a master and we have no proper jmx connection to that location.
                    g.append('svg:line')
                        .attr('x1', -radius_x - 5)
                        .attr('x2', radius_x + 5)
                        .attr('y1', 0)
                        .attr('y2', 0)
                        .attr('stroke', 'red')
                        .attr('stroke-width', 4)
                        .attr('transform', 'rotate(-45)')
                        .attr('class', 'disabled-bar')
                        .attr('visibility', function (d) {
                            return 'disabledReason' in d ? 'visible' : 'hidden'
                        })
                    ;

                    // remove old nodes
                    circle.exit().remove();

                    // set the graph in motion
                    force.start();

                    // Needs to happen after start as we rely on node.weight
                    repositionNodes();

                    // timeouts + try/catch: workarounds for issues, see GDB-1188
                    $timeout(function () {
                        function getBBox(node) {
                            // Due to an ancient yet unfixed bug in Firefox (https://bugzilla.mozilla.org/show_bug.cgi?id=612118)
                            // getBBox() throws an error _sometimes_ (if the labelHost and labelNode aren't rendered yet)
                            // and hell breaks loose. We overcome that by catching the error and providing a bbox with zeros
                            // (this is what good browsers do!)
                            try {
                                return node.getBBox();
                            } catch (e) {
                                return {x: 0, y: 0, width: 0, height: 0}
                            }
                        }

                        gHostLabelRect.attr('width', function (d) {
                            return getBBox(d.labelHost)['width'] + 4;
                        }).attr('height', function (d) {
                            return getBBox(d.labelHost)['height'];
                        }).attr('x', function (d) {
                            return getBBox(d.labelHost)['x'] - 2;
                        }).attr('y', function (d) {
                            return getBBox(d.labelHost)['y'];
                        }).attr('fill', '#EEEEEE');

                        gNodeLabelRect.attr('width', function (d) {
                            return getBBox(d.labelNode)['width'] + 4;
                        }).attr('height', function (d) {
                            return getBBox(d.labelNode)['height'];
                        }).attr('x', function (d) {
                            return getBBox(d.labelNode)['x'] - 2;
                        }).attr('y', function (d) {
                            return getBBox(d.labelNode)['y'];
                        }).attr('fill', '#EEEEEE');
                    }, 100);

                    // updating done
                    scope.needsToRestart = false;
                    scope.updating = false;
                }

                scope.updateStatuses = updateStatuses;
                scope.restart = restart;

                function updateWarnings() {
                    path.select('g')
                        .classed('link-warning-visible', function (d) {
                            return d.reversePeerMissing && !('disabledReason' in d.target);
                        });
                }

                scope.updateWarnings = updateWarnings;

                function updateColors() {
                    currentCluster++;
                    if (currentCluster >= scope.clusters.length) {
                        currentCluster = 0;
                    }

                    // try to find the next cluster with workers
                    var start = currentCluster;
                    while (!scope.clusters[currentCluster].hasWorkers) {
                        currentCluster++;
                        if (currentCluster >= scope.clusters.length) {
                            currentCluster = 0;
                        }
                        if (currentCluster === start) {
                            // didn't find any clusters with workers, no need to update colors
                            return;
                        }
                    }
                    circle.selectAll('.repo').style('fill', nodeColors);
                }

                scope.updateColors = updateColors;

                function refreshMastersIcons() {
                    d3.selectAll('.repo').text(iconText);
                }

                scope.refreshMastersIcons = refreshMastersIcons;

                scope.resize = function () {
                    // recalculates with new screen width
                    width = getWindowWidth();
                    height = getWindowHeight();
                    svg.attr("width", width);
                    svg.attr("height", height);
                    force.size([width, height]).resume();
                    scope.restart();
                };

                restart();
            };
        }
    };
}]);
