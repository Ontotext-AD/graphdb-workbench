import {ModelList} from '../common';

/**
 * Represents a list of authorities in an authenticated user.
 */
export class AuthorityList extends ModelList<string> {
  private readonly WILDCARD = '*';
  private readonly GQL_WILDCARD = '*:GRAPHQL';

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

  /**
   * Checks if the list contains a wildcard authority that matches the expected authority.
   *
   * This method searches through the authority list for wildcard authorities that end with
   * either '*' (for non-GraphQL) or '*:GRAPHQL' (for GraphQL), and determines if any of
   * these wildcard authorities would grant access to the specified expected authority.
   * A wildcard authority matches if the expected authority starts with the wildcard's prefix.
   *
   * @param expectedAuthority - The authority string to check against wildcard authorities in the list.
   * @param isGraphQl - Optional flag indicating whether to check for GraphQL wildcard rights ('*:GRAPHQL')
   *                  or standard format ('*'). Defaults to false if not provided.
   * @returns A boolean indicating whether a matching wildcard authority is found.
   *          Returns true if any wildcard authority in the list matches the expected authority,
   *          false otherwise.
   */
  hasWildcardAuthority(expectedAuthority: string, isGraphQl?: boolean): boolean {
    const wildcard = isGraphQl ? this.GQL_WILDCARD : this.WILDCARD;
    let hasAuthority = false;
    for (const grantedAuthority of this.items) {
      if (!grantedAuthority.endsWith(wildcard)) {
        continue;
      }
      const wildcardPrefix = grantedAuthority.substring(0, grantedAuthority.length - wildcard.length);
      if (expectedAuthority.startsWith(wildcardPrefix)) {
        hasAuthority = true;
        break;
      }
    }
    return hasAuthority;
  }
}
