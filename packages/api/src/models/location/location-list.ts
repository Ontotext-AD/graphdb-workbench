import {ModelList} from '../common';
import {Location} from './location';

/**
 * Represents a list of locations.
 */
export class LocationList extends ModelList<Location> {
  /**
   * Creates a new instance of LocationList.
   *
   * @param locations - An array of locations to initialize the list.
   *                       If not provided, an empty list will be created.
   */
  constructor(locations: Location[]) {
    super(locations);
  }
}
