angular
    .module('graphdb.framework.rest.guides.service', [])
    .factory('GuidesRestService', GuidesRestService);

GuidesRestService.$inject = ['$http'];


function GuidesRestService($http) {

    const GUIDES_LIST_URL = 'rest/guides';
    const GUIDES_DOWNLOAD_URL = `${GUIDES_LIST_URL}/download`;

    const getGuides = () => {
        return $http.get(GUIDES_LIST_URL);
    };

    const downloadGuideResource = (guideResourceName) => {
        return $http.get(`${GUIDES_DOWNLOAD_URL}/${guideResourceName}`);
    };

    return {
        getGuides,
        downloadGuideResource
    };
}
