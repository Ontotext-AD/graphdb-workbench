import { Plugin } from '../plugin';
import { GuideStep } from '../../../interactive-guide/guide-step';
import {StepOptions} from '../../../interactive-guide/step-options';

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
  options?: StepOptions;

  /**
   * Returns a single guide step defined by this plugin.
   *
   * @param options - Options passed to the step.
   * @param services - Bridge services passed through the guide execution context.
   * @returns {GuideStep} The guide step associated with this plugin.
   */
  getStep?: (options: StepOptions, services: unknown) => GuideStep;

  /**
   * Returns all guide steps defined by this plugin.
   *
   * @param options - Options passed to the step.
   * @param services - Bridge services passed through the guide execution context.
   * @returns {GuideStep[]} A list of guide steps.
   */
  getSteps?: (options: StepOptions, services: unknown) => GuideStep[];

  constructor(guidePlugin: Partial<GuidePlugin>) {
    super(guidePlugin);
    this.guideBlockName = guidePlugin.guideBlockName || '';
    this.getStep = guidePlugin.getStep;
    this.getSteps = guidePlugin.getSteps;
  }
}
