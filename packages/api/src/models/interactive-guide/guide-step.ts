import type Tour from 'shepherd.js/src/types/tour';
import {StepOptions} from './step-options';
import Step from 'shepherd.js/src/types/step';
import {ScrollLocation} from './scroll-location';

/**
 * Base interface for steps used in the interactive user guides. This object contains all the information, which
 * comes from the plugin and is used to create the step in the guide.
 * It also contains all the additional properties that guide step plugins can provide,
 * which are used by the ShepherdService to create the step in the guide.
 */
export interface GuideStep {
  id: number;
  guideBlockName: string;
  options?: StepOptions;
  title?: string;
  mainAction?: string;
  scrollOffset?: ScrollLocation | number;
  scrollToHandler?: () => void;
  stepN?: number;
  stepsTotalN?: number;
  content?: string;
  extraContent?: string;
  extraContentClass?: string;
  elementSelector?: string | (() => string);
  url?: string;
  placement?: string;
  type?: string;
  class?: string;
  maxWaitTime?: number;
  canBePaused?: boolean;
  forceReload?: boolean;
  skipPoint?: boolean;
  skipButtonLabel?: string;
  skipFromHistory?: boolean;
  disablePreviousFlow?: boolean;
  disableNextFlow?: boolean;
  lastStep?: boolean;
  extraPadding?: number;
  allowScroll?: boolean;
  advanceOn?: Step.StepOptionsAdvanceOn;
  showOn?: (() => boolean);
  onNextClick?: (guide: Tour, stepDescription: GuideStep) => void | Promise<void>;
  onNextValidate?: (stepDescription: GuideStep) => Promise<boolean>;
  onPreviousClick?: (guide: Tour) => Promise<boolean | null | undefined>;
  beforeShowPromise?: (guide: Tour, stepDescription: GuideStep) => Promise<void>;
  initPreviousStep?: (services: unknown, stepId: number | string) => Promise<void>;
  show?: (guide: Tour, stepDescription: GuideStep) => () => void;
  hide?: (guide: Tour, stepDescription: GuideStep) => () => void;
}
