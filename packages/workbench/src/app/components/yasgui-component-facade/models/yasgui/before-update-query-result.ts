import {TranslationParameter} from '@ontotext/workbench-api';

/**
 * Status of the check that Yasgui runs before an update query.
 */
export enum BeforeUpdateQueryStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Result of the check that Yasgui runs before an update query. Yasgui shows the message in the result area and stops
 * the update when the status is {@link BeforeUpdateQueryStatus.ERROR}.
 */
export interface BeforeUpdateQueryResult {
  /** Whether Yasgui runs the update or stops it. */
  status: BeforeUpdateQueryStatus;
  /** Translation key of the message to show. */
  messageLabelKey?: string;
  /** Values for the `{{key}}` placeholders of the message. */
  parameters?: TranslationParameter[];
}
