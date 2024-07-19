import {Component, Host, h, Listen, Element, State} from '@stencil/core';
import {NavbarToggledEvent} from "../onto-navbar/navbar-toggled-event";
import {debounce} from "../../utils/function-utils";
import {WINDOW_WIDTH_FOR_COLLAPSED_NAVBAR} from "../../models/constants";

@Component({
  tag: 'onto-layout',
  styleUrl: 'onto-layout.scss',
  shadow: false,
})
export class OntoLayout {
  private windowResizeObserver: (...args: any) => void;

  constructor() {
    this.windowResizeObserver = debounce(() => this.windowResizehandler(), 50);
  }

  @Element() hostElement: HTMLElement;

  // TODO: determine this on init
  @State() isLowResolution = false;

  /**
   * Event listener for the navbar toggled event. The layout needs to respond properly when the navbar is toggled in
   * order to fit the content.
   * @param event
   */
  @Listen('navbarToggled')
  onNavbarToggled(event: CustomEvent<NavbarToggledEvent>) {
    const isCollapsed = event.detail.payload;
    if (isCollapsed) {
      this.hostElement.classList.add('expanded');
    } else {
      this.hostElement.classList.remove('expanded');
    }
  }

  /**
   * Event listener for window resize event. We need to handle this in order to allow the navbar to collapse when the
   * window is resized.
   */
  @Listen('resize', {target: 'window'})
  onResize() {
    this.windowResizeObserver();
  }

  private windowResizehandler(): void {
    if (window.innerWidth > WINDOW_WIDTH_FOR_COLLAPSED_NAVBAR) {
      this.hostElement.classList.remove('expanded');
      this.isLowResolution = false;
    } else {
      this.hostElement.classList.add('expanded');
      this.isLowResolution = true;
    }
  }

  render() {
    return (
      <Host class="wb-layout">
        <header class="wb-header">
          <onto-header></onto-header>
        </header>

        <nav class="wb-navbar">
          <onto-navbar navbar-collapsed={this.isLowResolution}></onto-navbar>
        </nav>

        <slot name="main"></slot>

        <footer class="wb-footer">
          <onto-footer></onto-footer>
        </footer>
      </Host>
    );
  }
}
