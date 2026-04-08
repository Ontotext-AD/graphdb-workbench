import {SavedQuery} from '@ontotext/workbench-api';

export interface SavedQueryConfig {
  /**
   * If saved query was saved successfully.
   */
  saveSuccess: boolean;
  /**
   * The list of saved queries to be displayed to the user.
   *
   * Not using the SavedQueryList because the model expected by the Yasgui component is a simple array of SavedQuery objects.
   */
  savedQueries?: SavedQuery[];
  /**
   * Error message to be displayed if any error occurs.
   */
  errorMessage?: string[];
  /**
   * The link to the query that can be shared with other users.
   */
  shareQueryLink?: string;
}
