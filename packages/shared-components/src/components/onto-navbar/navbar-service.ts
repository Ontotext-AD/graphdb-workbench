import {ExternalMenuItemModel, ExternalMenuModel} from "@ontotext/workbench-api";
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
            navbarModel.addItem(this.toMenuItemModel(item, undefined, item.children));
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
          topLevelItem?.addChildren(this.toMenuItemModel(item, topLevelItem, item.children));
        });
    });
  }

  private static toMenuItemModel(item: ExternalMenuItemModel, parent: NavbarItemModel, children: ExternalMenuItemModel[] = []): NavbarItemModel {
    const itemModel = new NavbarItemModel({
      label: item.label,
      labelKey: item.labelKey,
      href: item.href,
      documentationHref: item.documentationHref,
      hrefFun: item.hrefFun,
      order: item.order,
      role: item.role,
      editions: item.editions,
      icon: item.icon,
      guideSelector: item.guideSelector,
      hasParent: !!parent,
      parentModel: parent,
      parent: item.parent,
      selected: false,
      testSelector: item.testSelector,
    });
    const childrenModels = children.map((childrenItem) => this.toMenuItemModel(childrenItem, itemModel, childrenItem.children));
    itemModel.addChildren(...childrenModels);
    return itemModel;
  };
}
