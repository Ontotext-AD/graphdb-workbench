import {AbstractEpoolChart} from './abstract-epool-chart';

export class EpoolReadsChart extends AbstractEpoolChart {
    createDataHolder() {
        return [{
            key: this.translateService.instant('resource.epool.reads'),
            values: []
        }];
    }
    getValueFromData(data) {
        return data.entityPool.epoolReads;
    }
}
