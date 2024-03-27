const modules = [];
angular
    .module('graphdb.framework.core.directives.recursive', modules)
    .directive('recursive', recursive);

recursive.$inject = ['$compile'];

function recursive($compile) {
    return {
        restrict: "EACM",
        priority: 100000,
        compile: function (tElement, tAttr) {
            var contents = tElement.contents().remove();
            var compiledContents;
            return function (scope, iElement, iAttr) {
                if (!compiledContents) {
                    compiledContents = $compile(contents);
                }
                iElement.append(
                    compiledContents(scope,
                        function (clone) {
                            return clone;
                        }));
            };
        }
    };
}
