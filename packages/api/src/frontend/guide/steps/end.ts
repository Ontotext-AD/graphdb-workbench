import {GuideContext} from '../model/guide-context';
import type {StepOptions} from 'shepherd.js';

export const guideEnd = function (ctx: GuideContext): StepOptions {
  console.log('%cguideEnd', 'background: red', ctx);
  return {
    id: 'guide-end-step',
    text: 'You have finished the guides intro.',
    classes: 'example-step-extra-class',
    buttons: [
      {
        text: 'Done',
        action: ctx.guideService.complete
      }
    ]
  };
};
