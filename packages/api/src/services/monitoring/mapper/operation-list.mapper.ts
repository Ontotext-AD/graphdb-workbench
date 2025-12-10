import {Mapper} from '../../../providers/mapper/mapper';
import {
  OperationList,
  Operation,
  OperationType,
  OperationResponse,
  OperationInit,
  OperationGroup
} from '../../../models/monitoring';

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
   * @returns A new OperationList instance containing the provided operations.
   */
  mapToModel(data: OperationResponse[]): OperationList {
    const operations = data
      .map(item => {
        const init: OperationInit = {
          type: item.type,
          status: item.status,
          value: item.value,
          id: item.id,
          href: item.href,
          group: item.group as OperationGroup | undefined,
        };

        return new Operation(init);
      })
      .sort(
        (a, b) => OPERATION_TYPE_SORT_ORDER[a.type] - OPERATION_TYPE_SORT_ORDER[b.type]
      );

    return new OperationList(operations);
  }
}
