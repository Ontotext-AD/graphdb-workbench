import {Component, Host, h, Prop, Element} from '@stencil/core';
import {HtmlUtil} from '../../utils/html-util';
import {TranslationService} from '../../services/translation.service';

export type DialogConfig = {
  dialogTitle: string;
  /**
   * Called when the user closes the dialog with the close button or the Escape key.
   * Without it, the dialog has no close button and Escape does nothing.
   */
  onClose?: (evt: MouseEvent | KeyboardEvent) => void;
  modalClass?: string;
}

let dialogCounter = 0;

@Component({
  tag: 'onto-dialog',
  styleUrl: 'onto-dialog.scss',
})
export class OntoDialog {
  private documentOverflow: string;
  private readonly titleId = `onto-dialog-title-${++dialogCounter}`;
  /** The element that had the focus when the dialog opened. It gets the focus back when the dialog closes. */
  private opener: HTMLElement;

  @Element() hostElement: HTMLElement;

  /**
   * Configuration object for the dialog.
   */
  @Prop() config: DialogConfig;

  connectedCallback(): void {
    this.opener = document.activeElement as HTMLElement;
  }

  componentDidLoad(): void {
    this.documentOverflow = HtmlUtil.hideDocumentBodyOverflow();
    this.hostElement.addEventListener('keydown', this.onKeydown);
    // The content is not focusable yet while the dialog is being rendered, so wait for the next frame.
    requestAnimationFrame(() => this.moveFocusIntoDialog());
  }

  disconnectedCallback() {
    this.hostElement.removeEventListener('keydown', this.onKeydown);
    HtmlUtil.setDocumentBodyOverflow(this.documentOverflow);
    if (this.opener?.isConnected) {
      this.opener.focus();
    }
  }

  render() {
    return (
      <Host tabindex="-1">
        <div class={`dialog-overlay ${this.config.modalClass ? this.config.modalClass : ''}`}>
          <dialog class="dialog" aria-modal="true" aria-labelledby={this.titleId}>
            <header class="dialog-header">
              <h3 id={this.titleId} class="dialog-title">{this.config.dialogTitle}</h3>
              {this.config.onClose && (
                <button data-test={'close-dialog-btn'} class="close-btn onto-btn" onClick={this.handleClose}
                  aria-label={TranslationService.translate('common.button.close')}>
                  <i class="ri-close-line ri-2x" aria-hidden="true"></i>
                </button>
              )}
            </header>
            <div class="dialog-body">
              <slot name="body"/>
            </div>
            <footer class="dialog-footer">
              <slot name="footer"/>
            </footer>
          </dialog>
        </div>
      </Host>
    );
  }

  private handleClose = (evt: MouseEvent | KeyboardEvent) => {
    this.config.onClose(evt);
  };

  /**
   * Focuses the element marked with `autofocus`, or else the first focusable element of the dialog.
   */
  private moveFocusIntoDialog(): void {
    if (this.hostElement.contains(document.activeElement)) {
      return;
    }
    const autofocusElement = this.hostElement.querySelector<HTMLElement>('[autofocus]');
    if (autofocusElement) {
      autofocusElement.focus();
    } else {
      HtmlUtil.focusNextElement(this.hostElement);
    }
  }

  private readonly onKeydown = (ev: KeyboardEvent) => {
    if (ev.key === 'Escape' && this.config.onClose) {
      ev.stopPropagation();
      this.handleClose(ev);
      return;
    }
    HtmlUtil.preventLeavingDialog(this.hostElement, ev);
  };
}
