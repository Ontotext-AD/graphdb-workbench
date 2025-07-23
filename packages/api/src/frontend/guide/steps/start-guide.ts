import {GuideContext} from '../model/guide-context';
import type {StepOptions} from 'shepherd.js';

export const startGuide = function(ctx: GuideContext): StepOptions {
  console.log('%cstartGuide', 'background: red', ctx);
  return {
    id: 'start-guide-step',
    text: 'You can select a guide from the list below and click on the start button.',
    attachTo: {
      element: '#actionsColumn',
      on: 'bottom'
    },
    beforeShowPromise: () => {
      console.log('%cstart guide promise', 'background: red',);
      return new Promise<void>((resolve) => {
        const checkExist = setInterval(() => {
          if (document.querySelector('#actionsColumn')) {
            clearInterval(checkExist);
            resolve();
          }
        }, 100);
      });
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
