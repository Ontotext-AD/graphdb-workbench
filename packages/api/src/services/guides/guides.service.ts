import {Service} from '../../providers/service/service';
import {service} from '../../providers';
import {LanguageContextService} from '../language';
import {RepositoryContextService} from '../repository';
import {OntoToastrService} from '../toastr';
import {ShepherdService} from './shepherd.service';
import {InteractiveGuide} from '../../models/plugins/plugins/interactive-guide/interactive-guide';
import {InteractiveGuideResponse} from '../../models/plugins/plugins/interactive-guide/interactive-guide-response';
import {WindowService} from '../window';
import {GuidePlugin, InteractiveGuideExtensionPoint} from '../../models/plugins';
import {GuideApi} from './guide-api';

export class GuidesService implements Service {
  private readonly shepherdService = service(ShepherdService);
  private readonly toastrService = service(OntoToastrService);
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly guideApi = service(GuideApi);

  /**
   * Creates a guide and starts it from <code>startStepId</code> if provided. Starts from the beginning otherwise.
   *
   *
   * Steps:
   * 1. Shows an error toast if the guide is not found;
   * 2. Adds index incrementation to the guide repository ID if it already exists in the repository context to ensure uniqueness;
   * 3. Converts complex steps to core steps;
   * 4. Starts or resumes the guide via ShepherdService.
   *
   * @param guideResponse - The guide to start. at this point the guide is a simple JSON object, which needs to be converted to an InteractiveGuide instance.
   * @param services the services passed to the steps
   * @param startStepId - The step ID to start from. If defined, the guide will be resumed from that step.
   * @param isAutoStarted - Whether the guide was automatically started.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  startGuide(guideResponse: InteractiveGuideResponse | undefined, services: Record<string, any>, startStepId?: string, isAutoStarted = false): void {
    const bundle = service(LanguageContextService).getLanguageBundle();
    if (!guideResponse) {
      this.toastrService.error(this.guideApi.translate(bundle, 'guides.error.guide-not-found'));
      return;
    }

    const guide = new InteractiveGuide(guideResponse);
    const repositoryIdBase = guide.getRepositoryIdBase();

    if (repositoryIdBase) {
      // repositoryIdBase in the options can be used as a template to find a free repository ID.
      // For example, setting repositoryIdBase to 'myrepo' will find the first free ID from:
      // - myrepo
      // - myrepo2
      // - myrepo3 and so on
      const repositoryList = this.repositoryContextService.getRepositoryList();
      guide.setRepositoryId(repositoryIdBase);
      for (let i = 2; repositoryList.findRepository(guide.getRepositoryId()!, '', true); i++) {
        guide.setRepositoryId(repositoryIdBase + i);
      }
    }

    guide.setTranslatedGuideName(this.guideApi.translate(bundle, guide.getName()));
    guide.setTranslatedGuideDescription(this.guideApi.translate(bundle, guide.getDescription()));

    const guidePlugins = WindowService.getPluginRegistry().get<GuidePlugin>(InteractiveGuideExtensionPoint.NAME);
    const stepDescriptions =  guide.toStepsDescriptions(guidePlugins, services);

    stepDescriptions.forEach((step, index) => {
      step.id = index;
      if (step.scrollOffset) {
        step.scrollToHandler = () => this.guideApi.scrollToOffset(step.scrollOffset!);
      }
    });

    if (startStepId) {
      this.shepherdService.resumeGuide(guide.getId(), stepDescriptions, startStepId);
    } else {
      this.shepherdService.startGuide(guide.getId(), stepDescriptions, startStepId, isAutoStarted);
    }

    // TODO: event for guide started. The legacy throws this event and the controller sets
    // $scope and $rootScope paused property to false
  }

  /**
   * Returns whether scrolling is allowed during the current guide state.
   * Scrolling is allowed when no guide is active or when the current step explicitly permits it.
   */
  isScrollingAllowed(): boolean {
    return this.shepherdService.isScrollingAllowed();
  }
}
