import {ModelList} from '../common';

/**
 * Represents a list of capabilities in the license model.
 */
export class CapabilityList extends ModelList<string> {
  /**
   * Creates a new instance of CapabilityList.
   *
   * @param capabilities - An array of capability to initialize the list.
   *                       If not provided, an empty list will be created.
   */
  constructor(capabilities: string[]) {
    super(capabilities);
  }
}
