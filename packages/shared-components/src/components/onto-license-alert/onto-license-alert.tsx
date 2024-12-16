import { License } from '@ontotext/workbench-api';
import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'onto-license-alert',
  styleUrl: 'onto-license-alert.scss'
})
/**
 * OntoLicenseAlert component
 *
 * This component displays a license alert button with a tooltip.
 * It is used to show license-related information and provide a link to the license page.
 */
export class OntoLicenseAlert {

  /** The current license information */
  @Prop() license: License;

  render() {
    return (
      <Host tooltip-content={this.license?.message} tooltip-placement="bottom">
        <a class="onto-license-alert onto-button" onClick={this.onLicenseAlertClick}>
          <span class="icon-warning"></span>
          <translate-label labelKey={'license_alert.label'}></translate-label>
        </a>
      </Host>
    );
  }

  private onLicenseAlertClick(event: Event) {
    event.preventDefault();
    // Navigate to the license page without reloading.
    // @ts-ignore
    window.singleSpa.navigateToUrl('/license');
  }
}
