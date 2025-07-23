import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';
import {Service} from '../../providers/service/service';
import {GuideContext} from './model/guide-context';
import {intro} from './steps/intro';
import {openHome} from './steps/open-home';
import {openGuidesPage} from './steps/open-guides-page';
import {startGuide} from './steps/start-guide';
import {guideEnd} from './steps/end';

export class GuideEngineService implements Service {
  private tour: Shepherd.Tour;

  constructor() {
    this.next = this.next.bind(this);
    this.complete = this.complete.bind(this);

    this.tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shepherd-theme-arrows',
        scrollTo: true,
        cancelIcon: {
          enabled: true,
        },
      },
    });

    const ctx: GuideContext = {
      guideService: this
    };
    this.tour.addStep(intro(ctx));
    this.tour.addStep(openHome(ctx));
    this.tour.addStep(openGuidesPage(ctx));
    this.tour.addStep(startGuide(ctx));
    this.tour.addStep(guideEnd(ctx));
  }

  loadSteps(steps: Shepherd.Step[]) {
    this.tour.steps = steps;
  }

  addStep(step: Shepherd.Step) {
    this.tour.addStep(step);
  }

  next() {
    this.tour.next();
  }

  start() {
    this.tour.start();
  }

  stop() {
    this.tour.cancel();
  }

  complete() {
    this.tour.complete();
  }
}
