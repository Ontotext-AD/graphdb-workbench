var CirclePacking = CirclePacking || {};

CirclePacking.SingleChild = function () {
    /*
     Functions that enable single child circles to display properly, see
     http://stackoverflow.com/questions/22307486/d3-js-packed-circle-layout-how-to-adjust-child-radius
     */
    function addPlaceholders(node, first) {
        if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
                var child = node.children[i];
                addPlaceholders(child);
            }

            if (node.children.length === 1) {
                var placeholderSize = node.size * 1.2;
                if (first) {
                    placeholderSize = node.children[0].size * 0.1;
                }
                node.children.push({
                    name: 'placeholder', size: placeholderSize,
                    // children: []
                });
            }
        }
    }

    function removePlaceholders(nodes) {
        for (var i = nodes.length - 1; i >= 0; i--) {
            var node = nodes[i];

            if (node.data.name === 'placeholder') {
                nodes.splice(i, 1);
            } else {
                if (node.children) {
                    removePlaceholders(node.children);
                }
            }
        }
    }

    function centerNodes(nodes) {
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];

            if (node.children) {
                if (node.children.length === 1) {
                    var offset = node.x - node.children[0].x;
                    node.children[0].x += offset;
                    reposition(node.children[0], offset);
                }
            }
        }

        function reposition(node, offset) {
            if (node.children) {
                for (var i = 0; i < node.children.length; i++) {
                    node.children[i].x += offset;
                    reposition(node.children[i], offset);
                }
            }
        }
    }

    function makePositionsRelativeToZero(nodes) {
        //use this to have vis centered at 0,0,0 (easier for positioning)
        var offsetX = nodes[0].x;
        var offsetY = nodes[0].y;

        for (var i = 0; i < nodes.length; i++) {

            var node = nodes[i];

            node.x -= offsetX;
            node.y -= offsetY;
        }
    }

    return {
        addPlaceholders: addPlaceholders,
        removePlaceholders: removePlaceholders,
        centerNodes: centerNodes,
        makePositionsRelativeToZero: makePositionsRelativeToZero
    }
}();

export default CirclePacking;
