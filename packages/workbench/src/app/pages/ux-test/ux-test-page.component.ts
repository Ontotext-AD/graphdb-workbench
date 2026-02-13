import {Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnDestroy} from '@angular/core';
import {SubscriptionList} from '@ontotext/workbench-api';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
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
    IconFieldModule,
    InputIconModule,
    SplitButtonModule,
    ToolbarModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './ux-test-page.component.html',
  host: {class: 'login-page-route'}
})
export class UxTestPageComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);

  private readonly subscriptions = new SubscriptionList();
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
    this.subscriptions.unsubscribeAll();
  }
}
