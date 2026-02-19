import {Plugin} from './plugin';

/**
 * Represents a main menu plugin item in the application.
 */
export class MainMenuPlugin extends Plugin {
  private _items: MainMenuItem[];
  constructor(mainMenuPlugin: Partial<MainMenuPlugin>) {
    super();
    this._items = mainMenuPlugin.items || [];
  }

  get items(): MainMenuItem[] {
    return this._items;
  }

  set items(value: MainMenuItem[]) {
    this._items = value || [];
  }
}

/**
 * Represents an item in the main menu of the application.
 */
export class MainMenuItem {
  private _label: string;
  private _labelKey: string;
  private _href: string;
  private _documentationHref?: string;
  private _children?: MainMenuItem[];
  private _icon?: string;
  private _guideSelector?: string;
  private _editions?: string;
  private _role?: string;
  private _parent?: string;
  private _hrefFun?: string;
  private _shouldShow?: boolean;
  private _testSelector?: string;
  private _order = 0;
  private _priority = 0;

  constructor(mainMenuItems: Partial<MainMenuItem>) {
    this._label = mainMenuItems.label ?? '';
    this._labelKey = mainMenuItems.labelKey ?? '';
    this._href = mainMenuItems.href ?? '';
    this._documentationHref = mainMenuItems.documentationHref;
    this._order = mainMenuItems.order ?? this._order;
    this._priority = mainMenuItems.priority ?? this._priority;
    this._children = mainMenuItems.children;
    this._icon = mainMenuItems.icon;
    this._guideSelector = mainMenuItems.guideSelector;
    this._editions = mainMenuItems.editions;
    this._role = mainMenuItems.role;
    this._parent = mainMenuItems.parent;
    this._hrefFun = mainMenuItems.hrefFun;
    this._shouldShow = mainMenuItems.shouldShow;
    this._testSelector = mainMenuItems.testSelector;
  }

  get label(): string {
    return this._label;
  }
  set label(value: string) {
    this._label = value;
  }

  get labelKey(): string {
    return this._labelKey;
  }
  set labelKey(value: string) {
    this._labelKey = value;
  }

  get href(): string {
    return this._href;
  }
  set href(value: string) {
    this._href = value;
  }

  get documentationHref(): string | undefined {
    return this._documentationHref;
  }
  set documentationHref(value: string | undefined) {
    this._documentationHref = value;
  }

  get children(): MainMenuItem[] | undefined {
    return this._children;
  }
  set children(value: MainMenuItem[] | undefined) {
    this._children = value;
  }

  get icon(): string | undefined {
    return this._icon;
  }
  set icon(value: string | undefined) {
    this._icon = value;
  }

  get guideSelector(): string | undefined {
    return this._guideSelector;
  }
  set guideSelector(value: string | undefined) {
    this._guideSelector = value;
  }

  get editions(): string | undefined {
    return this._editions;
  }
  set editions(value: string | undefined) {
    this._editions = value;
  }

  get role(): string | undefined {
    return this._role;
  }
  set role(value: string | undefined) {
    this._role = value;
  }

  get parent(): string | undefined {
    return this._parent;
  }
  set parent(value: string | undefined) {
    this._parent = value;
  }

  get hrefFun(): string | undefined {
    return this._hrefFun;
  }
  set hrefFun(value: string | undefined) {
    this._hrefFun = value;
  }

  get shouldShow(): boolean | undefined {
    return this._shouldShow;
  }
  set shouldShow(value: boolean | undefined) {
    this._shouldShow = value;
  }

  get testSelector(): string | undefined {
    return this._testSelector;
  }
  set testSelector(value: string | undefined) {
    this._testSelector = value;
  }

  get order(): number {
    return this._order;
  }

  set order(value: number) {
    this._order = value;
  }

  get priority(): number {
    return this._priority;
  }

  set priority(value: number) {
    this._priority = value;
  }
}
