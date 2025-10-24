import {Component, h, Prop, State, Element} from '@stencil/core';
import {
  AuthenticatedUser,
  AuthenticationService,
  navigateTo,
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

  connectedCallback() {
    document.addEventListener('click', this.handleOutsideClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.handleOutsideClick);
  }

  render() {
    return (
      <section class='onto-user-menu'>
        <div class='dropdown-toggle-wrapper' onClick={this.toggleDropdown}>
          <button class={`${this.isOpen ? 'open' : ''}`}>
            <i class='ri-user-line ri-lg'></i>
            <span class='username'>{this.user.username}</span>
            <i class={`ri-arrow-down-s-line ${this.isOpen ? 'rotate-180' : ''}`}></i>
          </button>
          {this.isOpen ?
            <section class='onto-user-menu-dropdown'>
              <translate-label onClick={navigateTo('settings')}
                labelKey={'user_menu.my_settings'}></translate-label>
              {!this.authenticationService.isExternalUser() ?
                <translate-label onClick={this.logout}
                  labelKey={'user_menu.logout'}></translate-label> : ''}
            </section> : ''}
        </div>
      </section>
    );
  }

  /**
  * Log out the current user.
  */
  private readonly logout = (): void => {
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
   * Closes the dropdown if the user clicks outside the component.
   */
  private readonly handleOutsideClick = (event: MouseEvent) => {
    if (this.isOpen && !this.hostElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  };
}
