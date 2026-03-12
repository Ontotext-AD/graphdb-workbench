import {GuideStep} from './guide-step';

export interface InteractiveGuideResponse {
  guideId?: string;
  guideName?: string;
  guideDescription?: string;
  options?: Record<string, unknown>;
  steps: GuideStep[];
}
