import {Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslocoPipe, TranslocoService} from '@jsverse/transloco';
import {AuthenticationService, OpenidStorageService, OntoToastrService, SecurityService, service, UrlPathParams, NavigationContextService} from '@ontotext/workbench-api';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    TranslocoPipe,
    ReactiveFormsModule,
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {
  private readonly toastrService = service(OntoToastrService);
  private readonly securityService = service(SecurityService);
  private readonly authenticationService = service(AuthenticationService);
  private readonly openidStorageService = service(OpenidStorageService);
  private readonly navigationContextService = service(NavigationContextService);

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translocoService = inject(TranslocoService);

  loginForm: FormGroup;
  error = false;
  returnUrl: string;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.returnUrl = '/';
  }

  ngOnInit(): void {
    this.handleQueryParams();
  }

  private handleQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    const rawReturnUrl = params.get(UrlPathParams.RETURN_URL);
    this.returnUrl = rawReturnUrl ? decodeURIComponent(rawReturnUrl) : this.navigationContextService.getReturnUrl() ?? '/';

    if (params.has(UrlPathParams.NO_ACCESS)) {
      this.toastrService.error(
        this.translocoService.translate('login.errors.no_rights'),
        this.translocoService.translate('login.error')
      );
    } else if (params.has(UrlPathParams.EXPIRED)) {
      this.toastrService.error(
        this.translocoService.translate('login.errors.auth_token_expired'),
        this.translocoService.translate('login.error')
      );
    }
  }

  isGDBLoginEnabled(): boolean | undefined {
    return this.securityService.isPasswordLoginEnabled();
  }

  isOpenIDEnabled(): boolean | undefined {
    return this.securityService.isOpenIDEnabled();
  }

  login(): void {
    const {username, password} = this.loginForm.value;
    this.loginForm.setErrors({wrongCredentials: false});

    this.authenticationService.login(username, password)
      .then(() => {
        this.router.navigateByUrl(this.returnUrl);
        this.navigationContextService.clearReturnUrl();
      })
      .catch((err) => {
        if (err.status === 401) {
          this.toastrService.error(this.translocoService.translate('login.errors.wrong_credentials'), this.translocoService.translate('login.error'));
          this.loginForm.setErrors({wrongCredentials: true});
          this.loginForm.reset();
          Object.keys(this.loginForm.controls).forEach((key) => {
            this.loginForm.controls[key].markAsTouched();
          });
          this.loginForm.updateValueAndValidity();
        } else {
          this.toastrService.error(err.message, err.status);
        }
      });
  }

  loginWithOpenID(): void {
    this.openidStorageService.setReturnUrl(this.returnUrl);
    this.login();
  }
}
