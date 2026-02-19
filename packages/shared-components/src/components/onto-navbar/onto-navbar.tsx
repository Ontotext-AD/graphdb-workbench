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
import {NavbarToggledEvent} from './navbar-toggled-event';
import {NavbarService} from './navbar-service';
import {NavbarItemModel, NavbarModel} from './navbar-model';
import {TranslationService} from '../../services/translation.service';
import {
  EventName,
  EventService, getCurrentRoute, isHomePage, ProductInfo, ProductInfoContextService,
  navigate,
  service,
  SubscriptionList,
  MainMenuPlugin,
  openInNewTab,
  RepositoryContextService,
  REPOSITORY_ID_PARAM
} from '@ontotext/workbench-api';

const labelKeys = {
  EXPAND: 'menu.buttons.expand',
  COLLAPSE: 'menu.buttons.collapse',
};

@Component({
  tag: 'onto-navbar',
  styleUrl: 'onto-navbar.scss',
  shadow: false,
})
export class OntoNavbar {
  private readonly productInfoContextService = service(ProductInfoContextService);
  private readonly repositoryContextService = service(RepositoryContextService);
  private readonly subscriptions = new SubscriptionList();
  private readonly resizeHandler = () => this.adjustAllSubmenus(this.hostElement);
  private readonly SUBMENU_VERTICAL_MARGIN = 8;
  private readonly MIN_SUBMENU_HEIGHT = 100;

  private labels = {
    [labelKeys.EXPAND]: TranslationService.translate(labelKeys.EXPAND),
    [labelKeys.COLLAPSE]:TranslationService.translate(labelKeys.COLLAPSE),
  };

  private productInfo: ProductInfo;
  /**
   * Flag indicating whether the navbar is collapsed in result of toggle action initiated by the user. This is needed
   * in cases where the browser window is resized which is an operation that should not override the user's choice
   * regarding the navbar collapsed state, e.g. if the user has manually collapsed the navbar and then resizes the
   * window, the navbar should remain collapsed.
   */
  private isCollapsedByUser = false;

  private isFirstRepositoryChange = true;

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
  @Prop() menuItems: MainMenuPlugin[];

  @Watch('menuItems')
  menuItemsChanged(menuItems: MainMenuPlugin[]) {
    this.init(menuItems);
  }

  /**
   * Event fired when the navbar is toggled.
   */
  @Event() navbarToggled: EventEmitter<NavbarToggledEvent>;

  private init(menuItems: MainMenuPlugin[]): void {
    const selectedRepository = this.repositoryContextService.getSelectedRepository();
    const internalModel = NavbarService.map(menuItems || [], this.productInfo, selectedRepository?.id, REPOSITORY_ID_PARAM);
    internalModel.initSelected(getCurrentRoute());
    this.menuModel = internalModel;
  }

  private select(event: MouseEvent, menuItem: NavbarItemModel) {
    event.preventDefault();
    this.clearAllOpenedSubmenuStyles();

    // Skip navigation when the selected item is a parent menu because it has no associated navigation.
    if (!menuItem.hasSubmenus()) {
      if (event.ctrlKey) {
        openInNewTab(menuItem.href);
      } else {
        navigate(menuItem.href);
      }
    }

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
    }

    // When the navbar is collapsed then find if the selected item has active children and mark the item as selected
    // to allow it to be highlighted in the collapsed state.
    if (this.isCollapsed && this.menuModel.isParentOpened(menuItem)) {
      this.menuModel.closeOpened();
    }

    this.refreshNavbar();
    this.adjustAllSubmenus(this.hostElement);
  }

  private subscribeToNavigationEnd() {
    this.subscriptions.add(
      service(EventService).subscribe(
        EventName.NAVIGATION_END, () => {
          this.selectItemByUrl();
        }
      )
    );
  }

  private selectItemByUrl() {
    if (!this.menuModel) {
      return;
    }
    this.menuModel.deselectAll();
    this.menuModel.closeAll();
    if (!isHomePage()){
      this.menuModel.initSelected(getCurrentRoute());
    }
    this.refreshNavbar();
    this.adjustAllSubmenus(this.hostElement);
  }

  private toggleNavbar(): void {
    if (!this.isCollapsed) {
      this.isCollapsedByUser = true;
      this.menuModel.highlightSelected();
      this.menuModel.closeOpened();
      this.collapseNavbar();
      this.clearAllOpenedSubmenuStyles();
    } else {
      this.isCollapsedByUser = false;
      this.menuModel.expandSelected();
      this.menuModel.unhighlightSelected();
      this.expandNavbar();
      this.clearAllOpenedSubmenuStyles();
    }
    this.refreshNavbar();
    this.adjustAllSubmenus(this.hostElement);
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
    if (!this.menuModel?.items) {
      return;
    }
    this.menuModel = new NavbarModel(this.menuModel.items);
  }

  private onLanguageChanged(): void {
    this.refreshNavbar();
  }

  private onTranslate(key: string): void {
    this.subscriptions.add(
      TranslationService.onTranslate(
        key,
        [],
        (translation) => {
          this.labels[key] = translation;
          this.onLanguageChanged();
        }));
  }

  private toggleNavbarHandler() {
    return () => this.toggleNavbar();
  }

  /**
   * Adjust the max height of a submenu to ensure it fits within the viewport.
   * The submenu will be positioned either below or above its parent menu item based on available space.
   * @param sub The submenu element to adjust.
   * @param margin Margin in pixels to apply when calculating available space. This ensures some space between the
   * submenu and the viewport edge.
   */
  private adjustSubmenuMaxHeight(sub: HTMLElement, margin = this.SUBMENU_VERTICAL_MARGIN): void {
    if (!sub || typeof sub.getBoundingClientRect !== 'function') {
      return;
    }

    const parentElement = sub.closest('.menu-element');
    if (!parentElement) {
      return;
    }

    const subRect = sub.getBoundingClientRect();
    const parentRect = parentElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Calculate available space above and below the parent menu item
    const spaceAbove = parentRect.top - margin + parentRect.height;
    const spaceBelow = viewportHeight - parentRect.bottom + parentRect.height - margin;

    // Determine optimal positioning and max height
    let maxHeight: number;
    let shouldAlignBottom = false;

    if (spaceBelow >= subRect.height) {
      // Enough space below - align to top of parent
      maxHeight = spaceBelow;
    } else if (spaceAbove >= subRect.height) {
      // Not enough space below but enough above - align to bottom of parent
      maxHeight = spaceAbove;
      shouldAlignBottom = true;
    } else {
      // Not enough space in either direction - use larger space and make scrollable
      if (spaceBelow > spaceAbove) {
        maxHeight = spaceBelow;
        shouldAlignBottom = false;
      } else {
        maxHeight = spaceAbove;
        shouldAlignBottom = true;
      }
    }

    // Apply positioning
    if (shouldAlignBottom) {
      sub.style.bottom = '0';
      sub.style.top = 'auto';
    } else {
      sub.style.top = '0';
      sub.style.bottom = 'auto';
    }

    sub.style.maxHeight = `${Math.max(this.MIN_SUBMENU_HEIGHT, maxHeight)}px`;
    sub.style.overflowY = 'auto';
  }

  /**
   * Adjust all submenus that are currently open.
   * @param host The host element containing the navbar.
   * @param margin Margin in pixels to apply when calculating available space. This ensures some space between the
   * submenu and the viewport edge.
   */
  private adjustAllSubmenus(host: HTMLElement, margin = this.SUBMENU_VERTICAL_MARGIN): void {
    // run after paint so DOM is in final state
    requestAnimationFrame(() => {
      if (!host || typeof host.querySelectorAll !== 'function') {
        return;
      }
      this.getAllOpenedSubmenus(host).forEach((s) => this.adjustSubmenuMaxHeight(s, margin));
    });
  }

  private getAllOpenedSubmenus(host: HTMLElement): HTMLElement[] {
    return Array.from(host.querySelectorAll('.navbar-component.collapsed .menu-element.open .sub-menu'));
  }

  private getAllSubmenus(host: HTMLElement): HTMLElement[] {
    return Array.from(host.querySelectorAll('.navbar-component .menu-element .sub-menu'));
  }

  private clearAllOpenedSubmenuStyles() {
    this.getAllSubmenus(this.hostElement).forEach((s) => {
      s.style.maxHeight = '';
      s.style.overflowY = '';
      s.style.top = '';
      s.style.bottom = '';
    });
  }

  // ========================
  // Lifecycle methods
  // ========================

  componentWillLoad() {
    this.init(this.menuItems);
  }

  connectedCallback() {
    this.subscribeToNavigationEnd();
    this.subscribeToProductInfoChanges();
    this.subscribeToRepositoryChange();
    // subscribe to language change events for each label
    this.onTranslate(labelKeys.EXPAND);
    this.onTranslate(labelKeys.COLLAPSE);

    window.addEventListener('resize', this.resizeHandler);
  }

  disconnectedCallback() {
    this.subscriptions.unsubscribeAll();
    window.removeEventListener('resize', this.resizeHandler);
  }

  private handleSelectMenuItem(item: NavbarItemModel) {
    return (event: MouseEvent) => {
      this.select(event, item);
    };
  }

  render() {
    if (!this.menuModel) {
      return;
    }
    return (
      <Host>
        <ul class="navbar-component">
          <li class="navbar-toggle">
            <a class="toggle-menu no-underline" title={
              this.isCollapsed ? this.labels[labelKeys.EXPAND] : this.labels[labelKeys.COLLAPSE]
            } onClick={this.toggleNavbarHandler()}>
              <em class={this.isCollapsed ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'}></em>
            </a>
          </li>
          {this.menuModel.items.map((item) => (
            <li key={item.labelKey} class={{'menu-element': true, 'open': item.open}}
              data-test={item.testSelector} guide-selector={item.guideSelector}>
              {item.children.length > 0 &&
                <Fragment>
                  <div class={{'menu-element-root': true, 'active': item.selected}}
                    onClick={this.handleSelectMenuItem(item)}>
                    <span class={`menu-item-icon ${item.icon}`}></span>&nbsp;
                    <translate-label class="menu-item" labelKey={item.labelKey}></translate-label>
                  </div>
                  <ul class="sub-menu">
                    <li key={item.labelKey} class="submenu-title">
                      <translate-label labelKey={item.labelKey}></translate-label>
                    </li>
                    {
                      item.children.map((submenu) => (
                        <li key={submenu.labelKey} class={{'sub-menu-item': true, 'active': submenu.selected}}
                          data-test={submenu.testSelector}  guide-selector={submenu.guideSelector}>
                          {submenu.documentationHref ?
                            <a class="sub-menu-link external-link" href={submenu.href} target="_blank"
                              rel="noopener noreferrer">
                              <translate-label class="menu-item" labelKey={submenu.labelKey}></translate-label>
                              {submenu.icon &&
                                <span class={`text-muted ${submenu.icon}`}></span>
                              }
                            </a>
                            :
                            <a class="sub-menu-link" href={submenu.href}
                              onClick={this.handleSelectMenuItem(submenu)}>
                              <translate-label class="menu-item" labelKey={submenu.labelKey}></translate-label>
                              {submenu.icon &&
                                <span class={`text-muted ${submenu.icon}`}></span>
                              }
                            </a>
                          }
                        </li>
                      ))
                    }
                  </ul>
                </Fragment>
              }
              {item.children.length === 0 &&
                <a class={{'menu-element-root': true, 'active': item.selected}}
                  href={item.href} onClick={this.handleSelectMenuItem(item)}>
                  <span class={`menu-item-icon ${item.icon}`}></span>&nbsp;
                  <translate-label class="menu-item" labelKey={item.labelKey}></translate-label>
                </a>
              }
            </li>
          ))}
        </ul>
      </Host>
    );
  }

  private subscribeToProductInfoChanges() {
    this.subscriptions.add(
      this.productInfoContextService.onProductInfoChanged((productInfo: ProductInfo) => this.productInfo = productInfo)
    );
  }

  private subscribeToRepositoryChange() {
    this.subscriptions.add(
      this.repositoryContextService.onSelectedRepositoryChanged(() => {
        if (this.isFirstRepositoryChange) {
          this.isFirstRepositoryChange = false;
          return;
        }
        this.init(this.menuItems);
      })
    );
  }
}

