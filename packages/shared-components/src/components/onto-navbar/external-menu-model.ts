export interface ExternalMenuItemModel {
  label: string;
  labelKey: string;
  href: string;
  documentationHref?: string;
  order: number;
  children?: ExternalMenuItemModel[];
  icon?: string;
  guideSelector?: string;
  editions?: string;
  role?: string;
  parent?: string;
  hrefFun?: string;
  shouldShow?: boolean;
}

export interface ExternalMenuItemsModel {
    items: ExternalMenuItemModel[];
}

export type ExternalMenuModel = ExternalMenuItemsModel[];
