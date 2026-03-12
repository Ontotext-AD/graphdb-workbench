import {GuideOptions} from './guide-options';

/**
 * Base interface for steps used in the interactive user guides. This object contains all the information, which
 * comes from the plugin and is used to create the step in the guide.
 */
export interface GuideStep {
  id: number;
  guideBlockName: string;
  options?: GuideOptions;
  title?: string;
  mainAction?: string;
  scrollOffset?: string | number;
  scrollToHandler?: () => void;
  stepN?: number;
  stepsTotalN?: number;
}
