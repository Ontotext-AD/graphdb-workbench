import {Component, Element, h, Host, Prop, Watch} from '@stencil/core';
import tippy, {Instance, Placement} from 'tippy.js';

@Component({
  tag: 'onto-tooltip',
  styleUrl: 'onto-tooltip.scss',
  shadow: false,
})
export class OntoTooltip {
  private tooltip: Instance;
  private showFunction;
  private hideFunction;

  @Element() el: HTMLElement;

  @Prop() dataTooltip: string;

  @Prop() placement: string;

  @Prop() showOnClick: false;

  @Watch('dataTooltip')
  configurationChanged() {
    this.update();
  }

  componentDidLoad() {
    this.init();
  }

  disconnectedCallback() {
    this.destroy();
  }

  render() {
    return (
      <Host class="yasgui-tooltip">
        <slot />
      </Host>
    );
  }

  private update() {
    this.init();
    this.tooltip.setContent(this.dataTooltip);
  }

  private init() {
    if (this.tooltip) {
      return;
    }
    const options = {
      content: this.dataTooltip,
      trigger: 'manual',
      placement: this.placement as Placement,
      allowHTML: true,
      triggerTarget: this.el,
      theme: "onto-tooltip",
      /**
       * The tippy library has some conflict with the Google Chart Editor. The editor adds a div element with the "jfk-tooltip" class.
       * When the mouse hovers over a chart editor element, this div is positioned accordingly.
       * When the mouse leaves the element, a "jfk-tooltip-hidden" class is added, and the div tag is hidden.
       * For some reason, when a 'onto-tooltip' is open, the "jfk-tooltip-hidden" class is removed, and the Google Chart tooltip is displayed along with
       * 'onto-tooltip' (maybe Google uses an old version of tippy or popover and there is a conflict in implementations).
       * When 'onto-tooltip' is open, we add the class 'hidden' to the Google Chart tooltip to hide it.
       */
      onShow: () => document.querySelectorAll('.jfk-tooltip').forEach(popper => popper.classList.add('hidden')),
      /**
       * When 'onto-tooltip' is closed, we remove the 'hidden' class to allow the Google Chart tooltip to work properly.
       */
      onHide: () => document.querySelectorAll('.jfk-tooltip').forEach(popper => popper.classList.remove('hidden'))
    };
    this.tooltip = tippy(this.el, options);

    this.showFunction = this.createShowFunction(this.tooltip);
    this.hideFunction = this.createHideFunction(this.tooltip);

    this.el.addEventListener('mouseover', this.showFunction);

    if (this.showOnClick) {
      this.el.addEventListener('click', this.showFunction);
    }

    this.el.addEventListener('mouseleave', this.hideFunction);
  }

  private createShowFunction(tooltip: Instance) {
    return () => {
      if (this.dataTooltip) {
        tooltip.show();
      }
    }
  }

  private createHideFunction(tooltip: Instance) {
    return () => tooltip.hide();
  }

  private destroy() {
    this.el.removeEventListener('mouseover', this.showFunction);
    this.el.removeEventListener('click', this.showFunction);
    this.el.removeEventListener('mouseleave', this.hideFunction);
  }
}
