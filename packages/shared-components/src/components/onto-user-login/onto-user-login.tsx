import { Component, h } from '@stencil/core';
import {navigateTo} from '@ontotext/workbench-api';

@Component({
  tag: 'onto-user-login',
  styleUrl: 'onto-user-login.scss',
  shadow: false,
})
export class OntoUserLogin {
  render() {
    return (
      <section class="onto-user-login">
        <button onClick={navigateTo('login')}>
          <i class="icon-arrow-right"></i>
          <translate-label
            class="user-login-label"
            labelKey="user_menu.login"
          ></translate-label>
        </button>
      </section>
    );
  }
}
