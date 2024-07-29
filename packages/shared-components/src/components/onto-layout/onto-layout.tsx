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

  private isNavbarCollapsed = false;

  /**
   * The current route. This is used to highlight the selected menu item in the navbar.
   */
  public currentRoute: string;

  constructor() {
    this.windowResizeObserver = debounce(() => this.windowResizeHandler(), 50);
  }

  @Element() hostElement: HTMLElement;

  @State() isLowResolution = false;

  /**
   * Event listener for the navbar toggled event. The layout needs to respond properly when the navbar is toggled in
   * order to fit the content.
   * @param event
   */
  @Listen('navbarToggled')
  onNavbarToggled(event: CustomEvent<NavbarToggledEvent>) {
    this.isNavbarCollapsed = event.detail.payload;
    if (this.isNavbarCollapsed) {
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

  private windowResizeHandler(): void {
    this.isLowResolution = window.innerWidth <= WINDOW_WIDTH_FOR_COLLAPSED_NAVBAR;
    if (!this.isLowResolution && !this.isNavbarCollapsed) {
      this.hostElement.classList.remove('expanded');
    } else {
      this.hostElement.classList.add('expanded');
    }
  }

  // ========================
  // Lifecycle methods
  // ========================

  componentDidLoad() {
    this.windowResizeHandler();
  }

  componentWillLoad() {
    let route = window.location.pathname;
    this.currentRoute  = route.replace('/', '').split('/')[0];
  }

  render() {
    return (
      <Host class="wb-layout">
        <header class="wb-header">
          <onto-header></onto-header>
        </header>

        <nav class="wb-navbar">
          <onto-navbar navbar-collapsed={this.isLowResolution} selected-menu={this.currentRoute}></onto-navbar>
        </nav>

        <slot name="main"></slot>

        <footer class="wb-footer">
          <onto-footer></onto-footer>
        </footer>
      </Host>
    );
  }
}
