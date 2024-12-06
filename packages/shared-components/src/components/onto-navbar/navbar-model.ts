/**
 * The UI model for the navbar component.
 */
export class NavbarModel {
  /**
   * The model is private and should not be accessed directly. Use the provided methods to interact with the model.
   */
  private readonly _items: NavbarItemModel[];

  /**
   * Creates a new instance of the navbar model.
   * @param items The model items. If no items are provided, the model will be empty by default.
   */
  constructor(items: NavbarItemModel[] = []) {
    this._items = items;
  }

  hasParent(parentLabel: string): boolean {
    return this._items.some((parentItem) => parentLabel === parentItem.label);
  }

  /**
   * Clones the model. This method is useful when the model needs to be modified without affecting the original model.
   * @return The cloned model.
   */
  getModel(): NavbarItemModel[] {
    const cloneItem = (item: NavbarItemModel): NavbarItemModel => {
      const clonedChildren = item.children.map(cloneItem);
      return new NavbarItemModel({...item, children: clonedChildren});
    };
    return this._items.map(cloneItem);
  }

  /**
   * Adds a new top level item to the model. The sub menu items should be added separately as children before calling
   * this method.
   * @param item The item to be added.
   */
  addItem(item: NavbarItemModel): void {
    this._items.push(item);
  }

  /**
   * Returns the selected root item.
   * @return The selected root item or null if no item is selected.
   */
  getSelectedRootItem(): NavbarItemModel | undefined {
    return this._items.find((item) => item.selected);
  }

  /**
   * Checks if the parent of the provided item is opened.
   * @param item The menu item for which the parent needs to be checked.
   * @return True if the parent is opened, false otherwise. If the item has no parent, the method returns false.
   */
  isParentOpened(item: NavbarItemModel): boolean {
    return !!this.getParentItem(item)?.open;
  }

  /**
   * Returns the top level menu item with the given label.
   * @param parent The label of the top level menu item. Each menu item has a label which identifies it in the model.
   * The label comes from the main menu plugin definition and should be unique for each menu item.
   * @return The top level menu item or undefined if no item is found.
   */
  getTopLevelItem(parent: string) {
    return this._items.find((item) => item.label === parent);
  }

  /**
   * Returns the top level menu item with the same label as the parent property of the provided item.
   * @param item The menu item for which the parent is needed.
   * @return The parent menu item or undefined if no parent is found.
   */
  getParentItem(item: NavbarItemModel): NavbarItemModel {
    return this._items.find((i) => i.label === item.parent);
  }

  /**
   * Deselects all menu items.
   */
  deselectAll(): void {
    this.walk((item) => {
      item.selected = false;
    });
  }

  /**
   * Closes all opened top level menu items.
   */
  closeAll(): void {
    this.walk((item) => {
      item.open = false;
    });
  }

  /**
   * Deselects a top level menu item. When a menu item is selected it is highlighted in the UI.
   * @param item The top level menu item to be deselected.
   */
  deselectItem(item: NavbarItemModel): void {
    item.selected = false;
  }

  /**
   * Selects a top level menu item. When a menu item is selected it is highlighted in the UI.
   * @param item The top level menu item to be selected.
   */
  selectItem(item: NavbarItemModel): void {
    item.selected = true;
  }

  /**
   * Checks if a top level menu item has a selected submenu.
   * @param item The top level menu item to be checked.
   * @return True if the top level menu item has a selected submenu, false otherwise.
   */
  hasSelectedSubmenu(item: NavbarItemModel): boolean {
    return item.children && item.children.some((child) => child.selected);
  }

  /**
   * Marks an opened top level menu item as closed. If the item has a selected submenu, then the top level menu item
   * is marked as selected to indicate that the submenu is active.
   */
  closeOpened(): void {
    const opened = this._items.find((item) => item.open);
    if (opened) {
      if (this.hasSelectedSubmenu(opened)) {
        this.selectItem(opened);
      }
      opened.open = false;
    }
  }

  /**
   * Opens a top level menu item and closes all other top level menu items.
   * @param item The top level menu item to be opened.
   */
  open(item: NavbarItemModel): void {
    this.walk((item) => {
      item.open = false;
    });
    item.open = true;
  }

  /**
   * Closes all top level menu items except the one that is the parent of the current item.
   * @param currentItem The current menu item.
   */
  closeOtherParents(currentItem: NavbarItemModel): void {
    const parent = currentItem.parent;
    this.walk((item) => {
      if (item.label !== parent) {
        item.open = false;
      }
    });
  }

  /**
   * Highlights the selected menu item by selecting its parent if it has one.
   * This is useful when the navbar is collapsed. This operation is the opposite of the unhighlightSelected method.
   */
  highlightSelected() {
    const selectedItem = this.getSelectedItem();
    if (selectedItem?.hasParent) {
      this.selectItem(this.getParentItem(selectedItem));
    }
  }

  /**
   * Unhighlights the selected opened menu item if it has a submenu. This is useful when the navbar is going to be expanded.
   * This operation is the opposite of the highlightSelected method.
   */
  unhighlightSelected() {
    const selectedRootItem = this.getSelectedRootItem();
    if (selectedRootItem && selectedRootItem.children.length && selectedRootItem.open) {
      this.deselectItem(selectedRootItem);
    }
  }

  /**
   * Finds out the selected menu item. It can be a top level menu item or a submenu item.
   * @return The selected menu item or null if no item is selected.
   */
  getSelectedItem(): NavbarItemModel {
    let selectedItem: NavbarItemModel = null;

    const findSelected = (item: NavbarItemModel) => {
      if (item.selected) {
        selectedItem = item;
        return true;
      }
      if (item.children) {
        for (const child of item.children) {
          if (findSelected(child)) {
            return true;
          }
        }
      }
      return false;
    };

    this._items.some(findSelected);
    return selectedItem;
  }

  expandSelected(): void {
    const selectedItem = this.getSelectedItem();
    if (selectedItem) {
      if (selectedItem.hasParent) {
        this.open(this.getParentItem(selectedItem));
      } else {
        this.open(selectedItem);
      }
    }
  }

  /**
   * Finds out the menu item by its href property and marks it as selected if it is a top level menu. If the menu item
   * is a sub menu, it marks its parent as opened and the sub menu item as selected.
   * @param selectedMenu The href of the menu item to be selected.
   */
  initSelected(selectedMenu: string): void {
    this.walk((item) => {
      if (item.href === selectedMenu) {
        if (item.hasParent) {
          this.open(this.getParentItem(item));
        }
        this.selectItem(item);
      }
    });
  }

  /**
   * Sorts the menu items by their order property.
   * @return The sorted model.
   */
  sorted(): NavbarModel {
    this._items
      .filter((item) => item.children)
      .forEach((item) => {
        item.children.sort(NavbarModel.compare);
      });
    this._items.sort(NavbarModel.compare);
    return this;
  }

  private static compare(a: NavbarItemModel, b: NavbarItemModel): number {
    return a.order - b.order;
  }

  /**
   * Walks recursively through the model and executes the provided callback for each item.
   * @param callback The callback to be executed for each item.
   */
  private walk(callback: (item: NavbarItemModel) => void): void {
    this._items.forEach((item) => {
      callback(item);
      if (item.children) {
        item.children.forEach((child) => {
          callback(child);
        });
      }
    });
  }

  get items(): NavbarItemModel[] {
    return this._items;
  }
}

/**
 * The model for a single menu item.
 */
export class NavbarItemModel {
  private _order: number;
  private _label: string;
  private _labelKey: string;
  private _href: string;
  private _children: NavbarItemModel[];
  private _hasParent: boolean;
  private _parent: string;
  private _selected: boolean = false;
  private _open: boolean = false;
  private _hrefFun?: string;
  private _editions?: string;
  private _icon?: string;
  private _role?: string;
  private _guideSelector?: string;

  constructor(data: any) {
    this._order = data.order;
    this._label = data.label;
    this._labelKey = data.labelKey;
    this._href = data.href;
    this._children = data.children;
    this._hasParent = data.hasParent;
    this._parent = data.parent;
    this._selected = data.selected;
    this._open = data.open;
    this._hrefFun = data.hrefFun;
    this._editions = data.editions;
    this._icon = data.icon;
    this._role = data.role;
    this._guideSelector = data.guideSelector
  }

  addChildren(children: NavbarItemModel): void {
    this.children.push(children);
  }

  get parent(): string {
    return this._parent;
  }

  set parent(value: string) {
    this._parent = value;
  }

  get order(): number {
    return this._order;
  }

  set order(value: number) {
    this._order = value;
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

  get children(): NavbarItemModel[] {
    return this._children;
  }

  set children(value: NavbarItemModel[]) {
    this._children = value;
  }

  get hasParent(): boolean {
    return this._hasParent;
  }

  set hasParent(value: boolean) {
    this._hasParent = value;
  }

  get selected(): boolean {
    return this._selected;
  }

  set selected(value: boolean) {
    this._selected = value;
  }

  get open(): boolean {
    return this._open;
  }

  set open(value: boolean) {
    this._open = value;
  }

  get hrefFun(): string {
    return this._hrefFun;
  }

  set hrefFun(value: string) {
    this._hrefFun = value;
  }

  get editions(): string {
    return this._editions;
  }

  set editions(value: string) {
    this._editions = value;
  }

  get icon(): string {
    return this._icon;
  }

  set icon(value: string) {
    this._icon = value;
  }

  get role(): string {
    return this._role;
  }

  set role(value: string) {
    this._role = value;
  }

  get guideSelector(): string {
    return this._guideSelector;
  }

  set guideSelector(value: string) {
    this._guideSelector = value;
  }
}
