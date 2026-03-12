import Shepherd from 'shepherd.js';
import {ShepherdService} from '../shepherd.service';
import {service} from '../../../../providers';
import {GuideStorageService} from '../guide-storage.service';

jest.mock('shepherd.js', () => {
  const mockTour = {
    on: jest.fn(),
    addStep: jest.fn(),
    steps: [],
    show: jest.fn(),
    hide: jest.fn(),
    cancel: jest.fn(),
    complete: jest.fn(),
    getCurrentStep: jest.fn(),
    findIndex: jest.fn(),
  };
  const MockShepherd = {
    activeTour: null as unknown,
    Tour: jest.fn().mockImplementation(() => mockTour),
  };
  return {__esModule: true, default: MockShepherd};
});

describe('ShepherdService', () => {
  let shepherdService: ShepherdService;
  const guideStorage = service(GuideStorageService);

  beforeEach(() => {
    jest.spyOn(guideStorage, 'isPaused').mockReturnValue(false);
    jest.spyOn(guideStorage, 'getGuideId').mockReturnValue(null);
    jest.spyOn(guideStorage, 'getCurrentStepId').mockReturnValue(null);
    jest.spyOn(guideStorage, 'getPreviousStepIdFromHistory').mockReturnValue(undefined);
    jest.spyOn(guideStorage, 'clearPaused').mockImplementation();
    jest.spyOn(guideStorage, 'clearHistory').mockImplementation();
    jest.spyOn(guideStorage, 'isAutostartDisabled').mockReturnValue(false);
    (Shepherd as unknown as {activeTour: unknown}).activeTour = null;
    shepherdService = new ShepherdService();
  });

  describe('isActive', () => {
    test('should return false when there is no active tour', () => {
      (Shepherd as unknown as {activeTour: unknown}).activeTour = null;

      expect(shepherdService.isActive()).toBe(false);
    });

    test('should return false when there is an active tour but the guide is paused', () => {
      (Shepherd as unknown as {activeTour: unknown}).activeTour = {};
      jest.spyOn(guideStorage, 'isPaused').mockReturnValue(true);

      expect(shepherdService.isActive()).toBe(false);
    });

    test('should return true when there is an active tour and the guide is not paused', () => {
      (Shepherd as unknown as {activeTour: unknown}).activeTour = {};
      jest.spyOn(guideStorage, 'isPaused').mockReturnValue(false);

      expect(shepherdService.isActive()).toBe(true);
    });
  });

  describe('isPaused', () => {
    test('should return false when the guide is not paused', () => {
      jest.spyOn(guideStorage, 'isPaused').mockReturnValue(false);

      expect(shepherdService.isPaused()).toBe(false);
    });

    test('should return true when the guide is paused', () => {
      jest.spyOn(guideStorage, 'isPaused').mockReturnValue(true);

      expect(shepherdService.isPaused()).toBe(true);
    });
  });

  describe('getGuideId', () => {
    test('should return null when no guide is active', () => {
      jest.spyOn(guideStorage, 'getGuideId').mockReturnValue(null);

      expect(shepherdService.getGuideId()).toBeNull();
    });

    test('should return the guide ID from storage', () => {
      jest.spyOn(guideStorage, 'getGuideId').mockReturnValue('my-guide');

      expect(shepherdService.getGuideId()).toBe('my-guide');
    });
  });

  describe('getCurrentStepId', () => {
    test('should return null when no step is active', () => {
      jest.spyOn(guideStorage, 'getCurrentStepId').mockReturnValue(null);

      expect(shepherdService.getCurrentStepId()).toBeNull();
    });

    test('should return the current step ID from storage', () => {
      jest.spyOn(guideStorage, 'getCurrentStepId').mockReturnValue('step-1');

      expect(shepherdService.getCurrentStepId()).toBe('step-1');
    });
  });

  describe('isScrollingAllowed', () => {
    test('should return true when no guide is active', () => {
      (Shepherd as unknown as {activeTour: unknown}).activeTour = null;

      expect(shepherdService.isScrollingAllowed()).toBe(true);
    });

    test('should return false when a guide is active and allowScroll is not set', () => {
      (Shepherd as unknown as {activeTour: unknown}).activeTour = {
        getCurrentStep: jest.fn().mockReturnValue({options: {}}),
      };

      expect(shepherdService.isScrollingAllowed()).toBe(false);
    });

    test('should return true when a guide is active and allowScroll is true', () => {
      (Shepherd as unknown as {activeTour: unknown}).activeTour = {
        getCurrentStep: jest.fn().mockReturnValue({options: {allowScroll: true}}),
      };

      expect(shepherdService.isScrollingAllowed()).toBe(true);
    });
  });

  describe('subscribeToGuideCancel', () => {
    test('should register the callback when a function is provided', () => {
      const onCancel = jest.fn();
      shepherdService.subscribeToGuideCancel(onCancel);

      expect(shepherdService.onCancel).toBe(onCancel);
    });

    test('should not replace the callback when a non-function is provided', () => {
      const original = shepherdService.onCancel;
      shepherdService.subscribeToGuideCancel(null as unknown as () => void);

      expect(shepherdService.onCancel).toBe(original);
    });
  });

  describe('subscribeToGuidePause', () => {
    test('should register the callback when a function is provided', () => {
      const onPause = jest.fn();
      shepherdService.subscribeToGuidePause(onPause);

      expect(shepherdService.onPause).toBe(onPause);
    });

    test('should not replace the callback when a non-function is provided', () => {
      const original = shepherdService.onPause;
      shepherdService.subscribeToGuidePause(null as unknown as () => void);

      expect(shepherdService.onPause).toBe(original);
    });
  });

  describe('getPreviousStepFromHistory', () => {
    test('should return undefined when there is no active tour', () => {
      (Shepherd as unknown as {activeTour: unknown}).activeTour = null;
      jest.spyOn(guideStorage, 'getPreviousStepIdFromHistory').mockReturnValue('step-0');

      expect(shepherdService.getPreviousStepFromHistory('step-1')).toBeUndefined();
    });

    test('should return undefined when the previous step ID is not found in the tour steps', () => {
      jest.spyOn(guideStorage, 'getPreviousStepIdFromHistory').mockReturnValue('step-0');
      (Shepherd as unknown as {activeTour: unknown}).activeTour = {
        steps: [{id: 'step-1', options: {id: 'step-1'}}],
      };

      expect(shepherdService.getPreviousStepFromHistory('step-1')).toBeUndefined();
    });

    test('should return the matching step when the previous step ID is found in the tour steps', () => {
      const previousStep = {id: 'step-0', options: {id: 'step-0'}};
      jest.spyOn(guideStorage, 'getPreviousStepIdFromHistory').mockReturnValue('step-0');
      (Shepherd as unknown as {activeTour: unknown}).activeTour = {
        steps: [previousStep, {id: 'step-1', options: {id: 'step-1'}}],
      };

      expect(shepherdService.getPreviousStepFromHistory('step-1')).toBe(previousStep);
    });
  });

  describe('startGuide', () => {
    test('should return early when isAutoStarted is true and autostart is disabled for the guide', () => {
      jest.spyOn(guideStorage, 'isAutostartDisabled').mockReturnValue(true);
      const createGuideSpy = jest.spyOn(Shepherd, 'Tour');

      shepherdService.startGuide('my-guide', [], undefined, true);

      expect(createGuideSpy).not.toHaveBeenCalled();
    });

    test('should return early when stepsDescriptions is undefined', () => {
      const createGuideSpy = jest.spyOn(Shepherd, 'Tour');

      shepherdService.startGuide('my-guide', undefined);

      expect(createGuideSpy).not.toHaveBeenCalled();
    });

    test('should clear history when clearHistory is true', () => {
      shepherdService.startGuide('my-guide', undefined, undefined, false, true);

      expect(guideStorage.clearHistory).toHaveBeenCalled();
    });

    test('should not clear history when clearHistory is false', () => {
      shepherdService.startGuide('my-guide', undefined, undefined, false, false);

      expect(guideStorage.clearHistory).not.toHaveBeenCalled();
    });
  });

  describe('resumeGuide', () => {
    test('should clear paused state and start the guide without clearing history', () => {
      const startGuideSpy = jest.spyOn(shepherdService, 'startGuide').mockImplementation();

      shepherdService.resumeGuide('my-guide', [], 'step-1');

      expect(guideStorage.clearPaused).toHaveBeenCalled();
      expect(startGuideSpy).toHaveBeenCalledWith('my-guide', [], 'step-1', false, false);
    });
  });
});
