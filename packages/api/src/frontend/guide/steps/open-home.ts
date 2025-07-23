import {GuideContext} from '../model/guide-context';
import type {StepOptions} from 'shepherd.js';

export const openHome = function(ctx: GuideContext): StepOptions {
  console.log('%copenHome', 'background: red', ctx);
  return {
    id: 'open-home-step',
    text: 'Open <strong>home page</strong> by clicking the logo.',
    attachTo: {
      element: '.home-page',
      on: 'bottom'
    },
    advanceOn: {
      selector: '.home-page',
      event: 'click'
    },
    classes: 'example-step-extra-class',
    buttons: [
      // {
      //   text: 'Next',
      //   action: ctx.guideService.next
      // }
    ]
  };
};
