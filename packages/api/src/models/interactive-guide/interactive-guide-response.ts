import {GuideStep} from './guide-step';
import {StepOptions} from './step-options';
import {GuideDescription} from './guide-description';

export interface InteractiveGuideResponse {
  guideId?: string | number;
  guideName?: string;
  guideDescription?: GuideDescription;
  options?: StepOptions;
  guideLevel?: number;
  guideOrder?: number;
  steps: GuideStep[];
}
