import Shepherd from 'shepherd.js';
import type Step from 'shepherd.js/src/types/step';
import type Tour from 'shepherd.js/src/types/tour';
import {Service} from '../../providers/service/service';
import {service} from '../../providers';
import {LoggerProvider} from '../logging/logger-provider';
import {OntoToastrService} from '../toastr';
import {GuideApi} from './guide-api';
import {GuideStorageService} from './guide-storage.service';
import {StepDescription} from './step-description';
import {navigate, getPathName} from '../utils';

const SMOOTH = 'smooth' as const;
const NEAREST = 'nearest' as const;

/**
 * Service wrapper around the <a href="https://shepherdjs.dev/docs/">Shepherd.js</a> tour library.
 *
 * Manages the lifecycle of an interactive guide: creating, starting, pausing, resuming, navigating
 * between steps, and persisting state via {@link GuideStorageService}.
 */
export class ShepherdService implements Service {
  private readonly logger = LoggerProvider.logger;
  private readonly toastrService = service(OntoToastrService);
  private readonly guideApi = service(GuideApi);
  private readonly guideStorage = service(GuideStorageService);

  private guideCancelSubscription: unknown;
  private guideCompleteSubscription: unknown;
  private guideAutostarted: boolean | null = null;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPause: () => void = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onCancel: () => void = () => {};

  // ── Public API ──────────────────────────────────────────────────────

  /**
   * Creates and starts a guide.
   *
   * @param guideId - Unique ID that identifies the guide.
   * @param stepsDescriptions - Array with core step descriptions.
   * @param startStepId - Step ID to start from. If absent the guide starts from the beginning.
   * @param isAutoStarted - Whether the guide was automatically started.
   * @param clearHistory - If true, clears the step history before starting.
   */
  startGuide(
    guideId: string,
    stepsDescriptions: StepDescription[] | undefined,
    startStepId?: string,
    isAutoStarted = false,
    clearHistory = true,
  ): void {
    if (isAutoStarted && this.guideStorage.isAutostartDisabled(guideId)) {
      return;
    } else {
      this.guideAutostarted = isAutoStarted;
    }

    if (clearHistory) {
      this.guideStorage.clearHistory();
    }

    if (!stepsDescriptions) {
      return;
    }

    const guide = this.createGuide(guideId);
    this.addGuideSteps(guide, stepsDescriptions);
    this.doStartGuide(guide, startStepId);
  }

  /**
   * Resumes a guide from the step where it was paused.
   */
  resumeGuide(guideId: string, stepsDescriptions: StepDescription[], startStepId?: string): void {
    this.guideStorage.clearPaused();
    this.startGuide(guideId, stepsDescriptions, startStepId, false, false);
  }

  isActive(): boolean {
    return !!Shepherd.activeTour && !this.isPaused();
  }

  isPaused(): boolean {
    return this.guideStorage.isPaused();
  }

  getGuideId(): string | null {
    return this.guideStorage.getGuideId();
  }

  getCurrentStepId(): string | null {
    return this.guideStorage.getCurrentStepId();
  }

  /**
   * Returns whether scrolling is allowed. Scrolling is allowed when no guide is active
   * or when the current step explicitly permits it via the `allowScroll` option.
   */
  isScrollingAllowed(): boolean {
    const allowScroll = (Shepherd.activeTour?.getCurrentStep()?.options as Record<string, unknown>)?.allowScroll;
    return !this.isActive() || !!allowScroll;
  }

  subscribeToGuideCancel(onCancel: () => void): void {
    if (typeof onCancel === 'function') {
      this.onCancel = onCancel;
    }
  }

  subscribeToGuidePause(onPause: () => void): void {
    if (typeof onPause === 'function') {
      this.onPause = onPause;
    }
  }

  getPreviousStepFromHistory(stepId: string): Step | undefined {
    const previousStepId = this.guideStorage.getPreviousStepIdFromHistory(stepId);
    return Shepherd.activeTour?.steps.find((step: Step) => step.id === previousStepId);
  }

  // ── Guide lifecycle ─────────────────────────────────────────────────

  private createGuide(guideId: string): Tour {
    this.subscribeToGuideCanceled();
    return new Shepherd.Tour({
      tourName: guideId,
      useModalOverlay: true,
      // TODO: confirmCancel will use a modal dialog once ModalService is migrated
      confirmCancel: false,
      defaultStepOptions: {
        classes: 'shadow-md bg-purple-dark',
        scrollTo: {
          behavior: SMOOTH,
          block: NEAREST,
          inline: NEAREST,
        },
      },
    });
  }

  private addGuideSteps(guide: Tour, stepsDescriptions: StepDescription[]): void {
    if (stepsDescriptions.length > 0) {
      guide.addStep(this.getFirstStep(guide, stepsDescriptions));
    }

    if (stepsDescriptions.length > 2) {
      for (let index = 1; index < stepsDescriptions.length - 1; index++) {
        guide.addStep(this.getMiddleStep(guide, stepsDescriptions, index));
      }
    }

    if (stepsDescriptions.length > 1) {
      guide.addStep(this.getLastStep(guide, stepsDescriptions.at(-1)!));
    }
  }

  private doStartGuide(guide: Tour, startStepId?: string): void {
    this.guideStorage.clearPaused();

    let stepIndex = guide.steps.findIndex((value: Step) => value.options.id === startStepId);
    if (stepIndex < 0) {
      stepIndex = 0;
    }

    const step = guide.steps[stepIndex];
    const stepOptions = step.options as Step.StepOptions & Record<string, unknown>;
    const url = stepOptions.url as string | undefined;
    if (url && url !== getPathName()) {
      navigate(url);
    }

    const attachTo = stepOptions.attachTo;
    if (attachTo?.element) {
      const maxWaitTime = stepOptions.maxWaitTime as number | undefined;
      this.guideApi.getOrWaitFor(attachTo.element as string, maxWaitTime)
        .then(() => guide.show(stepIndex))
        .catch((error) => {
          this.logger.error(String(error));
          this.toastrService.error(this.guideApi.translate(undefined, 'guide.start.unexpected.error.message'));
        });
    } else {
      guide.show(stepIndex);
    }
  }

  private subscribeToGuideCanceled(): void {
    const guideEndHandler = ({tour}: { tour: Tour }) => {
      this.guideStorage.clearAll();
      const currentStep = tour.getCurrentStep();
      if (currentStep && typeof currentStep.hide === 'function') {
        currentStep.hide();
      }
      this.guideAutostarted = null;
      if (this.onCancel) {
        this.onCancel();
      }
    };

    if (!this.guideCancelSubscription) {
      this.guideCancelSubscription = (Shepherd as unknown as Tour).on('cancel', guideEndHandler);
    }
    if (!this.guideCompleteSubscription) {
      this.guideCompleteSubscription = (Shepherd as unknown as Tour).on('complete', guideEndHandler);
    }
  }

  // ── Step creation ───────────────────────────────────────────────────

  private getFirstStep(guide: Tour, stepsDescriptions: StepDescription[]): Step.StepOptions {
    const nextStepDescription = stepsDescriptions.length > 1 ? stepsDescriptions[1] : undefined;
    return this.toGuideStep(guide, undefined, stepsDescriptions[0], nextStepDescription);
  }

  private getMiddleStep(guide: Tour, stepsDescriptions: StepDescription[], indexOfProcessedStep: number): Step.StepOptions {
    const currentStep = stepsDescriptions[indexOfProcessedStep];
    if (currentStep.lastStep) {
      return this.getLastStep(guide, currentStep);
    }
    return this.toGuideStep(guide, stepsDescriptions[indexOfProcessedStep - 1], currentStep, stepsDescriptions[indexOfProcessedStep + 1]);
  }

  private getLastStep(guide: Tour, lastStepDescription: StepDescription): Step.StepOptions {
    const step = this.toGuideStep(guide, undefined, lastStepDescription);
    const buttons = step.buttons as Step.StepOptionsButton[];
    buttons.push(this.getBackToGuidesButton(guide), this.getCancelButton(guide));
    return step;
  }

  private toGuideStep(
    guide: Tour,
    previousStepDescription: StepDescription | undefined,
    currentStepDescription: StepDescription,
    nextStepDescription?: StepDescription,
  ): Step.StepOptions {
    const step = this.toBaseGuideStep(guide, currentStepDescription, () => this.updateLocalStorage());
    const buttons: Step.StepOptionsButton[] = [];

    if (currentStepDescription.skipPoint) {
      buttons.push(this.getSkipButton(guide, currentStepDescription.skipButtonLabel));
    }

    if (!this.isDisablePreviousFlow(currentStepDescription) && previousStepDescription) {
      buttons.push(this.getPreviousButton(guide));
    }

    if (!this.isDisableNextFlow(currentStepDescription) && nextStepDescription) {
      buttons.push(this.getNextButton(guide, currentStepDescription, nextStepDescription));
    }

    step.buttons = buttons;
    return step;
  }

  private toBaseGuideStep(
    guide: Tour,
    stepDescription: StepDescription,
    onShow: () => void,
  ): Step.StepOptions {
    let attachTo: Step.StepOptionsAttachTo | undefined;
    if (stepDescription.elementSelector) {
      attachTo = {
        element: stepDescription.elementSelector as string,
        on: stepDescription.placement as Step.PopperPlacement,
      };
    }

    const title = this.guideApi.sanitize(this.guideApi.translate(undefined, stepDescription.title || ''));

    // Adds " — n/N" to titles if the step is part of a multistep process
    let extraTitle = '';
    if (stepDescription.stepsTotalN && stepDescription.stepsTotalN > 1) {
      const progress = document.createElement('span');
      progress.setAttribute('gdb-tooltip', this.guideApi.translate(undefined, 'guide.block.progress.tooltip', stepDescription as unknown as Record<string, string>));
      progress.setAttribute('tooltip-placement', 'bottom');
      progress.innerText = this.guideApi.translate(undefined, 'guide.block.progress', {
        n: String((stepDescription.stepN || 0) + 1),
        nn: String(stepDescription.stepsTotalN)
      });
      extraTitle = '&nbsp;&mdash;&nbsp;' + progress.outerHTML;
    }

    const text = (): string => {
      const content = this.toParagraph(this.guideApi.translate(undefined, stepDescription.content || ''));

      let extraContent = '';
      if (stepDescription.extraContent) {
        extraContent = this.toParagraph(
          this.guideApi.translate(undefined, stepDescription.extraContent, stepDescription as unknown as Record<string, string>),
          stepDescription.extraContentClass,
        );
      }
      return content + extraContent;
    };

    const clickable = stepDescription.type !== 'readonly';
    const extraPadding = stepDescription.extraPadding || 0;

    const step: Step.StepOptions & Record<string, unknown> = {
      id: String(stepDescription.id),
      title: title + extraTitle,
      text,
      url: stepDescription.url,
      maxWaitTime: stepDescription.maxWaitTime,
      cancelIcon: {enabled: true},
      attachTo,
      modalOverlayOpeningPadding: extraPadding,
      modalOverlayOpeningRadius: 0,
      canBePaused: stepDescription.canBePaused,
      advanceOn: stepDescription.advanceOn,
      showOn: stepDescription.showOn,
      scrollToHandler: stepDescription.scrollToHandler,
      classes: `guide-dialog ${stepDescription.class || ''}-guide-dialog`,
      beforeShowPromise: this.getBeforeShowPromise(guide, stepDescription),
      canClickTarget: clickable,
      keyboardNavigation: false,
      skipPoint: stepDescription.skipPoint,
      skipButtonLabel: stepDescription.skipButtonLabel,
      skipFromHistory: stepDescription.skipFromHistory,
      onPreviousClick: stepDescription.onPreviousClick,
      initPreviousStep: stepDescription.initPreviousStep,
      forceReload: stepDescription.forceReload,
      isLastStep: !!stepDescription.lastStep,
      allowScroll: stepDescription.allowScroll,
      when: {
        show: this.getShowFunction(guide, stepDescription, onShow),
      },
    };

    if (typeof stepDescription.hide === 'function' && step.when) {
      step.when.hide = stepDescription.hide(guide, stepDescription);
    }

    return step;
  }

  private getBeforeShowPromise(
    guide: Tour,
    stepDescription: StepDescription,
  ): (() => Promise<unknown>) | undefined {
    if (typeof stepDescription.beforeShowPromise === 'function') {
      return () => stepDescription.beforeShowPromise!(guide, stepDescription);
    }
    return undefined;
  }

  private getShowFunction(
    guide: Tour,
    stepDescription: StepDescription,
    onShow: () => void,
  ): () => void {
    if (typeof stepDescription.show === 'function') {
      return () => {
        stepDescription.show!(guide, stepDescription)();
        onShow();
        this.whenStepShow(stepDescription);
      };
    }

    return () => {
      onShow();
      this.whenStepShow(stepDescription);
    };
  }

  private whenStepShow(stepDescription: StepDescription): void {
    const currentStep = Shepherd.activeTour?.getCurrentStep();
    if (!currentStep) {
      return;
    }
    const currentStepElement = currentStep.getElement();
    if (!currentStepElement) {
      return;
    }

    this.addTotalProgress(currentStep, currentStepElement);
    this.addTypeIcon(currentStepElement, stepDescription);
  }

  // ── Buttons ─────────────────────────────────────────────────────────

  private getBackToGuidesButton(guide: Tour): Step.StepOptionsButton {
    return this.getButton(this.guideApi.translate(undefined, 'back.to.guides.btn'), () => this.backToGuides(guide), true);
  }

  private getCancelButton(guide: Tour): Step.StepOptionsButton {
    const cancelButton = this.getButton(this.guideApi.translate(undefined, 'common.close'), () => this.completeGuide(guide), true);
    cancelButton.classes += ' shepherd-cancel-button';
    return cancelButton;
  }

  private getSkipButton(guide: Tour, message?: string): Step.StepOptionsButton {
    const skipBtnLabel = this.guideApi.translate(undefined, message || '');
    return this.getButton(skipBtnLabel, () => this.skipSteps(guide), true);
  }

  private getPreviousButton(guide: Tour): Step.StepOptionsButton {
    const text = this.guideApi.translate(undefined, 'previous.btn');
    const action = this.getPreviousButtonAction(guide);
    const prevButton = this.getButton(text, action);
    prevButton.classes += ' shepherd-prev-button';
    return prevButton;
  }

  private getNextButton(
    guide: Tour,
    currentStepDescription: StepDescription,
    nextStepDescription: StepDescription,
  ): Step.StepOptionsButton {
    const text = this.guideApi.translate(undefined, 'next.btn');
    const action = this.getNextButtonAction(guide, currentStepDescription, nextStepDescription);
    const nextButton = this.getButton(text, action);
    nextButton.classes += ' shepherd-next-button';
    return nextButton;
  }

  private getButton(
    text: string,
    action: () => void,
    isSecondary = false,
  ): Step.StepOptionsButton {
    return {
      text,
      classes: isSecondary ? 'btn btn-secondary' : 'btn btn-primary',
      action: () => {
        action();
      },
    };
  }

  // ── Button actions ──────────────────────────────────────────────────

  private getPreviousButtonAction(guide: Tour): () => void {
    return () => {
      const nextStepId = this.guideStorage.getPreviousStepIdFromHistory();
      let nextStep: Step | undefined;

      if (nextStepId) {
        nextStep = guide.steps.find((step: Step) => step.options.id === nextStepId);
      } else {
        nextStep = guide.steps[0];
      }

      const currentStep = guide.getCurrentStep();
      if (!currentStep || !nextStep) {
        return;
      }

      currentStep.hide();

      const initPreviousStep = (currentStep.options as Record<string, unknown>).initPreviousStep as
        ((services: unknown, stepId: unknown) => Promise<void>) | undefined;

      const initPromise = typeof initPreviousStep === 'function'
        ? initPreviousStep({GuideUtils: this.guideApi, ShepherdService: this}, currentStep.options.id)
        : Promise.resolve();

      initPromise
        .then(() => {
          const onPreviousClick = (currentStep.options as Record<string, unknown>).onPreviousClick as
            ((guide: Tour) => Promise<boolean | null | undefined>) | undefined;

          if (typeof onPreviousClick === 'function') {
            onPreviousClick(guide)
              .then((stopStepNavigation) => {
                if (!stopStepNavigation) {
                  currentStep.hide();
                  guide.show(nextStep.id);
                }
              })
              .catch((error) => {
                this.logger.error(String(error));
                this.abortGuide(guide);
              });
            return;
          }

          const nextStepOptions = nextStep.options as Record<string, unknown>;
          if (nextStepOptions.forceReload || (nextStepOptions.url && nextStepOptions.url !== (currentStep.options as Record<string, unknown>).url)) {
            const nextUrl = nextStepOptions.url as string | undefined;
            if (nextUrl && getPathName() !== nextUrl) {
              navigate(nextUrl);
            }
          }

          currentStep.hide();
          guide.show(nextStep.id);
        })
        .catch((error) => {
          this.logger.error(String(error));
          this.abortGuide(guide);
        });
    };
  }

  private getNextButtonAction(
    guide: Tour,
    currentStepDescription: StepDescription,
    nextStepDescription: StepDescription,
  ): () => void {
    return () => {
      if (!currentStepDescription.onNextValidate) {
        return;
      }
      currentStepDescription.onNextValidate(currentStepDescription)
        .then((valid) => {
          if (valid) {
            if (typeof currentStepDescription.onNextClick === 'function') {
              const onNextResult = currentStepDescription.onNextClick(guide, currentStepDescription);
              if (onNextResult instanceof Promise) {
                onNextResult.catch(() => this.abortGuide(guide));
              }
            } else {
              if (nextStepDescription.url && (nextStepDescription.forceReload || nextStepDescription.url !== currentStepDescription.url)) {
                navigate(nextStepDescription.url);
              }
              guide.next();
            }
          }
        });
    };
  }

  // ── Guide actions ───────────────────────────────────────────────────

  private backToGuides(guide: Tour): void {
    navigate('guides');
    this.completeGuide(guide);
  }

  private completeGuide(guide: Tour): void {
    if (this.guideAutostarted) {
      const guideName = (guide as unknown as { options: { tourName?: string } }).options.tourName;
      if (guideName) {
        this.guideStorage.disableAutostart(guideName);
      }
    }
    guide.complete();
  }

  private abortGuide(guide: Tour): void {
    this.toastrService.error(this.guideApi.translate(undefined, 'guide.unexpected.error.message'));
    (guide as unknown as { options: Record<string, unknown> }).options.confirmCancel = false;
    guide.cancel();
  }

  private pauseGuide(guide: Tour): void {
    guide.hide();
    const currentStep = guide.getCurrentStep();
    if (!currentStep) {
      return;
    }
    const step = this.getStepWhichCanBePaused(guide.steps, currentStep.id);
    if (step) {
      const tourName = (step as unknown as { tour: { options: { tourName?: string } } }).tour?.options?.tourName;
      if (tourName) {
        this.guideStorage.saveStep(tourName, step.options.id as string);
      }
    }
    this.guideStorage.setPaused();

    // Remove steps from history that come after the step where the guide will be paused
    if (step) {
      let stepHistoryCleaned = false;
      while (!stepHistoryCleaned) {
        const history = this.guideStorage.getHistory();
        if (history.length > 0 && history.at(-1) !== step.options.id) {
          this.guideStorage.removeLastStepFromHistory();
          continue;
        }
        stepHistoryCleaned = true;
      }
    }

    this.onPause();
  }

  private skipSteps(guide: Tour): void {
    const currentStep = guide.getCurrentStep();
    if (!currentStep) {
      return;
    }
    const currentStepIndex = guide.steps.findIndex((step: Step) => currentStep.id === step.id);
    this.doStartGuide(guide, this.getNextSkipPointId(guide.steps, currentStepIndex));
  }

  private getNextSkipPointId(steps: Step[], currentStepIndex: number): string | undefined {
    for (let index = currentStepIndex + 1; index < steps.length; index++) {
      const step = steps[index];
      if ((step.options as Record<string, unknown>).skipPoint) {
        return step.id;
      }
    }
    return steps.at(-1)?.id;
  }

  private getStepWhichCanBePaused(steps: Step[], stepId: string): Step | undefined {
    const index = steps.findIndex((step: Step) => step.id === stepId);
    const step = steps[index];
    if ((step.options as Record<string, unknown>).canBePaused) {
      return step;
    }
    if (index > 0) {
      return this.getStepWhichCanBePaused(steps, steps[index - 1].id);
    }
    return undefined;
  }

  // ── Local storage ───────────────────────────────────────────────────

  private updateLocalStorage(): void {
    const activeTour = Shepherd.activeTour;
    if (!activeTour) {
      return;
    }
    const currentStep = activeTour.getCurrentStep();
    if (!currentStep) {
      return;
    }

    if ((currentStep.options as Record<string, unknown>).skipFromHistory) {
      this.logger.info('Current step skipped from history', currentStep.options.id);
      return;
    }

    const currentStepIndex = activeTour.steps.findIndex((step: Step) => step.id === currentStep.id);
    const lastSavedStepId = this.getCurrentStepId();
    const lastSavedStepIndex = activeTour.steps.findIndex((step: Step) => step.id === lastSavedStepId);

    if (currentStepIndex > lastSavedStepIndex) {
      this.guideStorage.addStepToHistory(currentStep.options.id as string);
    } else if (lastSavedStepIndex > currentStepIndex) {
      this.guideStorage.removeLastStepFromHistory();
    }

    const tourName = (activeTour as unknown as { options: { tourName?: string } }).options.tourName || '';
    this.guideStorage.saveStep(tourName, currentStep.options.id as string);
  }

  // ── UI helpers ──────────────────────────────────────────────────────

  private toParagraph(text: string, textClass?: string): string {
    if (text) {
      const p = document.createElement('p');
      if (textClass) {
        p.className = textClass;
      }
      p.innerHTML = text;
      return p.outerHTML;
    }
    return '';
  }

  private addTotalProgress(currentStep: Step, currentStepElement: HTMLElement): void {
    const steps = Shepherd.activeTour?.steps;
    if (!steps) {
      return;
    }
    const content = currentStepElement.querySelector('.shepherd-content');
    if (!content) {
      return;
    }

    const progress = document.createElement('div');
    progress.className = 'shepherd-progress';
    const progressText = document.createElement('span');
    progressText.className = 'text-muted';
    progressText.innerText = this.guideApi.translate(undefined, 'guide.total.progress',
      {
        n: String(steps.indexOf(currentStep) + 1),
        nn: String(steps.length)
      }
    );
    progressText.setAttribute('gdb-tooltip', this.guideApi.translate(undefined, 'guide.total.progress.tooltip'));
    progressText.setAttribute('tooltip-placement', 'left');
    progress.appendChild(progressText);
    content.appendChild(progress);
  }

  private addTypeIcon(currentStepElement: HTMLElement, stepDescription: StepDescription): void {
    let iconName: string;
    let iconTooltip: string;

    switch (stepDescription.type) {
    case 'clickable':
      iconName = 'focus';
      iconTooltip = 'mouse';
      break;
    case 'input':
      iconName = 'edit';
      iconTooltip = 'input';
      break;
    default:
      iconName = 'info';
      iconTooltip = 'info';
      break;
    }

    const typeIcon = document.createElement('span');
    typeIcon.className = 'shepherd-step-type icon-' + iconName + ' icon-1-25x';
    typeIcon.setAttribute('gdb-tooltip', this.guideApi.translate(undefined, 'guide.step-type.' + iconTooltip));
    typeIcon.setAttribute('tooltip-placement', 'bottom-right');

    const header = currentStepElement.querySelector('.shepherd-header');
    if (header) {
      header.insertBefore(typeIcon, header.firstChild);
    }
  }

  private isDisablePreviousFlow(stepDescription: StepDescription): boolean {
    return stepDescription.disablePreviousFlow ?? false;
  }

  private isDisableNextFlow(stepDescription: StepDescription): boolean {
    return stepDescription.disableNextFlow ?? false;
  }
}
