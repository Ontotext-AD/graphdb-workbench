import {Yasr} from './yasr';

/**
 * An interface for elements that can be plugged into yasr toolbar.
 * These elements will be sorted depending on {@link YasrToolbarPlugin#getOrder};
 */
export interface YasrToolbarPlugin {
  /**
   * This method is called when the yasr toolbar is created.
   *
   * @param yasr - the parent yasr of toolbar.
   * @returns - the element to be rendered in toolbar.
   */
  createElement(yasr: Yasr): HTMLElement;

  /**
   * This method is called when draw method of yasr is called.
   *
   * @param element - the element created in {@link YasrToolbarPlugin#createElement}.
   * @param yasr - the parent yasr of toolbar.
   */
  updateElement(element: HTMLElement, yasr: Yasr): void;

  /**
   * Returned value will be used for toolbar element ordering.
   *
   * @returns - the order number.
   */
  getOrder(): number;

  /**
   * This method is called when yasr is destroyed.
   *
   * @param element - the element created in {@link YasrToolbarPlugin#createElement}.
   * @param yasr - the parent yasr of toolbar.
   */
  destroy(element: HTMLElement, yasr: Yasr): void;
}
