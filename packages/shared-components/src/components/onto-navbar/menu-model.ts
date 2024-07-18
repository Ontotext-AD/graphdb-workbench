export interface ExternalMenuItemModel {
  label: string;
  labelKey: string;
  href: string;
  order: number;
  children?: ExternalMenuItemModel[];
  icon?: string;
  guideSelector?: string;
  editions?: string;
  role?: string;
  parent?: string;
  hrefFun?: string;
}

export interface ExternalMenuItemsModel {
    items: ExternalMenuItemModel[];
}

export type ExternalMenuModel = ExternalMenuItemsModel[];

export interface MenuItemModel {
  order: number;
  label: string;
  labelKey: string;
  href: string;
  children: MenuModel;
  hasParent: boolean;
  hrefFun?: string;
  editions?: string;
  icon?: string;
  role?: string;
  guideSelector?: string;
}

export type MenuModel = MenuItemModel[];
