import { Plugin } from '../plugin';
import { GuideStep } from './guide-step';

/**
 * Represents a plugin that provides a step for interactive guide or tutorial.
 *
 * A `GuidePlugin` defines one or more guide steps, which can be used to create guide within the application.
 */
export class GuidePlugin extends Plugin {
  /**
   * The name of the guide step.
   */
  guideBlockName: string;

  /**
   * Returns a single guide step defined by this plugin.
   *
   * @returns {GuideStep} The guide step associated with this plugin.
   */
  getStep?: () => GuideStep;

  /**
   * Returns all guide steps defined by this plugin.
   *
   * @returns {GuideStep[]} A list of guide steps.
   */
  getSteps?: () => GuideStep[];

  constructor(guidePlugin: Partial<GuidePlugin>) {
    super(guidePlugin);
    this.guideBlockName = guidePlugin.guideBlockName || '';
    this.getStep = guidePlugin.getStep;
    this.getSteps = guidePlugin.getSteps;
  }
}
