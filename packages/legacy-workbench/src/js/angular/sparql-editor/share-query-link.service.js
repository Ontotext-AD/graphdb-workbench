import {RouteConstants} from "../utils/route-constants";
import {WindowService} from '@ontotext/workbench-api';

angular
    .module('graphdb.framework.sparql-editor.share-query.service', [])
    .factory('ShareQueryLinkService', ShareQueryLinkService);

function ShareQueryLinkService() {
    return {
        createShareSavedQueryLink,
        createShareQueryLink,
    };

    function createShareSavedQueryLink(savedQueryName, owner) {
        const url = new URL(WindowService.getLocationHref());

        url.searchParams.set(RouteConstants.savedQueryName, savedQueryName);
        if (owner) {
            url.searchParams.set(RouteConstants.savedQueryOwner, owner);
        }

        return url.toString();
    }

    function createShareQueryLink(queryData) {
        const url = new URL(WindowService.getLocationHref());

        url.searchParams.set('name', queryData.name);
        url.searchParams.set('query', queryData.body);
        // TODO: pass these from the component as well
        url.searchParams.set('infer', queryData.inference || true);
        url.searchParams.set('sameAs', queryData.sameAs || true);

        return url.toString();
    }
}
