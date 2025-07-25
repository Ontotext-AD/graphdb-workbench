import {ModelList} from '../common';

/**
 * Represents a list of authorities in an authenticated user.
 */
export class AuthorityList extends ModelList<string> {
  constructor(authorities?: string[]) {
    super(authorities);
  }

  /**
   * Checks if the list contains a specific authority.
   *
   * @param authority - The Authority string to check for in the list.
   * @returns A boolean indicating whether the specified authority is present in the list.
   *          Returns true if the authority is found, false otherwise.
   */
  hasAuthority(authority: string): boolean {
    return this.items.includes(authority);
  }
}
