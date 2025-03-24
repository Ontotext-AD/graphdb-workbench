import {Component, h, Prop, State} from '@stencil/core';
import {AuthenticatedUser} from '@ontotext/workbench-api';
import {navigateTo} from '../../utils/routing-utils';

/**
 * This component displays the current user's name and provides options
 * for navigating to settings and logging out.
 */
@Component({
  tag: 'onto-user-menu',
  styleUrl: 'onto-user-menu.scss'
})
export class OntoUserMenu {
  /** Whether the dropdown menu is open or closed */
  @State() private isOpen: boolean;

  /** Currently authenticated user */
  @Prop() user: AuthenticatedUser;

  render() {
    return (
      <section class={`onto-user-menu`} onClick={this.toggleDropdown()}>
        <button class={`${this.isOpen ? 'open' : ''}`}>
          <i class="fa-solid fa-user"></i>
          <span class="username">{this.user.username}</span>
          <i class={`fa-regular fa-angle-down ${this.isOpen ? 'fa-rotate-180' : ''}`}></i>
        </button>
        {this.isOpen ?
          <section class="onto-user-menu-dropdown">
              <translate-label onClick={navigateTo('/settings')}
                               labelKey={'user_menu.my_settings'}></translate-label>
            {!this.user.external ?
                <translate-label onClick={this.logout()}
                                 labelKey={'user_menu.logout'}></translate-label> : ''}
          </section> : ''}
      </section>
    );
  }

  /**
   * Log out the current user.
   *
   * @returns A function that executes the logout logic.
   */
  private logout(): () => void {
    return () => {
      // TODO
    }
  }

  /**
   * Toggles the dropdown menu's open state.
   *
   * @returns A function that toggles the `isOpen` state between true and false.
   */
  private toggleDropdown(): () => void {
    return () => {
      this.isOpen = !this.isOpen;
    };
  }
}
