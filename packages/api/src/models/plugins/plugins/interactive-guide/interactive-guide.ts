import {Model} from '../../../common';
import {StepOptions} from './step-options';
import {GuideStep} from './guide-step';
import {InteractiveGuideResponse} from './interactive-guide-response';
import {GuidePlugin} from './guide-plugin';
import {
  GuideStepNotCorrectlyImplementedError
} from '../../../../error/guide-step-not-correctly-implemented-error/guide-step-not-correctly-implemented-error';
import {ObjectUtil} from '../../../../services/utils';

/**
 * Represents an interactive guide, which is a sequence of steps that can be used to guide users through a specific workflow or feature in the application.
 *
 * An `InteractiveGuide` contains a name, description, options, and a list of steps. The steps can be defined directly in the guide or can reference predefined steps provided by `GuidePlugin`s.
 */
export class InteractiveGuide extends Model<InteractiveGuide>{
  private readonly guideId: string;
  private readonly guideName: string;
  private readonly guideDescription: Record<string, string> | string;
  private readonly options: StepOptions;
  private readonly steps: GuideStep[];

  constructor(data: InteractiveGuideResponse) {
    super();
    this.guideId = data.guideId ? String(data.guideId) : '';
    this.guideName = data.guideName || '';
    this.guideDescription = data.guideDescription || '';
    this.options = data.options ?? {};
    this.steps = data.steps;
  }

  getId(): string {
    return this.guideId;
  }

  getName(): string {
    return this.guideName;
  }

  getDescription(): Record<string, string> | string {
    return this.guideDescription;
  }

  getSteps(): GuideStep[] {
    return this.steps;
  }

  getOptions(): StepOptions {
    return this.options;
  }

  getTranslatedGuideName(): string | undefined {
    return this.options.translatedGuideName as string;
  }

  setTranslatedGuideName(name: string) {
    this.options.translatedGuideName = name;
    return this;
  }

  getTranslatedGuideDescription(): string | undefined {
    return this.options.translatedGuideDescription as string;
  }

  setTranslatedGuideDescription(description: string) {
    this.options.translatedGuideDescription = description;
    return this;
  }

  getRepositoryId(): string | undefined {
    return this.options.repositoryId as string;
  }

  setRepositoryId(repositoryId: string) {
    this.options.repositoryId = repositoryId;
    return this;
  }

  getRepositoryIdBase(): string | undefined {
    return this.options.repositoryIdBase as string;
  }

  /**
   * Flattens the guide's complex steps into an array of fully resolved {@link GuideStep} objects
   * that the {@link ShepherdService} can consume directly.
   *
   * Each {@link GuideStep} in the guide is matched by its `guideBlockName` against the registered
   * {@link GuidePlugin}s. The plugin's `getStep` or `getSteps` method is called with the merged
   * options to produce the concrete step descriptions. Nested (complex) steps are resolved recursively.
   *
   * @param guidePlugins - The registered guide step plugins that provide individual step implementations.
   * @param services - The bridge services passed through the guide execution context to each plugin step.
   * @returns The flattened array of step descriptions ready for the tour engine.
   */
  toStepsDescriptions(guidePlugins: GuidePlugin[], services: unknown): GuideStep[] {
    return this.getSteps().flatMap((step) => this._getSteps(step, this.getOptions(), guidePlugins, services));
  }

  private _getSteps(complexStep: GuideStep | GuideStep[], parentOptions: StepOptions, guidePlugins: GuidePlugin[], services: unknown): GuideStep[] {
    if (Array.isArray(complexStep)) {
      return complexStep.flatMap((stepDescription) =>
        this._getSteps(stepDescription, {...parentOptions}, guidePlugins, services)
      );
    }

    const predefinedGuideStep = guidePlugins.find((predefinedStep) => predefinedStep.guideBlockName === complexStep.guideBlockName);

    if (!predefinedGuideStep) {
      return [];
    }

    const options = {...(predefinedGuideStep.options ?? {}), ...complexStep.options, ...parentOptions}; //NOSONAR

    let steps: GuideStep[] = [];

    if (predefinedGuideStep.getSteps) {
      steps = steps.concat(this._getSteps(
        ObjectUtil.deepCopy(predefinedGuideStep.getSteps(options, services)) as GuideStep[],
        parentOptions, guidePlugins, services
      ));
    } else if (predefinedGuideStep.getStep) {
      steps.push(ObjectUtil.deepCopy(predefinedGuideStep.getStep(options, services)) as GuideStep);
    } else {
      // All steps should have either getStep or getSteps method implemented. If not, it's an error in the plugin implementation.
      throw new GuideStepNotCorrectlyImplementedError(predefinedGuideStep.guideBlockName);
    }

    steps.forEach((step, index) => {
      step.stepN = index;
      step.stepsTotalN = steps.length;
    });

    return steps;
  }
}
