import 'lib/d3.patch.js'
import {dispatch, pointer} from 'd3';

const d3 = {
  dispatch,
  pointer
}

var D3 = D3 || {};

D3.Text = function () {
    function calcFontSizeRaw(text, radius, minimumSize, isMultiline) {
        minimumSize = minimumSize || 10;

        var textSize = radius / 3;
        if (typeof text === "string") {
            var len = text.substring(0, radius / 3).length + 1.5;
            textSize *= 10 / len;
            textSize += 1;
            // experimental alternative method:
            // var textSize = 3.3 * radius / text.length;

            // Tweak for Indian scripts and CJK ones
            if (text.match(/[\u0900-\u0DFF\u1100-\u11FF\u2E80-\u2EFF\u3000-\u9FFF]/)) {
                textSize *= 0.6;
            }

            if (textSize < minimumSize) {
                textSize = minimumSize;
            }

            /* Disabled for the time being, better without this
            if (isMultiline) {
                var numWords = text.split(/\s+/).length;
                if (numWords > 1) {
                    if (numWords > 4) {
                        numWords = 4;
                    }
                    textSize += textSize * (4 - numWords) * 0.1;
                }
            }
            */

            return Math.round(textSize);
        }

        if (textSize < minimumSize) {
            textSize = minimumSize;
        }

        return Math.round(textSize);
    }

    function calcFontSize(text, radius, minimumSize, isMultiline) {
        return calcFontSizeRaw(text, radius, minimumSize, isMultiline) + 'px';
    }

    function getTextWithElipsisIfNeeded(str, threshold) {
        if (typeof str === "string") {
            if (str.length > threshold) {
                return str.substring(0, threshold - 3) + "...";
            }
        }
        return str;
    }

    return {
        calcFontSizeRaw: calcFontSizeRaw,
        calcFontSize: calcFontSize,
        getTextWithElipsisIfNeeded: getTextWithElipsisIfNeeded
    };
}();

D3.Transition = function () {
    function fadeIn(sel, duration) {
        sel.style("opacity", 0.0)
            .transition()
            .duration(duration)
            .style("opacity", 1.0);
    }

    function fadeOut(sel, duration) {
        sel.style("opacity", 1.0)
            .transition()
            .duration(duration)
            .style("opacity", 0.0);
    }

    return {
        fadeIn: fadeIn,
        fadeOut: fadeOut
    };
}();

D3.Click = function () {
    function delayDblClick() {
        var dispatchedEvent = d3.dispatch('click', 'dblclick');

        function cc(selection) {
            var down,
                tolerance = 5,
                last,
                wait = null;

            // euclidean distance
            function dist(a, b) {
                return Math.sqrt(Math.pow(a[0] - b[0], 2), Math.pow(a[1] - b[1], 2));
            }

            selection.on('mousedown', function () {
                down = d3.pointer(document.body);
                last = +new Date();
            });
            selection.on('mouseup', function (event, d) {
                if (dist(down, d3.pointer(document.body)) > tolerance) {
                    return;
                } else {
                    if (wait) {
                        window.clearTimeout(wait);
                        wait = null;
                        dispatchedEvent.call('dblclick', event, event, d);
                    } else {
                        wait = window.setTimeout((function (e) {
                            return function () {
                                dispatchedEvent.call('click', e, e, d)
                                wait = null;
                            };
                        })(event), 250);
                    }
                }
            });
        }

        return rebind(cc, dispatchedEvent, 'on');
    }

    // Copies a variable number of methods from source to target.
    const rebind = function (target, source) {
        let i = 1, n = arguments.length, method;
        while (++i < n) {
            method = arguments[i]
            target[method] = d3_rebind(target, source, source[method]);
        }
        return target;
    }

    // Method is assumed to be a standard D3 getter-setter:
    // If passed with no arguments, gets the value.
    // If passed with arguments, sets the value and returns the target.
    function d3_rebind(target, source, method) {
        return function () {
            var value = method.apply(source, arguments);
            return value === source ? target : value;
        };
    }

    return {
        delayDblClick: delayDblClick
    };
}();

export default D3;
