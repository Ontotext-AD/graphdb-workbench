import {RouteConstants} from "../utils/route-constants";

angular
    .module('graphdb.framework.sparql-editor.share-query.service', [])
    .factory('ShareQueryLinkService', ShareQueryLinkService);

function ShareQueryLinkService() {
    return {
        createShareSavedQueryLink,
        createShareQueryLink
    };

    function createShareSavedQueryLink(savedQueryName, owner) {
        let url = `${getBaseUrl()}?${RouteConstants.savedQueryName}=${encodeURIComponent(savedQueryName)}`;
        if (owner != null) {
            url += `&${RouteConstants.savedQueryOwner}=${encodeURIComponent(owner)}`;
        }
        return url;
    }

    function createShareQueryLink(queryData) {
        return getBaseUrl() + '?' + $.param({
            name: queryData.name,
            infer: queryData.inference,
            sameAs: queryData.sameAs,
            query: window.editor.getValue()
        });
    }

    function getBaseUrl() {
        return [location.protocol, '//', location.host, location.pathname].join('');
    }
}
