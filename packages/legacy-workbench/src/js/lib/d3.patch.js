define(['d3'],
    function(d3) {
        (function() {

        // Node/CommonJS - require D3
            if (typeof (module) !== 'undefined' && typeof (exports) !== 'undefined' && typeof (d3) == 'undefined') {
                d3 = require('d3');
            }
        })();

        function attrsFunction(selection, map) {
            return selection.each(function () {
                var x = map.apply(this, arguments), s = select(this);
                for (var name in x) s.attr(name, x[name]);
            });
        }

        function attrsObject(selection, map) {
            for (var name in map) selection.attr(name, map[name]);
            return selection;
        }

        function selection_attrs(map) {
            return (typeof map === "function" ? attrsFunction : attrsObject)(this, map);
        }

        d3.selection.prototype.attrs = selection_attrs

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

        return d3;
    });
