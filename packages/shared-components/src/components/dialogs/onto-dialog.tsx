import {Component, Host, h, Prop, Element} from '@stencil/core';
import {HtmlUtil} from '../../utils/html-util';

export type DialogConfig = {
  dialogTitle: string;
  onClose?: (evt: MouseEvent | KeyboardEvent) => void;
  modalClass?: string;
}

@Component({
  tag: 'onto-dialog',
  styleUrl: 'onto-dialog.scss',
})
export class OntoDialog {
  private documentOverflow: string;

  @Element() hostElement: HTMLElement;

  /**
   * Configuration object for the dialog.
   */
  @Prop() config: DialogConfig;

  componentDidLoad(): void {
    this.documentOverflow = HtmlUtil.hideDocumentBodyOverflow();
    this.hostElement.addEventListener('keydown', this.preventLeavingDialog.bind(this));
  }

  disconnectedCallback() {
    this.hostElement.removeEventListener('keydown', this.preventLeavingDialog.bind(this));
    HtmlUtil.setDocumentBodyOverflow(this.documentOverflow);
  }

  render() {
    return (
      <Host tabindex="-1">
        <div class={`dialog-overlay ${this.config.modalClass ? this.config.modalClass : ''}`}>
          <dialog class="dialog">
            <header class="dialog-header">
              <h3 class="dialog-title">{this.config.dialogTitle}</h3>
              {this.config.onClose && (
                <button data-test={'close-dialog-btn'} class="close-btn onto-btn" onClick={this.handleClose}>
                  <i class="ri-close-line ri-2x"></i>
                </button>
              )}
            </header>
            <main class="dialog-body">
              <slot name="body"/>
            </main>
            <footer class="dialog-footer">
              <slot name="footer"/>
            </footer>
          </dialog>
        </div>
      </Host>
    );
  }

  private handleClose = (evt: MouseEvent) => {
    this.config.onClose(evt);
  };

  private preventLeavingDialog(ev: KeyboardEvent) {
    HtmlUtil.preventLeavingDialog(this.hostElement, ev);
  }
}
