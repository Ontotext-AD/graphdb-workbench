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
            query: queryData.body,
            // TODO: pass these from the component as well
            infer: queryData.inference || true,
            sameAs: queryData.sameAs || true
        });
    }

    function getBaseUrl() {
        return [location.protocol, '//', location.host, location.pathname].join('');
    }
}
