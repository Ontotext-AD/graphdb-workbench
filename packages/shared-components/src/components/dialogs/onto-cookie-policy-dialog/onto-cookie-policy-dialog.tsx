import {Component, Event, EventEmitter, h, Listen} from '@stencil/core';
import {TranslationService} from '../../../services/translation.service';
import {
  SecurityContextService,
  service,
  CookieConsent,
  SecurityService,
  TrackingService,
  AuthenticatedUser,
  DateUtil,
} from '@ontotext/workbench-api';
import {ToggleEventPayload} from '../../../models/toggle-switch/toggle-event-payload';
import {LoggerProvider} from '../../../services/logger-provider';
import {debounce} from '../../../utils/function-utils';

enum CookieType {
  THIRD_PARTY = 'thirdParty',
  STATISTIC = 'statistic'
}

@Component({
  tag: 'onto-cookie-policy-dialog',
  styleUrl: 'onto-cookie-policy-dialog.scss',
})
export class OntoCookiePolicyDialog {
  private readonly logger = LoggerProvider.logger;
  private readonly securityContextService = service(SecurityContextService);
  private readonly securityService = service(SecurityService);
  private readonly trackingService = service(TrackingService);

  private user: AuthenticatedUser;
  private cookieConsent: CookieConsent;
  /**
   * Debounced version of the `toggleChanged` method to prevent rapid consecutive calls when the user toggles cookie
   * consent options multiple times in quick succession.
   * This is needed because the `toggleChanged` method involves adding and removing tracking scripts based on the user's
   * consent, and rapid toggling can lead to multiple unnecessary script manipulations, which can cause performance
   * issues and unintended side effects.
   */
  private readonly toggleChangedDebounced =
    debounce((event: CustomEvent<ToggleEventPayload>) => this.toggleChanged(event), 300);

  /**
   * Event emitted when the dialog is closed, allowing parent components to react accordingly.
   */
  @Event() closeDialog: EventEmitter<void>;

  @Listen('toggleChanged')
  toggleChangeHandler(event: CustomEvent<ToggleEventPayload>) {
    this.toggleChangedDebounced(event);
  }

  private toggleChanged(event: CustomEvent<ToggleEventPayload>) {
    this.setUserCookieConsent(this.updateCookieConsent(event.detail));
    this.securityService.updateAuthenticatedUser(this.user.toUser())
      .then(() => this.securityContextService.updateAuthenticatedUser(this.user))
      .catch(this.logger.error)
      .finally(() => this.trackingService.applyTrackingConsent());
  }

  connectedCallback(): void {
    this.user = this.securityContextService.getAuthenticatedUser();
    this.cookieConsent = this.trackingService.getCookieConsent();
  }

  render() {
    const config = {
      dialogTitle: TranslationService.translate('cookie.policy.title'),
      onClose: () => this.closePolicyDialog(),
      modalClass: 'cookie-policy-modal',
    };

    return (
      <onto-dialog config={config}>
        <div slot={'body'}>
          <section>
            <h4>
              <translate-label labelKey={'cookie.policy.purpose_heading'}></translate-label>
            </h4>
            <p>
              <translate-label labelKey={'cookie.policy.purpose_text'}></translate-label>
            </p>
            <p>
              <translate-label labelKey={'cookie.policy.purpose_enterprise_text'}></translate-label>
            </p>
          </section>

          <section>
            <h4>
              <translate-label labelKey={'cookie.policy.privacy_commitment_heading'}></translate-label>
            </h4>
            <p>
              <translate-label labelKey={'cookie.policy.privacy_commitment_text'}></translate-label>
            </p>
            <ul>
              <li>
                <translate-label labelKey={'cookie.policy.privacy_commitment_1'}></translate-label>
              </li>
              <li>
                <translate-label labelKey={'cookie.policy.privacy_commitment_2'}></translate-label>
              </li>
            </ul>
          </section>

          <section>
            <h4>
              <translate-label labelKey={'cookie.policy.cookies_heading'}></translate-label>
            </h4>
            <p>
              <translate-label labelKey={'cookie.policy.cookies_text'}></translate-label>
            </p>
          </section>

          <section>
            <h4>
              <translate-label labelKey={'cookie.policy.manage_cookies_heading'}></translate-label>
            </h4>
            <onto-toggle-switch class="statistic-cookies-toggle" checked={this.cookieConsent?.statistic}
              labelKey={'cookie.policy.statistic_cookies'}
              tooltipTranslationKey={'cookie.policy.statistic_tooltip'}
              context={CookieType.STATISTIC}></onto-toggle-switch>
            <p>
              <translate-label labelKey={'cookie.policy.statistic_text'}></translate-label>
            </p>

            <onto-toggle-switch class="third-party-cookies-toggle" checked={this.cookieConsent?.thirdParty}
              labelKey={'cookie.policy.third_party_cookies'}
              tooltipTranslationKey={'cookie.policy.third_party_tooltip'}
              context={CookieType.THIRD_PARTY}></onto-toggle-switch>
            <p>
              <translate-label labelKey={'cookie.policy.third_party_cookies_text'}></translate-label>
            </p>
          </section>

          <p>
            <span>
              <translate-label labelKey={'cookie.policy.change_cookies'}></translate-label>
              <i>
                  &nbsp;
                <translate-label labelKey={'menu.setup.label'}></translate-label>
                  &nbsp;&gt;&nbsp;
                <translate-label labelKey={'menu.my.settings.label'}></translate-label>
                  &nbsp;&gt;&nbsp;
                <translate-label labelKey={'security.user.settings'}></translate-label>
                  &nbsp;&gt;&nbsp;
                <translate-label labelKey={'cookie.policy.change_cookies_location4'}></translate-label>
                  &nbsp;
              </i>
            </span>
          </p>
        </div>
      </onto-dialog>
    );
  }

  /**
   * TODO: This is comment from the previous implementation in the legacy and needs to be re-evaluated and updated if necessary.
   *
   * Closes the modal and passes a result to indicate if the page should be reloaded.
   *  - The page reloads only if the user has
   *    (1) toggled third-party consent multiple times (`didAbusedThirdPartyToggle`),
   *    (2) left third-party consent as enabled (`hasThirdPartyConsent`), and
   *    (3) previously accepted the overall policy (`hasPolicyAccepted`)
   *  - This reload is necessary in cases where multiple third-party consent changes
   *    lead to duplicate and redundant tracking data being loaded.
   */
  private closePolicyDialog() {
    this.closeDialog.emit();
  }

  private updateCookieConsent(payload: ToggleEventPayload): CookieConsent {
    // Context is either 'thirdParty' or 'statistic'
    this.cookieConsent[payload.context] = payload.checked;
    this.cookieConsent.updatedAt = DateUtil.now();
    return this.cookieConsent;
  }

  private setUserCookieConsent(cookieConsent: CookieConsent) {
    if (!this.user.appSettings) {
      this.user.setAppSettings();
    }
    this.user.appSettings.COOKIE_CONSENT = cookieConsent;
  }
}
