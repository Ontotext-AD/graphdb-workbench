import {GuideContext} from '../model/guide-context';
import type {StepOptions} from 'shepherd.js';

export const intro = function (ctx: GuideContext): StepOptions {
  console.log('%cintro', 'background: red', ctx);
  return {
    id: 'intro-step',
    text: 'This is the <strong>intro</strong> step.',
    attachTo: {
      element: '#startGuideButton',
      on: 'bottom'
    },
    classes: 'example-step-extra-class',
    buttons: [
      {
        text: 'Next',
        action: ctx.guideService.next
      }
    ]
  };
};
