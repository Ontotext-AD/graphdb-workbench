import 'angular/rest/similarity.rest.service';
import {mapIndexesResponseToSimilarityIndex} from "../../rest/mappers/similarity-index-mapper";
import {SelectMenuOptionsModel} from "../../models/form-fields";
import {similarityIndexesMapper} from '../../ttyg/services/similarity-indexes.mapper';

const modules = ['graphdb.framework.rest.similarity.service'];

angular
    .module('graphdb.framework.core.services.similarity', modules)
    .factory('SimilarityService', SimilarityService);

SimilarityService.$inject = ['SimilarityRestService'];

function SimilarityService(SimilarityRestService) {
    /**
     * Fetches the similarity indexes for a given repository.
     * @param repository - The repository for which to fetch similarity indexes.
     * @returns {Promise<Record<string, string[] | Record<string, string[]>>>} The mapped vector fields of similarity indexes in format
     * <pre>
     * {
     *   elasticsearch: {
     *     "otkg-vector": ["docText1","docText2"],
     *     "otkg-vector-new": ["docText1"]
     *   },
     *   similarity: ["test","test1"],
     * }
     * </pre>
     */
    const getSimilarityIndexesWithVectorFields = (repository) => {
        return SimilarityRestService.getSimilarityIndexesWithVectorFields(repository).then((response) => {
            return similarityIndexesMapper(response.data);
        });
    };

    /**
     * Returns the similarity indexes for the repository with id <code>repositoryId</code> and location <code>repositoryLocation</code>.
     * If the repository ID and repository location are not provided, the currently selected repository will be used.
     *
     * @param {string | undefined} repositoryId - The repository id.
     * @param {string | undefined} repositoryLocation - The repository location.
     * @return {Promise<SimilarityIndex[]>}
     */
    const getIndexes = (repositoryId, repositoryLocation) => {
        return SimilarityRestService.getIndexes(repositoryId, repositoryLocation)
            .then((response) => mapIndexesResponseToSimilarityIndex(response.data));
    };

    /**
     * Returns the similarity indexes for the repository with id <code>repositoryId</code> and location <code>repositoryLocation</code> as a menu model.
     * If the repository ID and repository location are not provided, the currently selected repository will be used.
     *
     * @param {string | undefined} repositoryId - The repository id.
     * @param {string | undefined} repositoryLocation - The repository location.
     * @return {Promise<SelectMenuOptionsModel[]>}
     */
    const getIndexesAsMenuModel = (repositoryId, repositoryLocation) => {
        return getIndexes(repositoryId, repositoryLocation)
            .then((indexesModel) => {
                return indexesModel.map((index) => {
                    return new SelectMenuOptionsModel({label: index.name, value: index.name});
                });
            });
    };

    return {
        getIndexes,
        getIndexesAsMenuModel,
        getSimilarityIndexesWithVectorFields,
    };
}
