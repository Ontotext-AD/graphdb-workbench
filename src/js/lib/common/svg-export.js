import * as d3 from "d3/build/d3";

var SVG = SVG || {};

SVG.Export = function () {
    function getCSSRules(cssSourceFilePath) {
        const cssRules = $('link[href="' + cssSourceFilePath + '"]')[0].sheet.rules;
        let cssStr = "";
        _.each(cssRules, function (value) {
            cssStr += value.cssText;
        });
        return cssStr;
    }

    function generateBase64ImageSource(svgSelectorClass) {
        if (!svgSelectorClass) {
            svgSelectorClass = "svg";
        }
        // add needed xml namespace
        const exportSvg = d3.selectAll(svgSelectorClass)
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .node().parentNode.innerHTML;

        // convert selected html to base64
        return "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(exportSvg)));
    }

    return {
        getCSSRules: getCSSRules,
        generateBase64ImageSource: generateBase64ImageSource
    };
}();

export default SVG;
