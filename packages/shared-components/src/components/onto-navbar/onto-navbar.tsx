import {
  Component,
  Element,
  Event,
  EventEmitter,
  Fragment,
  getAssetPath,
  h,
  Host,
  Prop,
  State,
  Watch
} from '@stencil/core';
import {ExternalMenuModel, MenuItemModel, MenuModel} from "./menu-model";
import {navigateToUrl} from "single-spa";
import {NavbarService} from "./navbar-service";
import {NavbarToggledEvent} from "./navbar-toggled-event";

const LABELS = {
  'NAVBAR': {
    'BRAND_TITLE': 'GraphDB logo',
    'TOGGLE_BUTTON_TITLE': {
      'COLLAPSE': 'Collapse menu',
      'EXPAND': 'Expand menu'
    },
  }
}

@Component({
  tag: 'onto-navbar',
  styleUrl: 'onto-navbar.scss',
  shadow: false,
})
export class OntoNavbar {
  /**
   * The internal menu model used for UI rendering.
   * @private
   */
  private menuModel: MenuModel;

  /**
   * Flag indicating whether the navbar is collapsed in result of toggle action initiated by the user. This is needed
   * in cases where the browser window is resized which is an operation that should not override the user's choice
   * regarding the navbar collapsed state, e.g. if the user has manually collapsed the navbar and then resizes the
   * window, the navbar should remain collapsed.
   * @private
   */
  private isCollapsedByUser = false;

  @Element() hostElement: HTMLElement;

  /**
   * Controls the expanded/collapsed state of the navbar.
   * @private
   */
  @State()
  private isCollapsed = false;

  /**
   * Configuration whether the navbar should be collapsed.
   */
  @Prop() navbarCollapsed: boolean;

  @Watch('navbarCollapsed')
  navbarCollapsedChange(collapsed: boolean) {
    this.isCollapsed = !collapsed;
    if (this.isCollapsed && !this.isCollapsedByUser) {
      this.expandNavbar();
    } else {
      this.collapseNavbar();
    }
    this.navbarToggled.emit(new NavbarToggledEvent(this.isCollapsed));
  }

  /**
   * Configuration for the menu items model. This is the external model that is used to build the internal model.
   */
  @Prop() menuItems: ExternalMenuModel;

  @Watch('menuItems')
  menuItemsChanged(menuItems: ExternalMenuModel) {
    this.init(menuItems);
  }

  /**
   * Event fired when the navbar is toggled.
   */
  @Event() navbarToggled: EventEmitter<NavbarToggledEvent>;

  private init(menuItems: ExternalMenuModel): void {
    const navbarService = new NavbarService(menuItems);
    this.menuModel = navbarService.buildMenuModel();
  }

  private select(event: MouseEvent, menuItem: MenuItemModel) {
    event.preventDefault();
    // navigate to respective url without reloading if possible
    navigateToUrl(menuItem.href);

    const targetElement = event.target as HTMLElement;
    const mainMenuElement = targetElement.closest('.navbar-component');
    const selectedMenuElement = targetElement.closest('.menu-element');
    //
    const activeMenuElement = this.hostElement.querySelector('.active');
    // if the menu has sub menus then close other open menus and toggle this one
    const openedMenuElements = mainMenuElement.querySelectorAll('.open');
    Array.from(openedMenuElements)
      .filter((element) => element !== selectedMenuElement)
      .forEach((element) => {
        element.classList.remove('open');
      });
    console.log(`select`, '\nchildren', menuItem.children, '\nhasParent', menuItem.hasParent, '\ntarget', targetElement, '\nactive', activeMenuElement);
    if (menuItem.children.length) {
      // close the parent as this is a submenu
      selectedMenuElement.classList.toggle('open');
      // currently selected menu item contains a selected submenu item
      const selectedSubmenu = mainMenuElement.querySelectorAll('.sub-menu-item.active');
      console.log(`selectedSubmenu`, selectedSubmenu, activeMenuElement);
      // and transfer the highlight to the parent
      if (selectedSubmenu.length) {
        targetElement.classList.toggle('active');
      }
    } else {
      const activeElements = mainMenuElement.querySelectorAll('.active');
      activeElements.forEach((element) => {
        element.classList.remove('active');
      });
      // if the submenu item doesn't have a parent (it's a root level menu item), then add the active state to the root level menu item
      if (!menuItem.hasParent) {
        if (!targetElement.classList.contains('active')) {
          targetElement.classList.add('active')
        }
      } else {
        // when the sub menu item has a parent, then add the active state to the sub menu item
        targetElement.closest('.sub-menu-item').classList.add('active');
      }
    }
  }

  private toggleNavbar(): void {
    if (!this.isCollapsed) {
      this.isCollapsedByUser = true;
      this.collapseNavbar();
    } else {
      this.isCollapsedByUser = false;
      this.expandNavbar();
    }
    this.navbarToggled.emit(new NavbarToggledEvent(this.isCollapsed));
  }

  private collapseNavbar(): void {
    this.hostElement.querySelector('.navbar-component').classList.add('collapsed');
    this.isCollapsed = true;
  }

  private expandNavbar(): void {
    if (!this.isCollapsedByUser) {
      this.hostElement.querySelector('.navbar-component').classList.remove('collapsed');
      this.isCollapsed = false;
    }
  }

  // ========================
  // Lifecycle methods
  // ========================

  componentWillRender() {
    this.init(this.menuItems);
  }

  render() {
    if (!this.menuModel) {
      return;
    }
    const logoImg1 = getAssetPath(`./assets/graphdb-logo.svg#Layer_1`);
    const logoImg2 = getAssetPath(`./assets/graphdb-logo-sq.svg#Layer_1`);
    return (
      <Host>
        <ul class="navbar-component">
          <li class="brand">
            <span class="toggle-menu" title={
              this.isCollapsed ?
                LABELS.NAVBAR.TOGGLE_BUTTON_TITLE.EXPAND :
                LABELS.NAVBAR.TOGGLE_BUTTON_TITLE.COLLAPSE
            } onClick={() => this.toggleNavbar()}>
                <em class={this.isCollapsed ? 'icon-caret-right' : 'icon-caret-left'}></em>
            </span>
            <a class="menu-element-root home-page" href="./">
              <svg class="big-logo">
                <desc>{LABELS.NAVBAR.BRAND_TITLE}</desc>
                <use href={logoImg1}></use>
              </svg>
              <svg class="small-logo">
                <desc>{LABELS.NAVBAR.BRAND_TITLE}</desc>
                <use href={logoImg2}></use>
              </svg>
            </a>
          </li>
          {this.menuModel.map((item) => (
            <li class="menu-element">
              {item.children.length > 0 &&
                <Fragment>
                  <div class="menu-element-root" onClick={(event) => this.select(event, item)}>
                    <span class={`menu-item-icon ${item.icon}`}></span>
                    <translate-label class="menu-item" labelKey={item.labelKey}></translate-label>
                  </div>
                  <ul class="sub-menu">
                  {
                      item.children.map((submenu) => (
                        <li class="sub-menu-item">
                          <a class="sub-menu-link" href={submenu.href} onClick={(event) => this.select(event, submenu)}>
                            <translate-label class="menu-item" labelKey={submenu.labelKey}></translate-label>
                            {submenu.icon &&
                              <span title="some title" class={`text-muted ${submenu.icon}`}></span>
                            }
                          </a>
                        </li>
                      ))
                    }
                  </ul>
                </Fragment>
              }
              {item.children.length === 0 &&
                <a class="menu-element-root" href={item.href} onClick={(event) => this.select(event, item)}>
                  <span class={`menu-item-icon ${item.icon}`}></span>
                  <translate-label class="menu-item" labelKey={item.labelKey}></translate-label>
                </a>
              }
            </li>
          ))}
        </ul>
      </Host>
    );
  }
}
