import Shepherd from 'shepherd.js';

export class GuidesService {

  static init() {
    console.log('%cinit guides', 'background: red',);
    const tour = new Shepherd.Tour({
      useModalOverlay: false,
      defaultStepOptions: {
        classes: 'shadow-md bg-purple-dark',
        scrollTo: true
      }
    });
    tour.addStep({
      id: 'example-step',
      text: 'This step is attached to the bottom of the <code>.example-css-selector</code> element.',
      attachTo: {
        element: '.home-page',
        on: 'bottom'
      },
      classes: 'example-step-extra-class',
      buttons: [
        {
          text: 'Next',
          action: tour.next
        }
      ]
    });
    tour.start();
  }
}
