import {GuideStep} from './guide-step';
import {StepOptions} from './step-options';

export interface InteractiveGuideResponse {
  guideId?: string | number;
  guideName?: string;
  guideDescription?: Record<string, string> | string;
  options?: StepOptions;
  guideLevel?: number;
  guideOrder?: number;
  steps: GuideStep[];
}
