import {AbstractEpoolChart} from './abstract-epool-chart';

export class EpoolWritesChart extends AbstractEpoolChart {
    createDataHolder() {
        return [{
            key: this.translateService.instant('resource.epool.writes'),
            values: []
        }];
    }
    getValueFromData(data) {
        return data.entityPool.epoolWrites;
    }
}
