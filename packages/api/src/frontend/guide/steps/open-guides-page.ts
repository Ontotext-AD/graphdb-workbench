import {GuideContext} from '../model/guide-context';
import type {StepOptions} from 'shepherd.js';

export const openGuidesPage = function(ctx: GuideContext): StepOptions {
  console.log('%copenGuidesPage', 'background: red', ctx);
  return {
    id: 'open-guides-page-step',
    text: 'You can open the guides page by clicking the <strong>Guides</strong> button.',
    attachTo: {
      element: '.open-guides-btn',
      on: 'bottom'
    },
    advanceOn: {
      selector: '.open-guides-btn',
      event: 'click'
    },
    beforeShowPromise: () => {
      return new Promise<void>((resolve) => {
        const checkExist = setInterval(() => {
          if (document.querySelector('.open-guides-btn')) {
            clearInterval(checkExist);
            resolve();
          }
        }, 100);
      });
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
