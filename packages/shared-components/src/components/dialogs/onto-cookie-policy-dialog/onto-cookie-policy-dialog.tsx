import {Component, h, Listen, Prop} from '@stencil/core';
import {DialogHandler} from '../../../models/dialog/dialog-handler';
import {OntoDialog} from '../../../models/dialog/onto-dialog';
import {TranslationService} from '../../../services/translation.service';
import {SecurityContextService, ServiceProvider, CookieConsent, SecurityService} from '@ontotext/workbench-api';
import {ToggleEventPayload} from '../../../models/toggle-switch/toggle-event-payload';

enum CookieType {
  THIRD_PARTY = 'thirdParty',
  STATISTIC = 'statistic'
}

@Component({
  tag: 'onto-cookie-policy-dialog',
  styleUrl: 'onto-cookie-policy-dialog.scss',
})
export class OntoCookiePolicyDialog implements OntoDialog {
  private readonly user = ServiceProvider.get(SecurityContextService).getAuthenticatedUser();
  private readonly securityService = ServiceProvider.get(SecurityService);
  /**
   * The dialog handler for managing the dialog's behavior.
   */
  @Prop() dialogHandler!: DialogHandler;

  @Listen('toggleChanged')
  toggleChanged(event: CustomEvent<ToggleEventPayload>) {
    this.setUserCookieConsent(this.updateCookieConsent(event.detail));
    this.securityService.updateUserData(this.user);
    console.log(this.user)
  }

  render() {
    const config = {
      dialogTitle: TranslationService.translate('cookie.policy.title'),
      onClose: () => this.dialogHandler.onDialogClose()
    };
    const cookieConsent = new CookieConsent(this.user?.appSettings?.COOKIE_CONSENT);

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
            <onto-toggle-switch checked={cookieConsent?.statistic}
                                labelKey={'cookie.policy.statistic_cookies'}
                                tooltipTranslationKey={'cookie.policy.statistic_tooltip'}
                                context={CookieType.STATISTIC}></onto-toggle-switch>
            <p>
              <translate-label labelKey={'cookie.policy.statistic_text'}></translate-label>
            </p>

            <onto-toggle-switch checked={cookieConsent?.thirdParty}
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

  private updateCookieConsent(payload: ToggleEventPayload): CookieConsent {
    const cookieConsent = new CookieConsent(this.user?.appSettings?.COOKIE_CONSENT);

    // Context is either 'thirdParty' or 'statistic'
    cookieConsent[payload.context] = payload.checked;
    cookieConsent.updatedAt = new Date().getTime();

    return cookieConsent;
  }

  private setUserCookieConsent(cookieConsent: CookieConsent) {
    if (!this.user.appSettings) {
      this.user.appSettings = {};
    }
    this.user.appSettings.COOKIE_CONSENT = cookieConsent;
  }
}
