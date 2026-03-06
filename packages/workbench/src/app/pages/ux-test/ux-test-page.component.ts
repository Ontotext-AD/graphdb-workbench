import {Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslocoService} from '@jsverse/transloco';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {InputTextModule} from 'primeng/inputtext';
import {CheckboxModule} from 'primeng/checkbox';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {SplitButtonModule} from 'primeng/splitbutton';
import {ToolbarModule} from 'primeng/toolbar';

@Component({
  selector: 'app-ux-test',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    CheckboxModule,
    ButtonModule, IconFieldModule, InputIconModule, SplitButtonModule, ToolbarModule, InputTextModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './ux-test-page.component.html',
  host: {class: 'login-page-route'}
})
export class UxTestPageComponent implements OnDestroy {
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

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
  }
}
