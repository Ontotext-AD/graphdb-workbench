import {Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslocoPipe, TranslocoService} from '@jsverse/transloco';
import {
  AuthenticationService,
  ConfigurationContextService,
  NavigationContextService,
  OntoToastrService,
  OpenidStorageService,
  RuntimeConfigurationContextService,
  SecurityService,
  service,
  UrlPathParams
} from '@ontotext/workbench-api';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {CheckboxModule} from 'primeng/checkbox';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {SplitButtonModule} from 'primeng/splitbutton';
import {ToolbarModule} from 'primeng/toolbar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    TranslocoPipe,
    ReactiveFormsModule,
    CommonModule,
    NgOptimizedImage,
    ButtonModule,
    InputTextModule,
    FormsModule,
    CheckboxModule,
    ButtonModule, IconFieldModule, InputIconModule, SplitButtonModule, ToolbarModule, InputTextModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  host: {class: 'login-page-route'}
})
export class LoginPageComponent implements OnInit, OnDestroy {
  private readonly toastrService = service(OntoToastrService);
  private readonly securityService = service(SecurityService);
  private readonly authenticationService = service(AuthenticationService);
  private readonly openidStorageService = service(OpenidStorageService);
  private readonly navigationContextService = service(NavigationContextService);
  private readonly configurationContextService = service(ConfigurationContextService);
  private readonly runtimeConfigurationContextService = service(RuntimeConfigurationContextService);

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translocoService = inject(TranslocoService);

  private readonly subscriptions = new Array<() => void>();
  value1: string | undefined;
  value2: string | undefined;
  value3: string | undefined;
  checked = true;
  loginForm: FormGroup;
  error = false;
  returnUrl: string;
  logoPath = signal(this.configurationContextService.getApplicationConfiguration().applicationLogoPath);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.returnUrl = '/';
  }

  ngOnInit(): void {
    this.handleQueryParams();
    this.subscribeToThemeModeChange();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
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
    this.loginForm.setErrors(null);

    if (this.isGDBLoginEnabled() && !this.isFormValid()) {
      return;
    }

    this.authenticationService.login(username, password)
      .then(() => {
        this.router.navigateByUrl(this.returnUrl);
        this.navigationContextService.clearReturnUrl();
      })
      .catch((err) => {
        if (err.status === 401) {
          this.toastrService.error(this.translocoService.translate('login.errors.wrong_credentials'), this.translocoService.translate('login.error'));
          this.loginForm.setErrors({wrongCredentials: true});
        } else {
          this.toastrService.error(err.message, err.status);
        }
      });
  }

  loginWithOpenID(): void {
    this.openidStorageService.setReturnUrl(this.returnUrl);
    this.login();
  }

  private subscribeToThemeModeChange(): void {
    this.subscriptions.push(
      this.runtimeConfigurationContextService.onThemeModeChanged((themeMode) => {
        this.logoPath.set(this.configurationContextService.getApplicationLogoPath(themeMode));
      })
    );
  }

  private isFormValid(touchFields = true): boolean {
    if (touchFields) {
      this.loginForm.markAllAsTouched();
    }
    return !this.loginForm.invalid;
  }
}
