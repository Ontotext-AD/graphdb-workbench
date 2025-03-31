import {
  Component,
  Element,
  Event,
  EventEmitter,
  Fragment,
  h,
  Host,
  Prop,
  State,
  Watch
} from '@stencil/core';
import {ExternalMenuModel} from "./external-menu-model";
import {NavbarToggledEvent} from "./navbar-toggled-event";
import {NavbarService} from "./navbar-service";
import {NavbarItemModel, NavbarModel} from "./navbar-model";
import {TranslationService} from '../../services/translation.service';
import {navigateTo} from '@ontotext/workbench-api';

const labelKeys = {
  EXPAND: 'menu.buttons.expand',
  COLLAPSE: 'menu.buttons.collapse',
  LOGO_LINK: 'menu.logo.link.title'
};

@Component({
  tag: 'onto-navbar',
  styleUrl: 'onto-navbar.scss',
  shadow: false,
})
export class OntoNavbar {
  private labels = {
    [labelKeys.EXPAND]: TranslationService.translate(labelKeys.EXPAND),
    [labelKeys.COLLAPSE]:TranslationService.translate(labelKeys.COLLAPSE),
    [labelKeys.LOGO_LINK]: TranslationService.translate(labelKeys.LOGO_LINK)
  }

  /**
   * Flag indicating whether the navbar is collapsed in result of toggle action initiated by the user. This is needed
   * in cases where the browser window is resized which is an operation that should not override the user's choice
   * regarding the navbar collapsed state, e.g. if the user has manually collapsed the navbar and then resizes the
   * window, the navbar should remain collapsed.
   */
  private isCollapsedByUser = false;

  @Element() hostElement: HTMLOntoNavbarElement;

  /**
   * The internal menu model used for UI rendering.
   */
  @State() private menuModel: NavbarModel;

  /**
   * Controls the expanded/collapsed state of the navbar.
   */
  @State() private isCollapsed = false;

  /**
   * Configuration whether the navbar should be collapsed.
   */
  @Prop() navbarCollapsed: boolean;

  /**
   * The selected menu item. If provided, the menu item will be highlighted.
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
    // Navigate to respective url without reloading if possible.
    // #navigateToUrl function is exposed by the root-config and comes from the single-spa.
    // It's currently provided this way in order to prevent components to depend
    // from single-spa. Although this is not the best approach, it'd work for now.
    // @ts-ignore
    window.singleSpa.navigateToUrl(menuItem.href);

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

    // When the navbar is collapsed then find if the selected item has active children and mark the item as selected
    // to allow it to be highlighted in the collapsed state.
    if (this.isCollapsed && this.menuModel.isParentOpened(menuItem)) {
      this.menuModel.closeOpened();
    }

    this.refreshNavbar()
  }

  private toggleNavbar(): void {
    if (!this.isCollapsed) {
      this.isCollapsedByUser = true;
      this.menuModel.highlightSelected();
      this.menuModel.closeOpened();
      this.collapseNavbar();
    } else {
      this.isCollapsedByUser = false;
      this.menuModel.expandSelected();
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
    this.menuModel = new NavbarModel(this.menuModel.items);
  }

  private onLanguageChanged(): void {
    this.refreshNavbar();
  }

  private onTranslate(key: string): void {
    TranslationService.onTranslate(
      key,
      [],
      (translation) => {
        this.labels[key] = translation;
        this.onLanguageChanged();
      }
    );
  }

  // ========================
  // Lifecycle methods
  // ========================

  componentWillLoad() {
    this.init(this.menuItems);
    // subscribe to language change events for each label
    this.onTranslate(labelKeys.EXPAND);
    this.onTranslate(labelKeys.COLLAPSE);
    this.onTranslate(labelKeys.LOGO_LINK);
  }

  private handleSelectMenuItem(item: NavbarItemModel) {
    return (event: MouseEvent) => {
      this.select(event, item);
    }
  }

  private toggleNavbarHandler() {
    return () => this.toggleNavbar();
  }

  render() {
    if (!this.menuModel) {
      return;
    }
    const logoImg1 = '/assets/graphdb-logo.svg#Layer_1';
    const logoImg2 = '/assets/graphdb-logo-sq.svg#Layer_1';
    return (
      <Host>
        <ul class="navbar-component">
          <li class="brand">
            <span class="toggle-menu" title={
              this.isCollapsed ? this.labels[labelKeys.EXPAND] : this.labels[labelKeys.COLLAPSE]
            } onClick={this.toggleNavbarHandler()}>
                <em class={this.isCollapsed ? 'icon-caret-right' : 'icon-caret-left'}></em>
            </span>
            <a class="menu-element-root home-page" onClick={navigateTo('./')}>
              <svg class="big-logo">
                <desc>{this.labels[labelKeys.LOGO_LINK]}</desc>
                <use href={logoImg1}></use>
              </svg>
              <svg class="small-logo">
                <desc>{this.labels[labelKeys.LOGO_LINK]}</desc>
                <use href={logoImg2}></use>
              </svg>
            </a>
          </li>
          {this.menuModel.items.map((item) => (
            <li key={item.labelKey} class={{'menu-element': true, 'open': item.open}}>
              {item.children.length > 0 &&
                <Fragment>
                  <div class={{'menu-element-root': true, 'active': item.selected}}
                       onClick={this.handleSelectMenuItem(item)}>
                    <span class={`menu-item-icon ${item.icon}`}></span>
                    <translate-label class="menu-item" labelKey={item.labelKey}></translate-label>
                  </div>
                  <ul class="sub-menu">
                    <li key={item.labelKey} class="submenu-title">
                      <translate-label labelKey={item.labelKey}></translate-label>
                    </li>
                    {
                      item.children.map((submenu) => (
                        <li key={submenu.labelKey} class={{'sub-menu-item': true, 'active': submenu.selected}}>
                          <a class="sub-menu-link" href={submenu.href} onClick={this.handleSelectMenuItem(submenu)}>
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
                   href={item.href} onClick={this.handleSelectMenuItem(item)}>
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
