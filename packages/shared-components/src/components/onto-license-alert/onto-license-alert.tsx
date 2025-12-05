import {License, navigateTo} from '@ontotext/workbench-api';
import { Component, Host, h, Prop } from '@stencil/core';
import {OntoTooltipPlacement} from '../onto-tooltip/models/onto-tooltip-placement';

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
      <Host tooltip-content={this.license?.message} tooltip-placement={OntoTooltipPlacement.BOTTOM} data-test='onto-license-alert'>
        <button class="onto-license-alert onto-btn" onClick={navigateTo('license')}>
          <span class="ri-alert-line"></span>
          <translate-label labelKey={'license_alert.label'}></translate-label>
        </button>
      </Host>
    );
  }
}
