import { Capability } from './capability';
import { ModelList } from '../common/model-list';

/**
 * Represents a list of capabilities in the license model.
 * Extends the ModelList class, specialized for Capability connectors.
 */
export class CapabilityList extends ModelList<Capability> {
  /**
   * Creates a new instance of CapabilityList.
   *
   * @param capabilities - An array of Capability connectors to initialize the list.
   *                       If not provided, an empty list will be created.
   */
  constructor(capabilities: Capability[]) {
    super(capabilities);
  }
}
