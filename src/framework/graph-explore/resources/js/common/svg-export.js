var SVG = SVG || {};

SVG.Export = function () {
    function getCSSRules(cssSourceFilePath) {
        var cssRules = $('link[href="' + cssSourceFilePath + '"]')[0].sheet.rules;
        var cssStr = "";
        _.each(cssRules, function (value) {
            cssStr += value.cssText;
        });
        return cssStr;
    }

    function generateBase64ImageSource() {
        // add needed xml namespace
        var exportSvg = d3.selectAll("svg")
            .attr({
                version: "1.1",
                xmlns: "http://www.w3.org/2000/svg"
            })
            .node().parentNode.innerHTML;

        // convert selected html to base64
        return "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(exportSvg)));
    }

    return {
        getCSSRules: getCSSRules,
        generateBase64ImageSource: generateBase64ImageSource
    };
}();
