import {Operation} from './operation';
import {ModelList} from '../common';

/**
 * Represents a list of Operation objects.
 */
export class OperationList extends ModelList<Operation> {
  /**
   * Creates a new instance of OperationList.
   *
   * @param operations - An array of Operation objects to initialize the list.
   */
  constructor(operations: Operation[]) {
    super(operations);
  }
}
