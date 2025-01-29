import {ModelList} from '../common';
import {Authority} from './authority';

/**
 * Represents a list of authorities in an authenticated user.
 */
export class AuthorityList extends ModelList<Authority> {
  constructor(authorities?: Authority[]) {
    super(authorities);
  }

  /**
   * Checks if the list contains a specific authority.
   *
   * @param authority - The Authority object to check for in the list.
   * @returns A boolean indicating whether the specified authority is present in the list.
   *          Returns true if the authority is found, false otherwise.
   */
  hasAuthority(authority: Authority): boolean {
    return this.items.includes(authority);
  }
}
