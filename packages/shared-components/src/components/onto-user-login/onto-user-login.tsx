import {Component, h} from '@stencil/core';
import {navigateToLoginPage} from '@ontotext/workbench-api';

@Component({
  tag: 'onto-user-login',
  styleUrl: 'onto-user-login.scss',
  shadow: false,
})
export class OntoUserLogin {

  private navigateToLogin() {
    return (event: PointerEvent) => {
      event.preventDefault();
      navigateToLoginPage();
    };
  }

  render() {
    return (
      <section class="onto-user-login">
        <button onClick={this.navigateToLogin()}>
          <i class="ri-arrow-right-circle-line"></i>
          <translate-label
            class="user-login-label"
            labelKey="user_menu.login"
          ></translate-label>
        </button>
      </section>
    );
  }
}
