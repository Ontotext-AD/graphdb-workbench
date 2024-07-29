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
import {ExternalMenuModel} from "./external-menu-model";
import {navigateToUrl} from "single-spa";
import {NavbarToggledEvent} from "./navbar-toggled-event";
import {NavbarService} from "./navbar-service";
import {NavbarItemModel, NavbarModel} from "./navbar-model";

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
   * Flag indicating whether the navbar is collapsed in result of toggle action initiated by the user. This is needed
   * in cases where the browser window is resized which is an operation that should not override the user's choice
   * regarding the navbar collapsed state, e.g. if the user has manually collapsed the navbar and then resizes the
   * window, the navbar should remain collapsed.
   * @private
   */
  private isCollapsedByUser = false;

  @Element() hostElement: HTMLElement;

  /**
   * The internal menu model used for UI rendering.
   * @private
   */
  @State()
  private menuModel: NavbarModel;

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

  /**
   * The selected menu item.
   */
  @Prop() selectedMenu: string;

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
    const internalModel = NavbarService.map(menuItems || []);
    internalModel.initSelected(this.selectedMenu);
    this.menuModel = internalModel;
  }

  private select(event: MouseEvent, menuItem: NavbarItemModel) {
    event.preventDefault();
    // navigate to respective url without reloading if possible
    navigateToUrl(menuItem.href);

    console.log(`%cchildren:`, 'background: orange', menuItem.open, menuItem.children);
    if (menuItem.children.length) {
      if (!menuItem.open) {
        this.menuModel.closeOpened();
        this.menuModel.open(menuItem);
        if (this.menuModel.hasSelectedSubmenu(menuItem)) {
          this.menuModel.deselectItem(menuItem);
        }
      } else {
        this.menuModel.closeAll();
        if (this.menuModel.hasSelectedSubmenu(menuItem)) {
          this.menuModel.selectItem(menuItem);
        }
      }
    } else {
      this.menuModel.closeOtherParents(menuItem);
      this.menuModel.deselectAll();
      this.menuModel.selectItem(menuItem);
    }

    this.refreshNavbar()
  }

  private toggleNavbar(): void {
    if (!this.isCollapsed) {
      this.isCollapsedByUser = true;
      this.menuModel.highlightSelected();
      this.collapseNavbar();
    } else {
      this.isCollapsedByUser = false;
      this.menuModel.unhighlightSelected();
      this.expandNavbar();
    }
    this.refreshNavbar();
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

  private refreshNavbar(): void {
    this.menuModel = new NavbarModel(this.menuModel._items);
  }

  // ========================
  // Lifecycle methods
  // ========================

  componentWillLoad() {
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
          {this.menuModel._items.map((item) => (
            <li class={{'menu-element': true, 'open open2': item.open}}>
              {item.children.length > 0 &&
                <Fragment>
                  <div class={{'menu-element-root': true, 'active': item.selected}}
                       onClick={(event) => this.select(event, item)}>
                    <span class={`menu-item-icon ${item.icon}`}></span>
                    <translate-label class="menu-item" labelKey={item.labelKey}></translate-label>
                  </div>
                  <ul class="sub-menu">
                  {
                      item.children.map((submenu) => (
                        <li class={{'sub-menu-item': true, 'active': submenu.selected}}>
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
                <a class={{'menu-element-root': true, 'active': item.selected}}
                   href={item.href} onClick={(event) => this.select(event, item)}>
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
