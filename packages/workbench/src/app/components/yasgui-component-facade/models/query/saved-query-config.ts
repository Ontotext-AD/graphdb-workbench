import {SavedQuery} from '@ontotext/workbench-api';

export interface SavedQueryConfig {
  /**
   * The list of saved queries to be displayed to the user.
   *
   * Not using the SavedQueryList because the model expected by the Yasgui component is a simple array of SavedQuery objects.
   */
  savedQueries?: SavedQuery[];
}
