import { Component, h } from '@stencil/core';
import {navigateTo} from "../../../../api/src/services/utils";

@Component({
  tag: 'onto-user-login',
  styleUrl: 'onto-user-login.scss',
  shadow: false,
})
export class OntoUserLogin {
  render() {
    return (
      <section class={`onto-user-login`} onClick={navigateTo('/login')}>
        <button>
          <i class="icon-arrow-right"></i>
          <translate-label class="user-login-label"
                           labelKey={'user_menu.login'}></translate-label>
        </button>
      </section>
    );
  }
}
