angular.module('graphdb.framework.core.directives.uppercased', [])
    .directive('uppercased', function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function(input) {
                    return input ? input.toUpperCase() : '';
                });
                element.css('text-transform', 'uppercase');
            },
        };
    });
