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
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ToastModule} from 'primeng/toast';
import {ConfirmationService, MessageService} from 'primeng/api';

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
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './ux-test-page.component.html',
  host: {class: 'login-page-route'}
})
export class UxTestPageComponent implements OnDestroy {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
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

  confirm1(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      header: 'Confirm',
      rejectButtonProps: {
        label: 'Cancel button',
        severity: 'secondary',
      },
      acceptButtonProps: {
        label: 'Delete button',
        severity: 'primary'
      },

      accept: () => {
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Record deleted' });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribeAll();
  }
}
