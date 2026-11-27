import {SavedQuery} from '@ontotext/workbench-api';
import {mapSavedQueryToTabQueryModel} from './saved-query-to-tab-query-model.mapper';

describe('mapSavedQueryToTabQueryModel', () => {
  it('should map all saved query fields to the tab query model', () => {
    // Given a saved query with a name
    const savedQuery = new SavedQuery({
      queryName: 'My query',
      query: 'SELECT * WHERE {?s ?p ?o}',
      owner: 'admin',
      isPublic: true,
      readonly: true,
    });

    // When it is mapped to a tab query model
    const tabQueryModel = mapSavedQueryToTabQueryModel(savedQuery);

    // Then every field is kept
    expect(tabQueryModel.queryName).toBe('My query');
    expect(tabQueryModel.query).toBe('SELECT * WHERE {?s ?p ?o}');
    expect(tabQueryModel.owner).toBe('admin');
    expect(tabQueryModel.isPublic).toBe(true);
    expect(tabQueryModel.readonly).toBe(true);
  });

  it('should leave the tab name undefined when the saved query has no name', () => {
    // Given a query without a name, as opened from a link with only a query
    const savedQuery = new SavedQuery({query: 'SELECT * WHERE {?s ?p ?o}'});

    // When it is mapped to a tab query model
    const tabQueryModel = mapSavedQueryToTabQueryModel(savedQuery);

    // Then the tab name is undefined, so the editor gives the tab its default name
    expect(tabQueryModel.queryName).toBeUndefined();
  });
});
