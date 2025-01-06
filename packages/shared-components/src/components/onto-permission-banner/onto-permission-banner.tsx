import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'onto-permission-banner',
  styleUrl: 'onto-permission-banner.scss',
  shadow: false,
})
export class OntoPermissionBanner {
  render() {
    return (
      <Host class="permission-banner">
        <p class="permission-banner-content onto-alert onto-alert-danger">
          <div class="icon-warning"></div>
          <div class="label-container">
            <translate-label labelKey={'permission_banner.no_access_error'}></translate-label>
            <translate-label labelKey={'permission_banner.change_menu_or_user_warning'}></translate-label>
          </div>
        </p>
      </Host>
    );
  }
}
