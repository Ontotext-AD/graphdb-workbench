const exploreDirectives = angular.module('graphdb.framework.explore.directives', []);

exploreDirectives.directive('uri', function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attr, ngModel) {

            // TODO: This function is found duplicated in tree more files. Find out how to reuse it.
            function validateRdfUri(value) {
                const hasAngleBrackets = value.indexOf("<") >= 0 && value.indexOf(">") >= 0;
                const noAngleBrackets = value.indexOf("<") === -1 && value.lastIndexOf(">") === -1;
                const validProtocol = /^<?(http|urn).*>?/.test(value) && (hasAngleBrackets || noAngleBrackets);
                let validPath = false;
                if (validProtocol) {
                    if (value.indexOf("http") >= 0) {
                        const schemaSlashesIdx = value.indexOf('//');
                        validPath = schemaSlashesIdx > 4
                            && value.substring(schemaSlashesIdx + 2).length > 0;
                    } else if (value.indexOf("urn") >= 0) {
                        validPath = value.substring(4).length > 0;
                    }
                }
                return validProtocol && validPath;
            }

            //For DOM -> model validation
            ngModel.$parsers.unshift(function (value) {
                if (!angular.isUndefined(value) && value.length > 0) {
                    const isValidUri = validateRdfUri(value);
                    ngModel.$setValidity('searchStr', isValidUri);
                    return isValidUri ? value : undefined;
                } else {
                    ngModel.$setValidity('searchStr', true);
                    return value;
                }
            });

            //For model -> DOM validation
            ngModel.$formatters.unshift(function (value) {
                if (!angular.isUndefined(value)) {
                    ngModel.$setValidity('searchStr', validateRdfUri);
                }
                return value;
            });
        }
    };
});
