import {Component, Host, h, Fragment, getAssetPath, Prop, Watch, Element} from '@stencil/core';
import {ExternalMenuModel, MenuItemModel, MenuModel} from "./menu-model";
import {navigateToUrl} from "single-spa";
import {NavbarService} from "./navbar-service";

@Component({
  tag: 'onto-navbar',
  styleUrl: 'onto-navbar.scss',
  shadow: false,
})
export class OntoNavbar {
  private menuModel: MenuModel;

  @Element() hostElement: HTMLElement;

  @Prop() menuItems: ExternalMenuModel;
  @Watch('menuItems')
  configurationChanged(menuItems: ExternalMenuModel) {
    this.init(menuItems);
  }

  componentWillRender() {
    this.init(this.menuItems);
  }

  private init(menuItems: ExternalMenuModel): void {
    const navbarService = new NavbarService(menuItems);
    this.menuModel = navbarService.buildMenuModel();
  }

  private toggleNavbar(): void {
    console.log(`TODO: toggle menu`, );
  }

  private select(event: MouseEvent, menuItem: MenuItemModel) {
    event.preventDefault();
    // navigate to respective url without reloading if possible
    navigateToUrl(menuItem.href);

    const targetElement = event.target;
    if (targetElement instanceof HTMLElement) {
      const mainMenuElement = targetElement.closest('.main-menu');
      const selectedMenuElement = targetElement.closest('.menu-element');

      // if the menu has sub menus then close other open menus and toggle this one
      if (menuItem.children.length) {
        const openedMenuElements = mainMenuElement.querySelectorAll('.open');
        Array.from(openedMenuElements)
          .filter((element) => element !== selectedMenuElement)
          .forEach((element) => {
            element.classList.remove('open');
          });
        // close the parent as this is a submenu
        selectedMenuElement.classList.toggle('open');
      } else {
        const activeElements = mainMenuElement.querySelectorAll('.active');
        activeElements.forEach((element) => {
          element.classList.remove('active');
        });
        // if the submenu item doesn't have a parent (it's a root level menu item), then add the active state to the root level menu item
        if (!menuItem.hasParent) {
          if (!selectedMenuElement.classList.contains('active')) {
            selectedMenuElement.classList.add('active')
          }
        } else {
          // when the sub menu item has a parent, then add the active state to the sub menu item
          targetElement.closest('.sub-menu-item').classList.add('active');
        }
      }
    }
  }

  render() {
    if (!this.menuModel) {
      return;
    }
    const logoImg1 = getAssetPath(`./assets/graphdb-logo.svg#Layer_1`);
    const logoImg2 = getAssetPath(`./assets/graphdb-logo-sq.svg#Layer_1`);
    return (
      <Host>
        <ul class="navbar-component main-menu">
          <li class="brand">
            <span class="toggle-menu" title="Collapse menu"
              onClick={() => this.toggleNavbar()}>
                <em class="icon-caret-left"></em>
            </span>
            <a class="menu-element-root home-page" href="./">
              <svg class="big-logo">
                <desc>GraphDB logo</desc>
                <use href={logoImg1}></use>
              </svg>
              <svg class="small-logo">
                <desc>GraphDB logo</desc>
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
                      <span class="menu-item">{item.label}</span>
                    </div>
                    <ul class="sub-menu">
                      {
                        item.children.map((submenu) => (
                          <li class="sub-menu-item">
                            <a class="sub-menu-link" href={submenu.href} onClick={(event) => this.select(event, submenu)}>
                              {submenu.label}
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
                    <span class="menu-item">{item.label}</span>
                  </a>
                }
              </li>
          ))}
        </ul>
      </Host>
    );
  }
}
