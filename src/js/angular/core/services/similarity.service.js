import 'angular/rest/similarity.rest.service';
import {mapIndexesResponseToSimilarityIndex} from "../../rest/mappers/similarity-index-mapper";
import {SelectMenuOptionsModel} from "../../models/form-fields";

const modules = ['graphdb.framework.rest.similarity.service'];

angular
    .module('graphdb.framework.core.services.similarity', modules)
    .factory('SimilarityService', SimilarityService);

SimilarityService.$inject = ['SimilarityRestService'];

function SimilarityService(SimilarityRestService) {

    /**
     * Returns the similarity indexes.
     * @return {Promise<SimilarityIndex[]>}
     */
    const getIndexes = () => {
        return SimilarityRestService.getIndexes()
            .then((response) => mapIndexesResponseToSimilarityIndex(response.data));
    };

    /**
     * Returns the indexes as a menu model.
     * @return {Promise<SelectMenuOptionsModel[]>}
     */
    const getIndexesAsMenuModel = () => {
        return getIndexes()
            .then((indexesModel) => {
                return indexesModel.map((index) => {
                    return new SelectMenuOptionsModel({label: index.name, value: index.name});
                });
            });
    };

    return {
        getIndexes,
        getIndexesAsMenuModel
    };
}
