const modules = [];

angular
    .module('graphdb.framework.import.directives.import-progress-indicator', modules)
    .directive('ImportProgressIndicator', ImportProgressIndicator);

ImportProgressIndicator.$inject = [];

// importDirectives.directive('filesOntoLoader',
function ImportProgressIndicator() {
    return {
        link: function (scope, element, attr) {
            scope.$watch('file.status', function () {
                if (scope.file.status === 'IMPORTING' || scope.file.status === 'UPLOADING') {
                    if (!$(element).has('object').length > 0) {
                        $(element).append('<object width="' + attr.size + '" height="' + attr.size + '" data="js/angular/templates/loader/ot-loader.svg?v=[AIV]{version}[/AIV]">{{\'common.loading\' | translate}}</object>');
                    }
                }
            });
        }
    };
}
