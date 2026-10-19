import {GraphNavigatorContextService} from '../graph-navigator-context.service';
import {GraphNavigatorSettings} from '../../../../models/graph-navigator';
import {DEFAULT_SETTINGS_STUB} from './graph-navigator-settings-mock';

describe('GraphNavigatorContextService', () => {
  const SETTINGS = new GraphNavigatorSettings({uploaded: false, providerSettings: DEFAULT_SETTINGS_STUB});
  let graphNavigatorContextService: GraphNavigatorContextService;

  beforeEach(() => {
    graphNavigatorContextService = new GraphNavigatorContextService();
  });

  describe('getSettings', () => {
    it('should return undefined when no value has been set', () => {
      // Then no settings are returned.
      expect(graphNavigatorContextService.getSettings()).toBeUndefined();
    });

    it('should return the settings stored in the context', () => {
      // Given settings are set.
      graphNavigatorContextService.updateSettings(SETTINGS);

      // Then the stored settings are returned.
      expect(graphNavigatorContextService.getSettings()).toEqual(SETTINGS);
    });
  });

  describe('updateSettings', () => {
    it('should clear the settings', () => {
      // Given settings are set.
      graphNavigatorContextService.updateSettings(SETTINGS);

      // When clearing the settings.
      graphNavigatorContextService.updateSettings(undefined);

      // Then no settings are returned.
      expect(graphNavigatorContextService.getSettings()).toBeUndefined();
    });
  });
});
