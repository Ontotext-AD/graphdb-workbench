import {Component, h, Prop, State, Element, Listen} from '@stencil/core';
import {
  AuthenticatedUser,
  AuthenticationService,
  navigate,
  SecurityConfig,
  service
} from '@ontotext/workbench-api';

/**
 * This component displays the current user's name and provides options
 * for navigating to settings and logging out.
 */
@Component({
  tag: 'onto-user-menu',
  styleUrl: 'onto-user-menu.scss'
})
export class OntoUserMenu {
  private readonly authenticationService = service(AuthenticationService);
  /** Whether the dropdown menu is open or closed */
  @State() private isOpen: boolean;

  /** Currently authenticated user */
  @Prop() user: AuthenticatedUser;
  /** Current security config */
  @Prop() securityConfig: SecurityConfig;

  /** Reference to host element for outside click detection */
  @Element() hostElement: HTMLElement;

  private readonly DROPDOWN_ID = 'onto-user-menu-dropdown';
  private toggleButton: HTMLButtonElement;

  connectedCallback() {
    document.addEventListener('click', this.handleOutsideClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleOutsideClick);
  }

  render() {
    return (
      <section class='onto-user-menu'>
        <div class='dropdown-toggle-wrapper'>
          <button class={`onto-user-menu-toggle label-base-regular ${this.isOpen ? 'open' : ''}`}
            ref={(el) => this.toggleButton = el}
            aria-expanded={this.isOpen ? 'true' : 'false'}
            aria-controls={this.DROPDOWN_ID}
            onClick={this.toggleDropdown}>
            <i class='ri-user-line ri-lg' aria-hidden='true'></i>
            <span class='username'>{this.user.username}</span>
            <i class={`ri-arrow-down-s-line ${this.isOpen ? 'rotate-180' : ''}`} aria-hidden='true'></i>
          </button>
          {this.isOpen ?
            <section class='onto-user-menu-dropdown' id={this.DROPDOWN_ID}>
              <a class='onto-user-menu-item label-base-regular' href='settings' onClick={this.openMySettings}>
                <translate-label labelKey={'user_menu.my_settings'}></translate-label>
              </a>
              {!this.authenticationService.isExternalUser() ?
                <button class='onto-user-menu-item label-base-regular' onClick={this.logout}>
                  <translate-label labelKey={'user_menu.logout'}></translate-label>
                </button> : ''}
            </section> : ''}
        </div>
      </section>
    );
  }

  /**
   * Navigates to the settings page and closes the dropdown.
   */
  private readonly openMySettings = (event: MouseEvent): void => {
    event.preventDefault();
    this.isOpen = false;
    navigate('settings');
  };

  /**
  * Log out the current user.
  */
  private readonly logout = (): void => {
    this.isOpen = false;
    this.authenticationService.logout();
  };

  /**
   * Toggles the dropdown menu's open state.
   *
   * @returns A function that toggles the `isOpen` state between true and false.
   */
  private readonly toggleDropdown = (): void => {
    this.isOpen = !this.isOpen;
  };

  /**
   * Closes the dropdown on Escape and returns the focus to the toggle button.
   */
  @Listen('keydown')
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen) {
      this.isOpen = false;
      this.toggleButton?.focus();
    }
  }

  /**
   * Closes the dropdown if the user clicks outside the component.
   */
  private readonly handleOutsideClick = (event: MouseEvent) => {
    if (this.isOpen && !this.hostElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  };
}
