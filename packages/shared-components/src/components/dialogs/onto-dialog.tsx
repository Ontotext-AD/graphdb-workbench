import {Component, Host, h, Prop, Element} from '@stencil/core';
import {HtmlUtil} from '../../utils/html-util';

export type DialogConfig = {
  dialogTitle: string;
  onClose: (evt: MouseEvent | KeyboardEvent) => void;
}

@Component({
  tag: 'onto-dialog',
  styleUrl: 'onto-dialog.scss',
})
export class OntoDialog {
  private documentOverflow: string;
  private closeButton: HTMLButtonElement;

  @Element() hostElement: HTMLElement;

  /**
   * Configuration object for the dialog.
   */
  @Prop() config: DialogConfig;

  componentDidLoad(): void {
    this.documentOverflow = HtmlUtil.hideDocumentBodyOverflow();
    this.hostElement.addEventListener('keydown', this.preventLeavingDialog.bind(this));
    this.closeButton.focus();
  }

  disconnectedCallback() {
    this.hostElement.removeEventListener('keydown', this.preventLeavingDialog.bind(this));
    HtmlUtil.setDocumentBodyOverflow(this.documentOverflow);
  }

  render() {
    return (
      <Host tabindex="-1">
        <div class="dialog-overlay">
          <dialog class="dialog">
            <header class="dialog-header">
              <h3 class="dialog-title">{this.config.dialogTitle}</h3>
            </header>
            <main class="dialog-body">
              <slot name="body"/>
            </main>
            <footer class="dialog-footer">
              <slot name="footer"/>
              <button class="onto-btn onto-btn-primary"
                      onClick={this.handleClose}
                      ref={(el) => (this.closeButton = el)}>
                <translate-label labelKey={'common.button.close'}></translate-label>
              </button>
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
