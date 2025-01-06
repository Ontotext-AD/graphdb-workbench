import {Component, Host, h, Listen, Element, State} from '@stencil/core';
import {NavbarToggledEvent} from "../onto-navbar/navbar-toggled-event";
import {debounce} from "../../utils/function-utils";
import {WINDOW_WIDTH_FOR_COLLAPSED_NAVBAR} from "../../models/constants";
import {ServiceProvider, LocalStorageSubscriptionHandlerService} from "@ontotext/workbench-api";

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
  private currentRoute: string;

  constructor() {
    this.windowResizeObserver = debounce(() => this.windowResizeHandler(), 50);
  }

  @Element() hostElement: HTMLOntoLayoutElement;

  @State() isLowResolution = false;
  @State() hasPermission = true; // TODO get from local store

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

  private handleStorageChange(event: StorageEvent) {
    const service = ServiceProvider.get(LocalStorageSubscriptionHandlerService);
    service.handleStorageChange(event);
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
    window.addEventListener("storage", this.handleStorageChange);
  }

  disconnectedCallback() {
    window.removeEventListener("storage", this.handleStorageChange);
  }

  render() {
    return (
      <Host class="wb-layout">
        {/* Default slot is explicitly defined to be able to hide the main content in the user permission check */}
        <div class="default-slot-wrapper">
          <slot name="default"></slot>
        </div>
        <header class="wb-header">
          <onto-header></onto-header>
        </header>

        <nav class="wb-navbar">
          <onto-navbar navbar-collapsed={this.isLowResolution} selected-menu={this.currentRoute}></onto-navbar>
        </nav>

        {
          this.hasPermission ?
            <slot name="main"></slot> :
            <onto-permission-banner></onto-permission-banner>
        }
        <footer class="wb-footer">
          <onto-footer></onto-footer>
        </footer>
        <onto-tooltip></onto-tooltip>
      </Host>
    );
  }
}
