import {ExternalMenuItemModel, ExternalMenuModel} from "./external-menu-model";
import {NavbarItemModel, NavbarModel} from "./navbar-model";

export class NavbarService {

  static map(navbarPlugins: ExternalMenuModel): NavbarModel {
    const navbarModel = new NavbarModel();
    NavbarService.setTopLevelMenuItems(navbarPlugins, navbarModel);
    NavbarService.setSubmenuItems(navbarPlugins, navbarModel);
    return navbarModel.sorted();
  }

  private static setTopLevelMenuItems(navbarPlugins: ExternalMenuModel, navbarModel: NavbarModel) {
    navbarPlugins.forEach((menuPlugin) => {
      menuPlugin.items
        .filter((item) => !item.parent && item.shouldShow)
        .forEach((item) => {
          if (navbarModel.hasParent(item.label)) {
            console.warn("Doubled parent definition: ", item);
          } else {
            navbarModel.addItem(this.toMenuItemModel(item, item.children, undefined));
          }
        });
    });
  }

  private static setSubmenuItems(navbarPlugins: ExternalMenuModel, navbarModel: NavbarModel) {
    navbarPlugins.forEach((menuPlugin) => {
      menuPlugin.items
        .filter((item) => item.parent && item.shouldShow)
        .forEach((item) => {
          const topLevelItem = navbarModel.getTopLevelItem(item.parent)
          // Some submenu items in the external menu model have children which is unusual.
          // I'm not sure if and where these children are used. For now, I'm ignoring them.
          topLevelItem?.addChildren(this.toMenuItemModel(item, [], topLevelItem));
        });
    });
  }

  private static toMenuItemModel(item: ExternalMenuItemModel, children: ExternalMenuItemModel[] = [], parent: NavbarItemModel): NavbarItemModel {
    const itemModel = new NavbarItemModel({
      label: item.label,
      labelKey: item.labelKey,
      href: item.href,
      hrefFun: item.hrefFun,
      order: item.order,
      role: item.role,
      editions: item.editions,
      icon: item.icon,
      guideSelector: item.guideSelector,
      hasParent: !!parent,
      parent: item.parent,
      selected: false
    });
    itemModel.children = children.map((childrenItem) => this.toMenuItemModel(childrenItem, childrenItem.children, itemModel));
    return itemModel;
  };
}
