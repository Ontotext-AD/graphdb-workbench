import type Tour from 'shepherd.js/src/types/tour';
import {GuideStep} from '../../models/plugins/plugins/interactive-guide/guide-step';
import Step from 'shepherd.js/src/types/step';

/**
 * Describes a single step as consumed by the ShepherdService.
 * This is the fully resolved step description after complex steps have been flattened by InteractiveGuide.
 * It extends {@link GuideStep} with the additional properties that guide step plugins can provide.
 */
export interface StepDescription extends GuideStep {
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
  onNextClick?: (guide: Tour, stepDescription: StepDescription) => void | Promise<void>;
  onNextValidate?: (stepDescription: StepDescription) => Promise<boolean>;
  onPreviousClick?: (guide: Tour) => Promise<boolean | null | undefined>;
  beforeShowPromise?: (guide: Tour, stepDescription: StepDescription) => Promise<void>;
  initPreviousStep?: (services: unknown, stepId: number | string) => Promise<void>;
  show?: (guide: Tour, stepDescription: StepDescription) => () => void;
  hide?: (guide: Tour, stepDescription: StepDescription) => () => void;
}
