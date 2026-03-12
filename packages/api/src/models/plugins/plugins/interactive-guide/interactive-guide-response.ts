import {GuideStep} from './guide-step';
import {StepOptions} from './step-options';

export interface InteractiveGuideResponse {
  guideId?: string;
  guideName?: string;
  guideDescription?: string;
  options?: StepOptions;
  steps: GuideStep[];
}
