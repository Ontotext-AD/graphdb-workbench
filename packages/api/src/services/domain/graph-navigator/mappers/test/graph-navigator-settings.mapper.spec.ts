import {mapGraphNavigatorSettingsResponseToModel} from '../graph-navigator-settings.mapper';
import {GraphNavigatorSettingsResponse} from '../../response/graph-navigator-settings-response';
import {DEFAULT_SETTINGS_STUB} from '../../test/graph-navigator-settings-mock';
import {GraphNavigatorSettings} from '../../../../../models/graph-navigator';

describe('GraphNavigatorSettingsMapper', () => {
  test('should map the response to GraphNavigatorSettings, splitting the uploaded tag from the query preset', () => {
    // Given I have a settings response
    const response: GraphNavigatorSettingsResponse = {...DEFAULT_SETTINGS_STUB, uploaded: true};

    // When I map it
    const settings = mapGraphNavigatorSettingsResponseToModel(response);

    // Then I expect the query preset and the uploaded tag
    expect(settings).toBeInstanceOf(GraphNavigatorSettings);
    expect(settings).toEqual(new GraphNavigatorSettings({uploaded: true, providerSettings: DEFAULT_SETTINGS_STUB}));
  });

  test('should not share the response object with the model', () => {
    // Given I have a settings response
    const response: GraphNavigatorSettingsResponse = {...DEFAULT_SETTINGS_STUB, uploaded: false};

    // When I map it
    const settings = mapGraphNavigatorSettingsResponseToModel(response);

    // Then I expect a model that no longer changes with the response
    expect(settings.getProviderSettings()).not.toBe(response);
    expect(settings.getProviderSettings().fullTextSearch).not.toBe(response.fullTextSearch);
    expect(settings.getProviderSettings().linkConfigurations).not.toBe(response.linkConfigurations);
    expect(settings.getProviderSettings().propertyConfigurations).not.toBe(response.propertyConfigurations);
    expect(settings.isUploaded()).toBe(false);
  });
});
