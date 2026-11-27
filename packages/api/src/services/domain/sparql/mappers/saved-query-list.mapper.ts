import {service, MapperFn} from '../../../../providers';
import {SavedQueryListResponse, SavedQueryResponse} from '../response/saved-query-response';
import {SavedQuery, SavedQueryList} from '../../../../models/sparql';
import {SecurityContextService} from '../../security';

/**
 * Maps the response from the API to the SavedQueryList model.
 * @param response The response from the API: an array of saved queries, or a single saved query, which is what the API
 * returns when one query is requested by name and it exists.
 * @returns A SavedQueryList instance containing the mapped saved queries.
 */
export const mapSavedQueryListResponseToModel: MapperFn<SavedQueryListResponse | SavedQueryResponse, SavedQueryList> = (response) => {
  if (!response) {
    return new SavedQueryList();
  }
  const data = Array.isArray(response) ? response : [response];

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
