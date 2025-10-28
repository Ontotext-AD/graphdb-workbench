import {Authority} from './authority';

/**
 * Authorities UI Model
 * A mapping of authority types to repository-specific boolean flags indicating granted permissions.
 * Used in user's edit component permissions table and free access permissions table.
 */
export type AuthoritiesUiModel = {
  [Authority.READ_REPO]: Record<string, boolean>,
  [Authority.WRITE_REPO]: Record<string, boolean>,
  [Authority.GRAPHQL]: Record<string, boolean>
}
