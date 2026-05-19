import {ConnectorBuildStatus} from '../connector-build-status';

const buildStatus = (overrides: Partial<ConnectorBuildStatus> = {}) =>
  new ConnectorBuildStatus(
    overrides.status ?? 'BUILDING',
    overrides.processedEntities ?? 0,
    overrides.estimatedEntities ?? 0,
    overrides.indexedEntities ?? 0,
    overrides.entitiesPerSecond ?? 0,
    overrides.etaSeconds ?? 0,
    overrides.repair ?? false,
  );

describe('ConnectorBuildStatus', () => {
  describe('percentDone', () => {
    test('should return 0 when estimatedEntities is 0', () => {
      const status = buildStatus({processedEntities: 0, estimatedEntities: 0});
      expect(status.percentDone).toBe(0);
    });

    test('should compute percentage from processedEntities and estimatedEntities', () => {
      const status = buildStatus({processedEntities: 50, estimatedEntities: 100});
      expect(status.percentDone).toBe(50);
    });

    test('should return 100 when all entities are processed', () => {
      const status = buildStatus({processedEntities: 200, estimatedEntities: 200});
      expect(status.percentDone).toBe(100);
    });

    test('should recompute when processedEntities is mutated', () => {
      const status = buildStatus({processedEntities: 25, estimatedEntities: 100});
      expect(status.percentDone).toBe(25);
      status.processedEntities = 75;
      expect(status.percentDone).toBe(75);
    });

    test('should recompute when estimatedEntities is mutated', () => {
      const status = buildStatus({processedEntities: 100, estimatedEntities: 200});
      expect(status.percentDone).toBe(50);
      status.estimatedEntities = 100;
      expect(status.percentDone).toBe(100);
    });
  });

  describe('isBuilt', () => {
    test('should return true when status is BUILT', () => {
      const status = buildStatus({status: 'BUILT'});
      expect(status.isBuilt).toBe(true);
    });

    test('should return false when status is BUILDING', () => {
      const status = buildStatus({status: 'BUILDING'});
      expect(status.isBuilt).toBe(false);
    });

    test('should return false for any other status value', () => {
      for (const s of ['', 'INIT', 'ERROR', 'built']) {
        const status = buildStatus({status: s});
        expect(status.isBuilt).toBe(false);
      }
    });
  });
});
