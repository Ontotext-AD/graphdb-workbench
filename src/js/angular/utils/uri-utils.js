angular
    .module('graphdb.framework.utils.uriutils', [])
    .factory('UriUtils', UriUtils);

function UriUtils() {
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

    return {
        validateRdfUri: validateRdfUri
    };
}
