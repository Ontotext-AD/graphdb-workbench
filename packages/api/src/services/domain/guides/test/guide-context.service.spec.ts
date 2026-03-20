import {GuideContextService} from '../guide-context.service';

describe('GuideContextService', () => {
  let guideContextService: GuideContextService;

  beforeEach(() => {
    guideContextService = new GuideContextService();
  });

  describe('updatePaused / isPaused', () => {
    test('should return undefined when paused has not been set', () => {
      expect(guideContextService.isPaused()).toBeUndefined();
    });

    test('should return true after updatePaused is called with true', () => {
      guideContextService.updatePaused(true);
      expect(guideContextService.isPaused()).toBe(true);
    });

    test('should return false after updatePaused is called with false', () => {
      guideContextService.updatePaused(false);
      expect(guideContextService.isPaused()).toBe(false);
    });

    test('should reflect the latest value when updatePaused is called multiple times', () => {
      guideContextService.updatePaused(true);
      guideContextService.updatePaused(false);
      expect(guideContextService.isPaused()).toBe(false);
    });
  });
});
