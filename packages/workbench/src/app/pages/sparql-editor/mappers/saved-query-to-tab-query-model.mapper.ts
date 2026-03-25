import {MapperFn, SavedQuery} from '@ontotext/workbench-api';
import {TabQueryModel} from '../../../components/yasgui-component-facade/models/yasgui/tab-query-model';

/**
 * Maps a {@link SavedQuery} to a {@link TabQueryModel}.
 *
 * @param data - The {@link SavedQuery} to be mapped.
 * @returns The mapped {@link TabQueryModel}.
 */
export const mapSavedQueryToTabQueryModel: MapperFn<SavedQuery, TabQueryModel> = (data) => {
  return new TabQueryModel(
    data.queryName, data.query, data.owner, data.isPublic, data.readonly
  );
};
