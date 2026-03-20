import {Component, h, Listen, State} from '@stencil/core';
import {
  CancelDialogAction,
  CONFIRM_CANCEL_EVENT,
  ConfirmCancelCallback,
  ConfirmCancelPayload
} from '@ontotext/workbench-api';
import {TranslationService} from '../../../services/translation.service';
import {DialogConfig} from '../onto-dialog';

@Component({
  tag: 'onto-confirm-cancel-dialog',
  styleUrl: 'onto-confirm-cancel-dialog.scss',
  shadow: false
})
export class OntoConfirmCancelDialog {
  @State() private isOpen = false;
  @State() private hasDontShowAgain = false;

  private onClose: ConfirmCancelCallback;

  @Listen(CONFIRM_CANCEL_EVENT, {target: 'body'})
  onConfirmCancelEvent(event: CustomEvent<ConfirmCancelPayload>): void {
    this.hasDontShowAgain = event.detail.hasDontShowAgain;
    this.onClose = event.detail.onClose;
    this.isOpen = true;
  }

  render() {
    if (!this.isOpen) {
      return null;
    }

    const config: DialogConfig = {
      dialogTitle: TranslationService.translate('guides.confirm-cancel-modal.title'),
      onClose: this.onCancel,
    };

    return (
      <onto-dialog data-test={'onto-confirm-cancel-dialog'} class={'confirm-cancel-dialog'} config={config}>
        <div slot="body">
          <span innerHTML={TranslationService.translate('guides.confirm-cancel-modal.subtitle')}></span>
        </div>
        <button slot={'footer'} class="onto-btn onto-btn-secondary" data-test={'cancel-btn'} onClick={this.onCancel}>
          <translate-label labelKey={'common.button.cancel'}></translate-label>
        </button>
        {this.hasDontShowAgain && (
          <button slot={'footer'} class="onto-btn onto-btn-secondary" data-test={'dont-show-again-btn'} onClick={this.onDontShowAgain}>
            <translate-label labelKey={'guides.confirm-cancel-modal.dont-show-again'}></translate-label>
          </button>
        )}
        <button slot={'footer'} class="onto-btn onto-btn-primary" data-test={'exit-btn'} onClick={this.onExit}>
          <translate-label labelKey={'guides.confirm-cancel-modal.exit-button'}></translate-label>
        </button>
      </onto-dialog>
    );
  }

  private readonly onCancel = (): void => this.resolve(CancelDialogAction.CANCEL);
  private readonly onExit = (): void => this.resolve(CancelDialogAction.EXIT);
  private readonly onDontShowAgain = (): void => this.resolve(CancelDialogAction.DONT_SHOW_AGAIN);

  private resolve(action: CancelDialogAction): void {
    this.isOpen = false;
    this.onClose?.(action);
    this.onClose = null;
  }
}
