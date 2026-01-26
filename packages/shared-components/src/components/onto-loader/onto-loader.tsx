import {Component, h, Host, Prop} from '@stencil/core';
import loaderSvg from '../../assets/onto-loader.svg';

@Component({
  tag: 'onto-loader',
  styleUrl: 'onto-loader.scss',
  shadow: true
})
export class OntoLoader {
  /**
   * Size of the loader in pixels (width and height).
   */
  @Prop() size = 100;

  /**
   * Optional message text to display below the loader.
   */
  @Prop() messageText = '';

  private readonly rawSvg = atob(loaderSvg.split(',')[1]);

  render() {
    return (
      <Host>
        <div class="onto-loader" guide-selector="onto-loader">
          <div class="loader-spinner" style={{'width': this.size + 'px', 'height': this.size + 'px'}} innerHTML={this.rawSvg}></div>
          {this.messageText && <div class="loader-message" style={{'font-size': (this.size / 4) + 'px'}}>{this.messageText}</div>}
        </div>
      </Host>
    );
  }
}
