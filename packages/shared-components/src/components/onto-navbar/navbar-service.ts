import {ExternalMenuItemModel, ExternalMenuModel} from './external-menu-model';
import {NavbarItemModel, NavbarModel} from './navbar-model';
import {ProductInfo, UriUtil} from '@ontotext/workbench-api';

export class NavbarService {

  static map(navbarPlugins: ExternalMenuModel, productInfo: ProductInfo): NavbarModel {
    const navbarModel = new NavbarModel();
    NavbarService.setTopLevelMenuItems(navbarPlugins, navbarModel, productInfo);
    NavbarService.setSubmenuItems(navbarPlugins, navbarModel, productInfo);
    return navbarModel.sorted();
  }

  private static setTopLevelMenuItems(navbarPlugins: ExternalMenuModel, navbarModel: NavbarModel, productInfo: ProductInfo) {
    navbarPlugins.forEach((menuPlugin) => {
      menuPlugin.items
        .filter((item) => !item.parent && item.shouldShow)
        .forEach((item) => {
          if (navbarModel.hasParent(item.label)) {
            console.warn('Doubled parent definition: ', item);
          } else {
            navbarModel.addItem(this.toMenuItemModel(item, undefined, productInfo, item.children));
          }
        });
    });
  }

  private static setSubmenuItems(navbarPlugins: ExternalMenuModel, navbarModel: NavbarModel, productInfo: ProductInfo) {
    navbarPlugins.forEach((menuPlugin) => {
      menuPlugin.items
        .filter((item) => item.parent && item.shouldShow)
        .forEach((item) => {
          const topLevelItem = navbarModel.getTopLevelItem(item.parent);
          // Some submenu items in the external menu model have children which is unusual.
          // I'm not sure if and where these children are used. For now, I'm ignoring them.
          topLevelItem?.addChildren(this.toMenuItemModel(item, topLevelItem, productInfo, item.children));
        });
    });
  }

  private static toMenuItemModel(item: ExternalMenuItemModel, parent: NavbarItemModel, productInfo: ProductInfo, children: ExternalMenuItemModel[] = []): NavbarItemModel {
    let externalLink: string;
    if (item.documentationHref) {
      externalLink = UriUtil.resolveDocumentationUrl(productInfo?.shortVersion, item.documentationHref);
    }
    const itemModel = new NavbarItemModel({
      label: item.label,
      labelKey: item.labelKey,
      href: externalLink || item.href,
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
      shouldShow: item.shouldShow,
      testSelector: item.testSelector,
    });
    const childrenModels = children.map((childrenItem) => this.toMenuItemModel(childrenItem, itemModel, productInfo, childrenItem.children));
    itemModel.addChildren(...childrenModels);
    return itemModel;
  };
}
