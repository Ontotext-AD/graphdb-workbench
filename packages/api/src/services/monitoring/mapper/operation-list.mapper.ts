import {Mapper} from '../../../providers/mapper/mapper';
import {OperationList} from '../../../models/monitoring/operation-list';
import {Operation} from '../../../models/monitoring/operation';
import {OperationType} from '../../../models/monitoring/operation-type';
import {OperationResponse} from '../../../models/monitoring/operation-status-summary-response';
import {OperationInit} from '../../../models/monitoring/operation-init';

const OPERATION_TYPE_SORT_ORDER = {
  [OperationType.CLUSTER_HEALTH]: 0,
  [OperationType.BACKUP_AND_RESTORE]: 1,
  [OperationType.IMPORT]: 2,
  [OperationType.QUERIES]: 3,
  [OperationType.UPDATES]: 4
};

/**
 * Mapper class for converting an array of Operation objects to an OperationList model.
 */
export class OperationListMapper extends Mapper<OperationList> {
  /**
   * Maps an array of Operation objects to an OperationList model.
   * Sorts the operations by their type before mapping them to the OperationList model.
   *
   * @param data - An array of Operation objects to be mapped into an OperationList.
   *  * Accepts:
   * - OperationList - returned as-is
   * - Operation[] - wrapped in an OperationList
   * - OperationResponse[] - mapped to Operation instances
   * @returns A new OperationList instance containing the provided operations.
   */
  mapToModel(data: OperationResponse[] | Operation[] | OperationList): OperationList {
    if (data instanceof OperationList) {
      return data;
    }

    const items = Array.isArray(data) ? data : [];

    const operations = items
      .map(item => {
        if (item instanceof Operation) {
          return item;
        }

        const init: OperationInit = {
          type: item.type,
          status: item.status,
          value: item.value,
          id: item.id,
          href: item.href,
        };

        return new Operation(init);
      })
      .sort((a, b) => OPERATION_TYPE_SORT_ORDER[a.type] - OPERATION_TYPE_SORT_ORDER[b.type]);

    return new OperationList(operations);
  }
}
