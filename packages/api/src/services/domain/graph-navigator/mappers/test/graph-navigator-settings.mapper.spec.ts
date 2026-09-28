import {mapGraphNavigatorSettingsResponseToModel} from '../graph-navigator-settings.mapper';
import {GraphNavigatorSettingsResponse} from '../../response/graph-navigator-settings-response';

describe('GraphNavigatorSettingsMapper', () => {
  test('should map the response to GraphNavigatorSettings, keeping the uploaded tag', () => {
    // Given I have a settings response
    const response: GraphNavigatorSettingsResponse = {
      uploaded: true,
      defaultPrefix: 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
      dataLabelProperty: 'rdfs:label',
      linkConfigurations: []
    };

    // When I map it
    const settings = mapGraphNavigatorSettingsResponseToModel(response);

    // Then I expect the query preset and the uploaded tag
    expect(settings).toEqual({
      uploaded: true,
      defaultPrefix: 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>',
      dataLabelProperty: 'rdfs:label',
      linkConfigurations: []
    });
  });

  test('should not share the response object with the model', () => {
    // Given I have a settings response
    const response: GraphNavigatorSettingsResponse = {uploaded: false, dataLabelProperty: 'rdfs:label'};

    // When I map it
    const settings = mapGraphNavigatorSettingsResponseToModel(response);

    // Then I expect a model that no longer changes with the response
    expect(settings).not.toBe(response);
    expect(settings.uploaded).toBe(false);
  });
});
