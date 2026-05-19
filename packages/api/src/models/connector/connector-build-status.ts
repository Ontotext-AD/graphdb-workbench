import {Model} from '../common';

/**
 * Domain model representing the current build progress of a connector instance.
 */
export class ConnectorBuildStatus extends Model<ConnectorBuildStatus> {
  constructor(
    public status = '',
    public processedEntities = 0,
    public estimatedEntities = 0,
    public indexedEntities = 0,
    public entitiesPerSecond = 0,
    public etaSeconds = 0,
    public repair = false,
  ) {
    super();
  }

  get isBuilt(): boolean {
    return this.status === 'BUILT';
  }

  get percentDone(): number {
    if (!this.estimatedEntities) {
      return 0;
    }
    return Number.parseFloat((100 * this.processedEntities / this.estimatedEntities).toFixed(0));
  }
}
