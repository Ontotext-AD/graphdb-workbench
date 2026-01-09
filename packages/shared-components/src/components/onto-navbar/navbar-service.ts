import {NavbarItemModel, NavbarModel} from './navbar-model';
import {ProductInfo, UriUtil, ExternalMenuItemModel, ExternalMenuModel, REPOSITORY_ID_PARAM} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../services/logger-provider';

const logger = LoggerProvider.logger;

export class NavbarService {

  static map(navbarPlugins: ExternalMenuModel, productInfo: ProductInfo, currentRepositoryId: string): NavbarModel {
    const navbarModel = new NavbarModel();
    NavbarService.setTopLevelMenuItems(navbarPlugins, navbarModel, productInfo);
    NavbarService.setSubmenuItems(navbarPlugins, navbarModel, productInfo);
    NavbarService.addRepositoryIdToHrefAttributes(navbarModel, currentRepositoryId);
    return navbarModel.sorted();
  }

  /**
   * Adds the current repositoryId as a query parameter to href attribute of each menu item which does not have children
   * or documentationHref (external link).
   * @param navbarModel The navbar model.
   * @param currentRepositoryId The current repository id.
   */
  static addRepositoryIdToHrefAttributes(navbarModel: NavbarModel, currentRepositoryId: string) {
    navbarModel.items.forEach((item) => {
      const hasChildren = item.children && item.children.length > 0;
      if (!hasChildren) {
        item.href = `${item.href}?${REPOSITORY_ID_PARAM}=${currentRepositoryId}`;
      } else {
        item.children
          // External links don't need repositoryId param
          .filter((childItem) => !childItem.documentationHref)
          .forEach((childItem) => {
            childItem.href = `${childItem.href}?${REPOSITORY_ID_PARAM}=${currentRepositoryId}`;
          });
      }
    });
  }

  private static setTopLevelMenuItems(navbarPlugins: ExternalMenuModel, navbarModel: NavbarModel, productInfo: ProductInfo) {
    navbarPlugins.forEach((menuPlugin) => {
      menuPlugin.items
        .filter((item) => !item.parent && item.shouldShow)
        .forEach((item) => {
          if (navbarModel.hasParent(item.label)) {
            logger.warn('Doubled parent definition: ', item);
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
