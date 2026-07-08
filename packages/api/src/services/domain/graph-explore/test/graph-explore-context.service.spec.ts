import {GraphExploreContextService} from '../graph-explore-context.service';
import {DEFAULT_GRAPH_EXPLORE_SETTINGS} from '../graph-explore-settings.config';
import {GraphExploreSettings} from '../../../../models/graph-explore/graph-explore-settings';

describe('GraphExploreContextService', () => {
  let graphExploreContextService: GraphExploreContextService;

  beforeEach(() => {
    graphExploreContextService = new GraphExploreContextService();
  });

  describe('getDefaultSettings', () => {
    it('should fall back to the default settings config when no value has been set', () => {
      // Then the configured defaults are returned.
      expect(graphExploreContextService.getDefaultSettings()).toEqual(DEFAULT_GRAPH_EXPLORE_SETTINGS);
    });

    it('should return the settings stored in the context', () => {
      // Given custom default settings are set.
      const settings: GraphExploreSettings = {includeInferred: false, sameAs: false, languages: ['fr'], linksLimit: 50};
      graphExploreContextService.updateDefaultSettings(settings);

      // Then the stored settings are returned instead of the config defaults.
      expect(graphExploreContextService.getDefaultSettings()).toEqual(settings);
    });
  });

  describe('updateDefaultSettings', () => {
    it('should update the settings in the context and notify subscribers', () => {
      // Given a subscriber.
      const settings: GraphExploreSettings = {includeInferred: false, sameAs: true, languages: ['de'], linksLimit: 10};
      const mockCallback = jest.fn();
      graphExploreContextService.onDefaultSettingsChanged(mockCallback);

      // When updating the default settings.
      graphExploreContextService.updateDefaultSettings(settings);

      // Then the subscriber is notified with the new settings.
      expect(mockCallback).toHaveBeenLastCalledWith(settings);
    });
  });

  describe('onDefaultSettingsChanged', () => {
    it('should stop receiving updates after unsubscribe', () => {
      // Given a registered subscriber.
      const settings: GraphExploreSettings = {includeInferred: false, sameAs: false, languages: [], linksLimit: 1};
      const mockCallback = jest.fn();
      const unsubscribe = graphExploreContextService.onDefaultSettingsChanged(mockCallback);
      // Clear the immediate call performed on subscription.
      mockCallback.mockClear();

      // When unsubscribed.
      unsubscribe();

      // Then the subscriber is not notified of further changes.
      graphExploreContextService.updateDefaultSettings(settings);
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
});
