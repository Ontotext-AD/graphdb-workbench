import {Component, Element, h, Host, Prop} from '@stencil/core';
import loaderSvg from '../../assets/onto-loader.svg';
import {LoggerProvider} from '../../services/logger-provider';

@Component({
  tag: 'onto-loader',
  styleUrl: 'onto-loader.scss',
  shadow: true
})
export class OntoLoader {
  @Element() loader: HTMLElement;

  /**
   * Size of the loader in pixels (width and height).
   */
  @Prop() size = 100;

  /**
   * Whether the loader is currently active and should be displayed.
   */
  @Prop() loading = false;

  /**
   * Optional message text to display below the loader.
   */
  @Prop() messageText = '';

  /**
   * CSS selector of a DOM element to attach the loader to as a centered overlay.
   */
  @Prop() targetSelector = '';

  private readonly ATTACHED_CLASS = 'onto-loader-attached';
  private readonly rawSvg = atob(loaderSvg.split(',')[1]);
  private readonly logger = LoggerProvider.logger;

  componentDidLoad() {
    this.attachToSelector();
  }

  render() {
    return (
      <Host class={{[this.ATTACHED_CLASS]: !!this.targetSelector, 'onto-loader-active': this.loading}}>
        <div class="onto-loader" guide-selector="onto-loader">
          <div class="loader-spinner" style={{'width': this.size + 'px', 'height': this.size + 'px'}} innerHTML={this.rawSvg}></div>
          {this.messageText && <div class="loader-message" style={{'font-size': (this.size / 4) + 'px'}}>{this.messageText}</div>}
        </div>
      </Host>
    );
  }

  private attachToSelector() {
    if (!this.targetSelector) {
      return;
    }

    const target = document.querySelector<HTMLElement>(this.targetSelector);
    if (!target) {
      this.logger.warn('You tried to attach the loader to an element that does not exist: ', this.targetSelector);
      this.loader.classList.remove(this.ATTACHED_CLASS);
      return;
    }

    target.appendChild(this.loader);
  }
}
