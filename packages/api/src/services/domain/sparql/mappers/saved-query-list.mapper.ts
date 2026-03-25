import {service, MapperFn} from '../../../../providers';
import {SavedQueryListResponse} from '../response/saved-query-response';
import {SavedQuery, SavedQueryList} from '../../../../models/sparql';
import {SecurityContextService} from '../../security';

/**
 * Maps the response from the API to the SavedQueryList model.
 * @param data The response from the API, expected to be an array of saved queries.
 * @returns A SavedQueryList instance containing the mapped saved queries.
 */
export const mapSavedQueryListResponseToModel: MapperFn<SavedQueryListResponse, SavedQueryList> = (data) => {
  if (!data || !Array.isArray(data)) {
    return new SavedQueryList();
  }

  const securityContextService = service(SecurityContextService);
  const currentUsername = securityContextService.getAuthenticatedUser()?.username;

  const items = data.map((query) => {
    const readonly = currentUsername !== query.owner;
    return new SavedQuery({
      queryName: query.name,
      query: query.body,
      owner: query.owner,
      isPublic: query.shared,
      readonly: readonly
    });
  });

  return new SavedQueryList(items);
};
