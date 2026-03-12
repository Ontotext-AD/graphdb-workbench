import {GuideStorageService} from '../guide-storage.service';
import {StorageMock} from '../../../utils/test/local-storage-mock';

describe('GuideStorageService', () => {
  let service: GuideStorageService;
  let storageMock: StorageMock;

  beforeEach(() => {
    storageMock = new StorageMock();
    service = new GuideStorageService();
    jest.spyOn(service, 'getStorage').mockReturnValue(storageMock);
  });

  // ── Guide ID ────────────────────────────────────────────────────────

  describe('getGuideId / setGuideId', () => {
    test('should return null when no guide ID is stored', () => {
      expect(service.getGuideId()).toBeNull();
    });

    test('should store and retrieve a guide ID', () => {
      service.setGuideId('star-wars');
      expect(service.getGuideId()).toBe('star-wars');
    });
  });

  // ── Current Step ────────────────────────────────────────────────────

  describe('getCurrentStepId / setCurrentStepId', () => {
    test('should return null when no step ID is stored', () => {
      expect(service.getCurrentStepId()).toBeNull();
    });

    test('should store and retrieve a step ID', () => {
      service.setCurrentStepId('42');
      expect(service.getCurrentStepId()).toBe('42');
    });
  });

  // ── Step History ────────────────────────────────────────────────────

  describe('getHistory', () => {
    test('should return an empty array when no history is stored', () => {
      expect(service.getHistory()).toEqual([]);
    });

    test('should return the stored history', () => {
      service.addStepToHistory('step-1');
      service.addStepToHistory('step-2');
      expect(service.getHistory()).toEqual(['step-1', 'step-2']);
    });
  });

  describe('addStepToHistory', () => {
    test('should append a step ID to the history', () => {
      service.addStepToHistory('step-1');
      service.addStepToHistory('step-2');
      service.addStepToHistory('step-3');
      expect(service.getHistory()).toEqual(['step-1', 'step-2', 'step-3']);
    });
  });

  describe('removeLastStepFromHistory', () => {
    test('should remove the last step ID from the history', () => {
      service.addStepToHistory('step-1');
      service.addStepToHistory('step-2');
      service.addStepToHistory('step-3');

      service.removeLastStepFromHistory();

      expect(service.getHistory()).toEqual(['step-1', 'step-2']);
    });

    test('should handle empty history gracefully', () => {
      service.removeLastStepFromHistory();
      expect(service.getHistory()).toEqual([]);
    });
  });

  describe('getPreviousStepIdFromHistory', () => {
    beforeEach(() => {
      service.addStepToHistory('step-1');
      service.addStepToHistory('step-2');
      service.addStepToHistory('step-3');
    });

    test('should return the step before the given step ID', () => {
      expect(service.getPreviousStepIdFromHistory('step-3')).toBe('step-2');
      expect(service.getPreviousStepIdFromHistory('step-2')).toBe('step-1');
    });

    test('should return undefined when the given step is the first', () => {
      expect(service.getPreviousStepIdFromHistory('step-1')).toBeUndefined();
    });

    test('should return the second-to-last entry when no step ID is given', () => {
      expect(service.getPreviousStepIdFromHistory()).toBe('step-2');
    });

    test('should return undefined when history has fewer than 2 entries and no step ID is given', () => {
      service.clearHistory();
      service.addStepToHistory('only-step');
      expect(service.getPreviousStepIdFromHistory()).toBeUndefined();
    });

    test('should return undefined when history is empty', () => {
      service.clearHistory();
      expect(service.getPreviousStepIdFromHistory()).toBeUndefined();
    });
  });

  describe('clearHistory', () => {
    test('should remove the step history', () => {
      service.addStepToHistory('step-1');
      service.clearHistory();
      expect(service.getHistory()).toEqual([]);
    });
  });

  // ── Pause State ─────────────────────────────────────────────────────

  describe('isPaused / setPaused / clearPaused', () => {
    test('should return false when no pause state is stored', () => {
      expect(service.isPaused()).toBe(false);
    });

    test('should return true after setPaused', () => {
      service.setPaused();
      expect(service.isPaused()).toBe(true);
    });

    test('should return false after clearPaused', () => {
      service.setPaused();
      service.clearPaused();
      expect(service.isPaused()).toBe(false);
    });
  });

  // ── Save Step ───────────────────────────────────────────────────────

  describe('saveStep', () => {
    test('should persist both guide ID and step ID', () => {
      service.saveStep('movies-guide', '7');
      expect(service.getGuideId()).toBe('movies-guide');
      expect(service.getCurrentStepId()).toBe('7');
    });
  });

  // ── Autostart ───────────────────────────────────────────────────────

  describe('isAutostartDisabled / disableAutostart', () => {
    test('should return false when no autostart state is stored', () => {
      expect(service.isAutostartDisabled('my-guide')).toBe(false);
    });

    test('should return true after disabling autostart for a guide', () => {
      service.disableAutostart('my-guide');
      expect(service.isAutostartDisabled('my-guide')).toBe(true);
    });

    test('should not affect other guides', () => {
      service.disableAutostart('guide-a');
      expect(service.isAutostartDisabled('guide-b')).toBe(false);
    });

    test('should preserve existing autostart state for other guides', () => {
      service.disableAutostart('guide-a');
      service.disableAutostart('guide-b');
      expect(service.isAutostartDisabled('guide-a')).toBe(true);
      expect(service.isAutostartDisabled('guide-b')).toBe(true);
    });
  });

  // ── Clear All ───────────────────────────────────────────────────────

  describe('clearAll', () => {
    test('should remove all guide-related data', () => {
      service.setGuideId('star-wars');
      service.setCurrentStepId('5');
      service.addStepToHistory('step-1');
      service.setPaused();

      service.clearAll();

      expect(service.getGuideId()).toBeNull();
      expect(service.getCurrentStepId()).toBeNull();
      expect(service.getHistory()).toEqual([]);
      expect(service.isPaused()).toBe(false);
    });

    test('should not affect autostart state', () => {
      service.disableAutostart('my-guide');
      service.clearAll();
      expect(service.isAutostartDisabled('my-guide')).toBe(true);
    });
  });
});

