import {ComponentEvent} from '../../models/component-event';

/**
 * Event fired when the navbar is toggled by the user.
 */
export class NavbarToggledEvent implements ComponentEvent {
  type = 'navbarToggled';
  payload: boolean;

  /**
   * Constructs the event.
   * @param isOpened - Whether the navbar is opened.
   */
  constructor(isOpened: boolean) {
    this.payload = isOpened;
  }
}
