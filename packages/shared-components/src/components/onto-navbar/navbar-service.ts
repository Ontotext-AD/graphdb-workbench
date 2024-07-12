import {ExternalMenuItemModel, ExternalMenuModel, MenuItemModel, MenuModel} from "./menu-model";

export class NavbarService {
  private navbarPlugins: ExternalMenuModel;
  private navbarUIModel: MenuModel;
  private itemsWithMissedParent: ExternalMenuItemModel[];

  constructor(navbarPlugins: ExternalMenuModel) {
    this.navbarPlugins = navbarPlugins || [];
    this.navbarUIModel = [];
    this.itemsWithMissedParent = [];
  }

  buildMenuModel(): MenuModel {
    this.navbarPlugins.forEach((menu) => {
      menu.items.forEach((item) => {
        this.addItem(item);
      });
    });
    return this.navbarUIModel.sort(this.menuItemCompare);
  }

  private addItem(item: ExternalMenuItemModel): void {
    if (!item.parent) {
      if (!this.exists(this.navbarUIModel, item.label)) {
        this.navbarUIModel.push(this.toMenuItemModel(item, [], false));
        // A new parent is registered, so we try to process items which parents were missed.
        this.updateItemsWithMissedParent();
      }
    } else {
      if (!this.addItemToParent(item)) {
        // Save item because parent may not processed yet. We will try later to process it again.
        this.itemsWithMissedParent.push(item);
      }
    }
  }

  private addItemToParent(item: ExternalMenuItemModel): boolean {
    const parentItem = this.findParent(this.navbarUIModel, item.parent);
    if (parentItem) {
      if (!this.exists(parentItem.children, item.label)) {
        const children = item.children ? item.children : [];
        parentItem.children.push(this.toMenuItemModel(item, children, true));
        return true;
      }
    }
    return false;
  };

  private findParent(items: MenuModel, parent: string): MenuItemModel | undefined {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.label === parent) {
        return item;
      }
      const found = this.findParent(item.children, parent);
      if (found) {
        return found;
      }
    }
    return undefined;
  };

  private updateItemsWithMissedParent(): void {
    if (this.itemsWithMissedParent.length > 0) {
      const notProcessed = [];
      this.itemsWithMissedParent.forEach((itemWithMissedParent) => {
        if (!this.addItemToParent(itemWithMissedParent)) {
          notProcessed.push(itemWithMissedParent);
        }
      });
      this.itemsWithMissedParent = notProcessed;
    }
  };

  private toMenuItemModel(item: ExternalMenuItemModel, children: ExternalMenuItemModel[], hasParent = false): MenuItemModel {
    const convertedChildren = children.map((childrenItem) => this.toMenuItemModel(childrenItem, childrenItem.children, true));
    return {
      label: item.label,
      labelKey: item.labelKey,
      href: item.href,
      hrefFun: item.hrefFun,
      order: item.order,
      role: item.role,
      editions: item.editions,
      icon: item.icon,
      guideSelector: item.guideSelector,
      children: convertedChildren,
      hasParent: hasParent
    };
  };

  private exists(items: MenuModel, label: string): boolean {
    return items.some(item => item.label === label);
  };

  private menuItemCompare(a, b) {
    if (a.order < b.order) {
      return -1;
    }
    if (a.order > b.order) {
      return 1;
    }
    return 0;
  };
}
