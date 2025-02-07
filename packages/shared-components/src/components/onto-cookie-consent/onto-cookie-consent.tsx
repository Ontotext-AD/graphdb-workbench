import {Component, h, State, Host, Event, EventEmitter} from '@stencil/core';
import {DialogHandler} from '../../models/dialog/dialog-handler';

/**
 * OntoCookieConsent component for handling cookie consent functionality.
 * This component displays a cookie consent modal and manages the visibility of a cookie policy dialog.
 * @implements {DialogHandler}
 */
@Component({
  tag: 'onto-cookie-consent',
  styleUrl: 'onto-cookie-consent.scss',
})
export class OntoCookieConsent implements DialogHandler {
  /** State to control the visibility of the cookie policy modal */
  @State() private showModal = false;

  /** Event emitter for when consent is given */
  @Event() consentGiven: EventEmitter<void>;

  /**
   * Closes the cookie policy dialog.
   * This method is called when the dialog is closed.
   */
  // eslint-disable-next-line @stencil-community/own-methods-must-be-private
  onDialogClose() {
    this.showModal = false;
  }

  render() {
    return (
      <Host>
        <div class="cookie-consent-modal">
          <section class="cookie-consent-content">
          <span>
            <translate-label labelKey={'cookie.cookie_consent'}></translate-label>
            <a id="cookie-policy-link" href="#" onClick={this.openModal} class="btn btn-link p-0">
              <translate-label labelKey={'cookie.cookie_policy_url_label'}></translate-label>
            </a>.
          </span>
            <button id="accept-cookie-policy" class="onto-btn onto-btn-primary" onClick={this.handleConsentClick}>
              <translate-label labelKey={'common.button.ok'}></translate-label>
            </button>
          </section>
        </div>
        {
          this.showModal && <onto-cookie-policy-dialog dialogHandler={this}></onto-cookie-policy-dialog>
        }
      </Host>
    );
  }

  /**
   * Opens the cookie policy modal.
   * @param {Event} event - The event that triggered the modal opening.
   */
  private openModal = (event: Event) => {
    event.preventDefault();
    this.showModal = true;
  }

  /**
   * Handles the click event on the consent button.
   * Emits the consentGiven event.
   */
  private handleConsentClick = () => {
    this.consentGiven.emit();
  }
}
