import d3tip from 'lib/d3-tip/d3-tip-patch';
import CirclePacking from 'lib/common/circle-packing';
import D3 from 'lib/common/d3-utils';
import SVG from 'lib/common/svg-export';
import 'angular/utils/local-storage-adapter';

angular
    .module('graphdb.framework.graphexplore.directives.class', [
        'graphdb.framework.graphexplore.controllers.class',
        'graphdb.framework.utils.localstorageadapter'
    ])
    .constant("ZOOM_DURATION", 500)
    .constant("ROOT_OBJ_NAME", "RDF Class Hierarchy")
    .directive('rdfClassHierarchy', classHierarchyDirective);

classHierarchyDirective.$inject = ['$rootScope', '$location', 'GraphDataRestService', '$window', '$timeout', '$repositories', '$licenseService', 'toastr', 'ZOOM_DURATION', 'ROOT_OBJ_NAME', 'LocalStorageAdapter', 'LSKeys', '$translate'];

function classHierarchyDirective($rootScope, $location, GraphDataRestService, $window, $timeout, $repositories, $licenseService, toastr, ZOOM_DURATION, ROOT_OBJ_NAME, LocalStorageAdapter, LSKeys, $translate) {
    return {
        restrict: 'AE',
        template: '<div id="classChart"></div>',
        scope: {
            classHierarchyData: '=',
            flattenedClassNames: '=',
            selectedClass: '=',
            currentSliderValue: '=',
            showClassInfoPanel: '=',
            showExternalElements: '=',
            hidePrefixes: '=',
            currentBrowserLimit: '='
        },
        link: linkFunc
    };

    function linkFunc(scope, element, attrs) {
        renderCirclePacking(scope, element);
    }

    function renderCirclePacking(scope, element) {

        var width = 800,
            height = 800,
            diameter = height,
            margin = 20,
            tip,
            rootHierarchy;

        var packLayout = d3.pack()
            .size([diameter - margin, diameter - margin]);

        var color = d3.scaleLinear()
            .domain([0, 4])
            .range(["hsl(19, 70%, 90%)", "hsl(19, 70%, 50%)"])
            .interpolate(d3.interpolateHcl);

        var svg = d3.select("#classChart")
            .insert("svg:svg", "h2")
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .on("dblclick.zoom", null);

        function appendMainGroup() {
            return svg.append("svg:g")
                .attrs({
                    id: "main-group",
                    transform: "translate(" + width / 2 + "," + height / 2 + ")"
                });
        }

        function savePrefixesState(hidePrefixes) {
            if (!angular.isUndefined(hidePrefixes)) {
                LocalStorageAdapter.set(LSKeys.CLASS_HIERARCHY_HIDE_PREFIXES, hidePrefixes);
            }
        }

        function getPrefixesState() {
            return LocalStorageAdapter.get(LSKeys.CLASS_HIERARCHY_HIDE_PREFIXES) === "true";
        }

        /*
         * Prepares SVG document image export by adding xml namespaces and
         * additional style information
         */
        function prepareForSVGImageExport() {
            // get css rules for the diagram
            var cssRules = SVG.Export.getCSSRules("css/rdf-class-hierarchy-labels.css?v=[AIV]{version}[/AIV]");
            // inline css rules in a defs tag
            d3.selectAll("#main-group")
                .append("defs");
            $("defs").append('<style type="text/css"><![CDATA[' + cssRules + ']]></style>');

            // switch opacity to visible
            d3.selectAll("g")
                .style("opacity", 1);

            // convert selected html to base64
            var imgSrc = SVG.Export.generateBase64ImageSource("#classChart svg");

            // set the binary image and a name for the downloadable file on the export button
            d3.select(this).attrs({
                href: imgSrc,
                download: "class-hierarchy-" + $repositories.getActiveRepository() + ".svg"
            });
        }

        scope.hidePrefixes = getPrefixesState();

        var g = appendMainGroup();

        if (!scope.classHierarchyData.classCount && $repositories.getActiveRepository() && !$repositories.isSystemRepository()) {
            if (!$licenseService.isLicenseValid()) {
                return;
            }
            $rootScope.loader = true;
            $rootScope.hierarchyError = false;
            const selGraphFromCache = LocalStorageAdapter.get(`classHierarchy-selectedGraph-${$repositories.getActiveRepository()}`);
            GraphDataRestService.getClassHierarchyData(selGraphFromCache !== null ? selGraphFromCache.contextID.uri : "")
                .success(function (response, status, headers) {
                    $rootScope.loader = false;
                    if (status === 207) {
                        toastr.warning($translate.instant('graphexplore.update.diagram'), $translate.instant('graphexplore.repository.data.changed'));
                    }
                    scope.classHierarchyData = response;

                    d3.select("#download-svg")
                        .on("mouseover", prepareForSVGImageExport);

                }).error(function (response) {
                $rootScope.loader = false;
                $rootScope.hierarchyError = getError(response);
                toastr.error($translate.instant('graphexplore.error.request.failed', {name: ROOT_OBJ_NAME, error: getError(response)}));
            });
        }


        var autoZoomToPreviousState,
            doFocus;

        var focus,
            rootFocusEvent,
            classSearchEvent,
            flattenedClassData = {};

        function drawDiagram(root, config, newFocus, switchPrefixes) {
            if (rootFocusEvent) rootFocusEvent();
            if (classSearchEvent) classSearchEvent();
            // remove old group tag containing the diagram
            d3.selectAll("#main-group").remove();

            // append new empty group tag in order to rerender new diagram
            g = appendMainGroup();

            // fix for single child classes
            CirclePacking.SingleChild.addPlaceholders(root, true);

            rootHierarchy = d3.hierarchy(root);
            rootHierarchy.sum(function (d) {
                return d.size;
            })
            focus = newFocus ? newFocus : rootHierarchy;

            packLayout(rootHierarchy)

            var nodes = rootHierarchy.descendants(),
                view;

            focus.isInFocusTransitive = true;

            // fixes for single child classes
            CirclePacking.SingleChild.removePlaceholders(nodes);
            CirclePacking.SingleChild.centerNodes(nodes);
            CirclePacking.SingleChild.makePositionsRelativeToZero(nodes);

            if (!tip) {
                tip = d3tip()
                    .attr('class', 'd3-tip')
                    .customPosition(function (d, event) {
                        return {
                            top: 'inherit',
                            bottom: ($window.innerHeight - event.clientY) + 'px',
                            right: ($window.innerWidth - event.clientX) + 'px'
                        };
                    })
                    .html(function (d) {
                        return d.data.name;
                    });
                svg.call(tip);
            }

            var circleGroup = g.selectAll("circle")
                .data(nodes)
                .enter().append("g");

            if (config.doFade) {
                circleGroup.each(function (d) {
                    D3.Transition.fadeIn(d3.select(this), 550);
                });
            }

            var flattenedClassNames = [];

            var circle = circleGroup
                .append("circle")
                .attr("class", function (d) {
                    return d.data.role;
                })
                .attr("guide-selector", function (d) {
                    return "class-" + d.data.name;
                })
                .style("fill", function (d) {
                    //return colors[d.depth % 6];
                    return d.children ? color(d.depth) : "#E0D0D0";
                })
                .each(function (d) {
                    d.circle = d3.select(this);
                    if (d.data.name !== ROOT_OBJ_NAME) {
                        var key = d.data.name;
                        flattenedClassNames.push({name: key});
                        flattenedClassData[[key]] = d;

                        d.circle.classed("rdf-class", true);
                        d.circle.on('mouseover', function (event) {
                            if (config.noPrefixes) {
                                tip.show(d, event);
                            } else if (!d.textHidden) {
                                tip.hide(d);
                            } else {
                                tip.show(d, event);
                            }
                        });
                        d.circle.on('mouseout', tip.hide);
                    }
                })
                // custom event used when user is following a guide
                .on("gdb-focus", (event, d) => doFocus(d))
                .on("gdb-zoom", (event, d) => zoom(d));


            if (flattenedClassNames) {
                flattenedClassNames = _.uniqBy(flattenedClassNames, 'name');
                scope.flattenedClassNames = flattenedClassNames;
            }

            var selectedClass;

            function getCurrentClassDataAndMarkSelected(obj) {
                d3.selectAll(".selected").classed("selected", obj.selected = false);
                obj.circle.classed("selected", obj.selected = true);
                selectedClass = obj;
            }

            function showClassInfoPanel() {
                scope.selectedClass = selectedClass;
                scope.showClassInfoPanel = true;
            }

            function closeClassInfoPanel() {
                scope.showClassInfoPanel = false;
            }

            function goToDomainRangeGraphView() {
                $rootScope.$broadcast('goToDomainRangeGraphView', selectedClass, focus);
            }

            var clickCancel = D3.Click.delayDblClick();
            d3.selectAll(".parent, .topLevelParent, .child, .root")
                .call(clickCancel);

            doFocus = function (obj) {
                zoom(obj);

                if (obj.data.name === ROOT_OBJ_NAME) {
                    closeClassInfoPanel();
                    d3.selectAll(".selected").classed("selected", false);
                } else {
                    getCurrentClassDataAndMarkSelected(obj);
                    showClassInfoPanel();

                    // FIXME: is it ok to bind this event handler every time and not just once?
                    scope.$on('sidePanelClosed', function (event) {
                        d3.selectAll(".selected").classed("selected", obj.selected = false);
                    });
                }


                //do not stop event propagation here
            };

            clickCancel.on("click", function (event, obj) {
                // add clicked class to browser history
                if (obj.data.id) {
                    $window.history.pushState({id: obj.data.id}, "classHierarchyPage" + obj.data.id, "hierarchy#" + obj.data.id);
                }

                //hide current d3-tip tooltip
                tip.hide();

                doFocus(obj);
            });

            clickCancel.on("dblclick", function (event, obj) {
                if (obj === root) {
                    return;
                }
                // hide current d3-tip tooltip in order not to appear in the next view
                tip.hide();
                getCurrentClassDataAndMarkSelected(obj);
                goToDomainRangeGraphView();

                event.stopPropagation();
            });

            var lastTimeWheel = 0;
            svg.on('wheel', function (event) {
                // hide current d3-tip tooltip
                tip.hide();

                event.preventDefault();
                event.stopPropagation();

                // at least 100ms must have passed since last time we updated
                var now = new Date().getTime();
                if (now - lastTimeWheel > 100) {
                    lastTimeWheel = now;
                } else {
                    return;
                }

                var direction = '';
                if (event.deltaY <= -1) {
                    direction = 'in';
                } else if (event.deltaY >= 1) {
                    direction = 'out';
                }

                var obj = event.target.__data__;

                if (!obj) {
                    // scroll outside the big circle
                    obj = focus;
                }

                if (direction === 'in') {
                    // determine object to zoom to

                    if (obj !== focus) {
                        // consider the object on which the scroll event occurred
                        // and find the furthest parent that has no focused children
                        while (obj.parent && !obj.parent.isInFocusTransitive) {
                            obj = obj.parent;
                        }
                        if (obj.depth < focus.depth) {
                            // however if that parent is of lower depth than the focus we ignore it
                            obj = focus;
                        }
                    }

                    if (obj === focus && obj.children) {
                        // if object is in focus and it has children we zoom to its biggest child
                        // TODO: sort children on backend
                        var newobj = obj.children[0];
                        for (var i = 1; i < obj.children.length; i++) {
                            if (obj.children[i].sortingRank > newobj.sortingRank) {
                                newobj = obj.children[i];
                            }
                        }
                        if (newobj.children) {
                            // Use the child only if it has children
                            obj = newobj;
                        }
                    } else if (!obj.children) {
                        // If node has no children use its parent instead
                        obj = obj.parent;
                    }

                    zoom(obj, true);
                } else if (direction === 'out') {
                    // zooming out simply goes one parent up
                    obj = focus.parent;
                    if (obj) {
                        zoom(obj, true);
                    }
                }

                if (focus.data.name === ROOT_OBJ_NAME) {
                    $window.history.replaceState({id: 1}, "classHierarchyPage1", "hierarchy#1");
                }

                // redraw slider on zoom out
                sendSliderData();
            });

            var text = g.selectAll("text")
                .data(nodes)
                .enter().append("text")
                .attr("class", function (d) {
                    return d.children && d.children.length ? "label" : "label child-label";
                })
                .each(function (d) {
                    d.textSel = d3.select(this);
                });

            function trimPrefixes(d) {
                var idx = d.data.name.indexOf(":");
                var absUriIdx = d.data.name.indexOf("http://");
                if (absUriIdx > -1) {
                    // if we have no prefix available ignore
                    d.noPrefixName = d.data.name;
                } else if (idx > -1) {
                    d.noPrefixName = d.data.name.substring(idx + 1);
                }
            }

            if (config.noPrefixes) {
                text.each(trimPrefixes);
                text
                    .style("font-size", function (d) {
                        return D3.Text.calcFontSize(d.noPrefixName, d.r);
                    })
                    .text(function (d) {
                        return D3.Text.getTextWithElipsisIfNeeded(d.noPrefixName, d.r / 3);
                    });
            } else {
                text
                    .style("font-size", function (d) {
                        return D3.Text.calcFontSize(d.data.name, d.r);
                    })
                    .text(function (d) {
                        return D3.Text.getTextWithElipsisIfNeeded(d.data.name, d.r / 3);
                    })
            }

            // TODO: make this use the full version (same as zoom)
            text.style("display", function (d) {
                if (d.parent && d.parent.data === focus.data) {
                    d.textHidden = this.textContent.indexOf("...") + 3 === this.textContent.length;
                    return null;
                } else {
                    d.textHidden = true;
                    return "none";
                }
            });

            if (config.doFade && !config.keepPrevState) {
                text.each(function (d) {
                    D3.Transition.fadeIn(d3.select(this), 550);
                });
            }

            autoZoomToPreviousState = function () {
                function focusOnCurrentClass(focusHistoryId) {
                    if (focusHistoryId) {
                        circle.each(function (d) {
                            if (+focusHistoryId === d.data.id) {
                                doFocus(d);
                            }
                        });
                    }
                }

                var focusHistoryId = $location.hash();

                $window.onpopstate = function (event) {
                    if (event.state) {
                        var focusHistoryId = event.state.id;
                        focusOnCurrentClass(focusHistoryId);
                    }
                };

                focusOnCurrentClass(focusHistoryId);
            };

            var node = g.selectAll("circle, text");

            function zoomTo(v, switchPrefixes) {
                var k = diameter / v[2];
                view = v;

                node.attr("transform", function (d) {
                    return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
                });

                circle.attr("r", function (d) {
                    return d.r * k;
                });

                function switchPrefixesInPlace(d) {
                    // if uris match with the topLevelParentUri of the focused element
                    // or your focus is a top level parent hide its label and if it is not
                    // a child element show all of its child labels. If it is a child element
                    // only show its label.
                    if (d.data.fullName === focus.data.topLevelParentUri || focus.data.topLevelParentUri === ROOT_OBJ_NAME) {
                        d.textSel.style("display", "none");
                        if (focus.children && focus.children.length) {
                            _.each(focus.children, function (c) {
                                c.textSel.style("display", "inline");
                            });
                        } else {
                            focus.textSel.style("display", "inline");
                        }

                        // in order to show prefixes of siblings check if the focused
                        // element has a parent and show all of its children except
                        // for the name of the focused element because you need to see
                        // its children
                        if (focus.parent) {
                            _.each(focus.parent.children, function (c) {
                                if (c.data.name !== focus.data.name) {
                                    c.textSel.style("display", "inline");
                                }
                            });
                        }
                    }
                }

                if (switchPrefixes) {
                    text.each(switchPrefixesInPlace);
                }

                text
                    .style("font-size", function (d) {
                        if (config.noPrefixes) {
                            return D3.Text.calcFontSize(d.noPrefixName, d.r * k);
                        }
                        return D3.Text.calcFontSize(d.data.name, d.r * k);
                    })
                    .text(function (d) {
                        if (config.noPrefixes) {
                            return D3.Text.getTextWithElipsisIfNeeded(d.noPrefixName, d.r * k / 3);
                        }
                        return D3.Text.getTextWithElipsisIfNeeded(d.data.name, d.r * k / 3);
                    });
            }


            function adjustRadius(r) {
                var newr = r * 2 + margin;
                if (r * 2 / newr < 0.3) {
                    // for very small circles we need to adjust
                    newr = r * 2 + 2;
                }
                return newr;
            }

            zoomTo([focus.x, focus.y, adjustRadius(focus.r)], switchPrefixes);

            function textUpdate(d) {
                if (d.isInFocusTransitive || !(d.parent && d.parent.isInFocusTransitive)) {
                    // hide labels of classes that are in focus (including children) OR whose parents aren't in focus
                    d.textHidden = true;
                    this.style.display = "none";
                } else {
                    // show all other labels
                    d.textHidden = this.textContent.indexOf("...") + 3 === this.textContent.length;
                    this.style.display = "";
                }
            }

            function zoom(d, shouldClosePanel) {
                // use empty timeout to force the following code to be executed on the next $digest cycle
                // in order to avoid '$digest in progress' error
                $timeout(function () {
                    scope.showExternalElements = (d.data.name === ROOT_OBJ_NAME);
                });

                if (focus === d) {
                    // Node is already zoomed to
                    // Important to return before we modify the history, otherwise we choke the browser
                    return;
                }

                if (d.data.id) {
                    $window.history.replaceState({id: d.data.id}, "classHierarchyPage" + d.data.id, "hierarchy#" + d.data.id);
                }

                if (!d.children) {
                    // No children - zoom to parent instead
                    d = d.parent;
                    if (focus === d) {
                        // Parent is already zoomed to
                        return;
                    }
                }

                if (shouldClosePanel) {
                    closeClassInfoPanel();
                    d3.selectAll(".selected").classed("selected", false);
                }

                if (focus.parent) {
                    var p = focus;
                    while (p) {
                        p.isInFocusTransitive = false;
                        p = p.parent;
                    }
                }

                var p = d;
                while (p) {
                    p.isInFocusTransitive = !!p.children;
                    p = p.parent;
                }

                focus = d;

                var isVerySmallCircle = focus.r * 2 / (focus.r * 2 + margin) < 0.3;

                if (isVerySmallCircle || scope.currentSliderValue > scope.currentBrowserLimit) {
                    // no fancy animation for slower browsers if above the limit or if zooming to a very small circle
                    zoomTo([focus.x, focus.y, adjustRadius(focus.r)]);

                    text.each(function (d) {
                        textUpdate.call(this, d)
                    });
                } else {
                    // the fancy version for faster browsers
                    var transition = d3.transition()
                        .duration(ZOOM_DURATION)
                        .tween("zoom", function (d) {
                            var i = d3.interpolateZoom(view, [focus.x, focus.y, adjustRadius(focus.r)]);
                            return function (t) {
                                zoomTo(i(t));
                            };
                        });

                    transition.selectAll("text")
                    // Experimental: hide texts to be hidden on "start", show texts to be shown on "end"
                        .each(textUpdate)
                }
            }

            rootFocusEvent = scope.$on('rootFocus', function () {
                $window.history.pushState({id: 1}, "classHierarchyPage1", "hierarchy#1");
                doFocus(rootHierarchy);
            });

            classSearchEvent = scope.$on('classSearch', function (selectedClass) {
                doFocus(selectedClass);
            });
        }

        function sendSliderData() {
            const currentClassCount = scope.classHierarchyData.classCount;
            let currentSliderValue = LocalStorageAdapter.get(LSKeys.CLASS_HIERARCHY_CURRENT_SLIDER_VALUE);

            if (!currentSliderValue || currentSliderValue > currentClassCount) {
                currentSliderValue = currentClassCount;
                LocalStorageAdapter.set(LSKeys.CLASS_HIERARCHY_CURRENT_SLIDER_VALUE, currentSliderValue);
            }

            $rootScope.$broadcast("classCount", currentClassCount, currentSliderValue);
        }

        window.addEventListener('resize', sendSliderData);

        window.addEventListener('beforeunload', removeResizeListener);

        function removeResizeListener() {
            window.removeEventListener('resize', sendSliderData);
            window.removeEventListener('beforeunload', removeResizeListener);
        }

        var prefixesWatch,
            currentClassCountWatch,
            searchedClassBroadcast,
            onEnterClassSearchBroadcast;

        scope.$watch('classHierarchyData', function () {
            // when data changes unregister watchers by calling them
            if (prefixesWatch) prefixesWatch();
            if (currentClassCountWatch) currentClassCountWatch();
            if (searchedClassBroadcast) searchedClassBroadcast();
            if (onEnterClassSearchBroadcast) onEnterClassSearchBroadcast();

            // get initial state of prefixes (hidden or not) when changing repositories
            // in order to avoid triggering an unwanted prefixes watch
            var initialPrefixesState = getPrefixesState();

            if (scope.classHierarchyData.classCount) {
                sendSliderData();

                var rootData = _.cloneDeep(scope.classHierarchyData);

                var root = d3.hierarchy(rootData);

                function sortRoot(root) {
                    // add all classes to a flat array, add parent information
                    // and sort according to instancesCount DESC, depth ASC

                    return root.descendants()
                        .sort(function (a, b) {
                            if (a.data.sortingRank > b.data.sortingRank) {
                                return -1;
                            } else if (a.data.sortingRank < b.data.sortingRank) {
                                return 1;
                            } else if (a.data.depth > b.data.depth) {
                                return 1;
                            } else if (a.data.depth < b.data.depth) {
                                return -1;
                            } else {
                                return 0;
                            }
                        });
                }

                var sortedChildren = sortRoot(root);

                // we start with an empty new rootData
                var filteredRootData;
                var noPrefixesGlobal;


                function restoreDiagramState(currentRootData, switchPrefixes) {
                    const prefixesConfig = {
                        keepPrevState: true,
                        noPrefixes: getPrefixesState()
                    };

                    // get noPrefixes flag from drawDiagram configuration params
                    noPrefixesGlobal = prefixesConfig.noPrefixes;

                    if (filteredRootData) {
                        drawDiagram(filteredRootData, prefixesConfig, focus, true);
                    } else {
                        drawDiagram(currentRootData, prefixesConfig, focus, true);
                    }

                    $timeout(function () {
                        LocalStorageAdapter.set(LSKeys.CLASS_HIERARCHY_SWITCH_PREFIXES, switchPrefixes);
                        autoZoomToPreviousState();
                    }, 70);
                }

                function redrawFilteredDiagram(currentSliderValue, sortedChildrenArray, useSlider) {
                    if (!currentSliderValue) {
                        return;
                    }

                    LocalStorageAdapter.set(LSKeys.CLASS_HIERARCHY_CURRENT_SLIDER_VALUE, currentSliderValue);

                    filteredRootData = {
                        name: ROOT_OBJ_NAME,
                        children: []
                    };

                    // walk through the given count of (sortedChildrenArray) classes
                    // - record the id of each class we've seen
                    // - add the rootData level classes to the new rootData
                    const addedIds = new Set();
                    for (let k = 1; k <= currentSliderValue; k++) {
                        addedIds.add(sortedChildrenArray[k].data.id);
                        if (sortedChildrenArray[k].parent === sortedChildrenArray[0]) { // i.e. the parent is the "class hierarchy"
                            filteredRootData.children.push(sortedChildrenArray[k].data);
                        }
                    }

                    // walk through all the classes in the new rootData and only keep those that have an "added id"
                    // we create separate copies of the arrays in order not to contaminate the original data
                    // we also copy each class's object ($.extend ...) for the same reason
                    function fixChildren(node) {
                        if (!node.children) {
                            return;
                        }
                        const newChildren = [];
                        for (const child of node.children) {
                            if (addedIds.has(child.id)) {
                                newChildren.push($.extend({}, child));
                            }
                        }
                        node.children = newChildren;
                        for (const child of node.children) {
                            fixChildren(child);
                        }
                    }

                    fixChildren(filteredRootData);

                    if (useSlider) {
                        // redraw diagram when slider value changes and persist current state
                        // in local storage
                        noPrefixesGlobal = angular.isUndefined(noPrefixesGlobal) ? getPrefixesState() : noPrefixesGlobal;
                        const redrawConfig = {
                            noPrefixes: noPrefixesGlobal
                        };
                        drawDiagram(filteredRootData, redrawConfig);
                    } else {
                        // if the user returns to the diagram with back browser button
                        // read the saved state (show/hide prefixes, current slider value)
                        // from local storage and render the diagram according to the saved metrics
                        restoreDiagramState(rootData);
                    }
                }

                var currentSliderValue = LocalStorageAdapter.get(LSKeys.CLASS_HIERARCHY_CURRENT_SLIDER_VALUE);
                if (currentSliderValue) {
                    redrawFilteredDiagram(currentSliderValue, sortedChildren);
                } else {
                    var basicConfig = {
                        doFade: true,
                        keepPrevState: true,
                        noPrefixes: getPrefixesState()
                    };
                    drawDiagram(rootData, basicConfig);
                    autoZoomToPreviousState();
                }

                prefixesWatch = scope.$watch('hidePrefixes', function (hidePrefixes) {
                    if (angular.isUndefined(hidePrefixes) || initialPrefixesState) {
                        initialPrefixesState = undefined;
                        return;
                    }
                    // if digest overflows a possible fix might be wrapping this in $timeout
                    $timeout(function () {
                        savePrefixesState(hidePrefixes);
                        restoreDiagramState(rootData, true);
                    }, 50);
                }, true);

                currentClassCountWatch = scope.$watch('currentSliderValue', function (currentSliderValue) {
                    redrawFilteredDiagram(currentSliderValue, sortedChildren, true);
                }, true);

                // we handle this event for the cases where we already have searched for a given class and
                // hit enter again on the already selected class in order again react and zoom to it again
                // if we are not at the moment
                var currentSearchedClass;
                onEnterClassSearchBroadcast = scope.$on('onEnterKeypressSearchAction', function (event) {
                    if (currentSearchedClass) {
                        doFocus(currentSearchedClass);
                    }
                });

                searchedClassBroadcast = scope.$on('searchedClass', function (event, searchedClass) {
                    currentSearchedClass = flattenedClassData[searchedClass.name];
                    if (currentSearchedClass) {
                        doFocus(currentSearchedClass);
                    }
                });
            }
        }, true);
    }
}
