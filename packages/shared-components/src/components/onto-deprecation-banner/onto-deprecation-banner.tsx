import { Component, h, Host, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'onto-deprecation-banner',
  styleUrl: 'onto-deprecation-banner.scss',
  shadow: false
})
export class OntoDeprecationBanner {

  /**
   * Emitted when the banner is closed.
   */
  @Event() closeBanner: EventEmitter<void>;

  private readonly onClose = () => {
    this.closeBanner.emit();
  };

  render() {
    return (
      <Host>
        <div class="deprecation-banner">
          <div class="banner-content">
            <div class="banner-message">
              <slot name="content"></slot>
            </div>
          </div>

          <button
            type="button"
            class="close-button"
            aria-label="Close banner"
            onClick={this.onClose}
          >
            <i class="ri-close-line"></i>
          </button>
        </div>
      </Host>
    );
  }
}
