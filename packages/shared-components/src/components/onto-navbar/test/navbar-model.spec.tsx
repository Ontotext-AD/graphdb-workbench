import {NavbarItemModel, NavbarModel} from '../navbar-model';

describe('NavbarModel', () => {
  describe('constructor', () => {
    it('Should initialize navbar with data through constructor', () => {
      const model = buildModel([item1]);

      const expected = {
        _items: [
          new NavbarItemModel({
            label: 'Import',
            labelKey: 'common.import',
            href: 'import',
            order: 0,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-import',
            guideSelector: 'menu-import',
            children: [],
            hasParent: false,
            selected: false
          })
        ]
      };

      expect(model).toEqual(expected);
    });
  });

  describe('addItem', () => {
    it('Should add a new item in the model', () => {
      const model = buildModel([item1]);
      model.addItem(new NavbarItemModel({
        label: 'Explore',
        labelKey: 'menu.explore.label',
        href: '#',
        order: 1,
        role: 'IS_AUTHENTICATED_FULLY',
        icon: 'icon-data',
        guideSelector: 'menu-explore',
        hasParent: false,
        selected: false,
        children: []
      }));

      const expected = {
        _items: [
          new NavbarItemModel({
            label: 'Import',
            labelKey: 'common.import',
            href: 'import',
            order: 0,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-import',
            guideSelector: 'menu-import',
            children: [],
            hasParent: false,
            selected: false
          }),
          new NavbarItemModel({
            label: 'Explore',
            labelKey: 'menu.explore.label',
            href: '#',
            order: 1,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-data',
            guideSelector: 'menu-explore',
            hasParent: false,
            selected: false,
            children: []
          })
        ]
      };

      expect(model).toEqual(expected);
    });
  });

  describe('getSelectedRootItem', () => {
    it('Should return the selected root item', () => {
      const model = buildModel([item1, {...item2, selected: true}]);
      const selectedItem = model.getSelectedRootItem();

      expect(selectedItem).toHaveProperty('label', 'Explore');
    });

    it('Should return undefined if no item is selected', () => {
      const model = buildModel([item1, item2]);
      const selectedItem = model.getSelectedRootItem();

      expect(selectedItem).toBeUndefined();
    });
  });

  describe('isParentOpened', () => {
    it('Should return false if provided item has no parent', () => {
      const _item1 = new NavbarItemModel(item1);
      const _item2 = new NavbarItemModel(item2);
      const model = buildModel([_item1, _item2]);
      expect(model.isParentOpened(_item2)).toBeFalsy();
    });

    it('Should return true if the parent of provided item is marked as open', () => {
      const itemWithChildren = new NavbarItemModel(item2);
      itemWithChildren.open = true;
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([new NavbarItemModel(item1), itemWithChildren]);

      expect(model.isParentOpened(child2)).toBeTruthy();
    });

    it('Should return false if the parent of provided item is not marked as open', () => {
      const itemWithChildren = new NavbarItemModel(item2);
      itemWithChildren.open = false;
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([new NavbarItemModel(item1), itemWithChildren]);

      expect(model.isParentOpened(child2)).toBeFalsy();
    });
  });

  describe('getTopLevelItem', () => {
    it('Should return a top level item which has the expected label property', () => {
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([new NavbarItemModel(item1), itemWithChildren]);

      expect(model.getTopLevelItem('Explore')).toEqual(itemWithChildren);
    });

    it('Should return undefined if a top level item with such label is not found', () => {
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([new NavbarItemModel(item1), itemWithChildren]);

      expect(model.getTopLevelItem('Settings')).toBeUndefined();
    });
  });

  describe('getParentItem', () => {
    it('Should return a top level item which has the same label property', () => {
      const topItem1 = new NavbarItemModel(item1);
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([topItem1, itemWithChildren]);

      expect(model.getParentItem(child2)).toEqual(itemWithChildren);
    });

    it('Should return undefined if a top level item with the same label is not found', () => {
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([new NavbarItemModel(item1), itemWithChildren]);

      expect(model.getParentItem(new NavbarItemModel(item6))).toBeUndefined();
    });
  });

  describe('deselectAll', () => {
    it('Should deselect all menu items in the model', () => {
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      child2.selected = true;
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([new NavbarItemModel(item1), itemWithChildren]);

      model.deselectAll();
      expect(child2.selected).toBeFalsy();
    });
  });

  describe('closeAll', () => {
    it('Should mark all menu items in the model as not open', () => {
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      child2.open = true;
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([new NavbarItemModel(item1), itemWithChildren]);

      model.closeAll();
      expect(child2.open).toBeFalsy();
    });
  });

  describe('deselectItem', () => {
    it('Should deselect a menu item', () => {
      const topItem1 = new NavbarItemModel(item1);
      const topItem2 = new NavbarItemModel(item6);
      topItem2.selected = true;
      const model = buildModelFromInstances([topItem1, topItem2]);

      model.deselectItem(topItem2);
      expect(topItem2.selected).toBeFalsy();
    });
  });

  describe('selectItem', () => {
    it('Should select a menu item', () => {
      const topItem1 = new NavbarItemModel(item1);
      const topItem2 = new NavbarItemModel(item6);
      const model = buildModelFromInstances([topItem1, topItem2]);

      model.selectItem(topItem2);
      expect(topItem2.selected).toBeTruthy();
    });
  });

  describe('hasSelectedSubmenu', () => {
    it('Should return true if the top level item has a selected submenu', () => {
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      child2.selected = true;
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([new NavbarItemModel(item1), itemWithChildren]);

      expect(model.hasSelectedSubmenu(itemWithChildren)).toBeTruthy();
    });

    it('Should return false if the top level item does not have a selected submenu', () => {
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([new NavbarItemModel(item1), itemWithChildren]);

      expect(model.hasSelectedSubmenu(itemWithChildren)).toBeFalsy();
    });

    it('Should return false if the top level item has no children', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([itemWithoutChildren, itemWithChildren]);

      expect(model.hasSelectedSubmenu(itemWithoutChildren)).toBeFalsy();
    });
  });

  describe('closeOpened', () => {
    it('Should close the top level item and mark it as selected when it has a selected child', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithChildren = new NavbarItemModel(item2);
      itemWithChildren.open = true;
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      child2.selected = true;
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([itemWithoutChildren, itemWithChildren]);

      model.closeOpened();
      expect(itemWithChildren.open).toBeFalsy();
      expect(itemWithChildren.selected).toBeTruthy();
    });

    it('Should not select the top level item if it does not have a selected children', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithChildren = new NavbarItemModel(item2);
      itemWithChildren.open = true;
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([itemWithoutChildren, itemWithChildren]);

      model.closeOpened();
      expect(itemWithChildren.open).toBeFalsy();
      expect(itemWithChildren.selected).toBeFalsy();
    });

    it('Should not modify the top level item if its not open', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([itemWithoutChildren, itemWithChildren]);

      model.closeOpened();
      expect(itemWithChildren.open).toBeFalsy();
      expect(itemWithChildren.selected).toBeFalsy();
    });
  });

  describe('open', () => {
    it('Should open a top level item and closes all others', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithChildren1 = new NavbarItemModel(item2);
      itemWithChildren1.open = true;
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren1.children = [child1, child2];
      const itemWithChildren2 = new NavbarItemModel(item6);
      itemWithChildren2.children = [new NavbarItemModel(item5), new NavbarItemModel(item6)];
      const model = buildModelFromInstances([itemWithoutChildren, itemWithChildren1, itemWithChildren2]);

      model.open(itemWithChildren2);
      expect(itemWithChildren1.open).toBeFalsy();
      expect(itemWithChildren2.open).toBeTruthy();
    });
  });

  describe('closeOtherParents', () => {
    it('Should close all parents except the parent of the provided item', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithChildren1 = new NavbarItemModel(item2);
      itemWithChildren1.open = true;
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren1.children = [child1, child2];
      const itemWithChildren2 = new NavbarItemModel(item6);
      itemWithChildren2.open = true;
      itemWithChildren2.children = [new NavbarItemModel(item5), new NavbarItemModel(item6)];
      const model = buildModelFromInstances([itemWithoutChildren, itemWithChildren1, itemWithChildren2]);

      model.closeOtherParents(child1);
      expect(itemWithChildren1.open).toBeTruthy();
      expect(itemWithChildren2.open).toBeFalsy();
    });
  });

  describe('highlightSelected', () => {
    it('Should select the parent of the item which is selected', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      child2.selected = true;
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([itemWithoutChildren, itemWithChildren]);

      model.highlightSelected();
      expect(itemWithChildren.selected).toBeTruthy();
    });

    it('Should not select any parent if no selected item is found', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([itemWithoutChildren, itemWithChildren]);

      model.highlightSelected();
      expect(itemWithChildren.selected).toBeFalsy();
    });
  });

  describe('unhighlightSelected', () => {
    it('Should deselect the selected root item which is also open and has children', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithChildren = new NavbarItemModel(item2);
      itemWithChildren.selected = true;
      itemWithChildren.open = true;
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([itemWithoutChildren, itemWithChildren]);

      model.unhighlightSelected();
      expect(itemWithChildren.selected).toBeFalsy();
    });

    it('Should not deselect the selected root item which is not open', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithChildren = new NavbarItemModel(item2);
      itemWithChildren.selected = true;
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([itemWithoutChildren, itemWithChildren]);

      model.unhighlightSelected();
      expect(itemWithChildren.selected).toBeTruthy();
    });

    it('Should not deselect the selected root item which does not have children', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithoutChildren2 = new NavbarItemModel(item2);
      itemWithoutChildren2.selected = true;
      itemWithoutChildren2.open = true;
      const model = buildModelFromInstances([itemWithoutChildren, itemWithoutChildren2]);

      model.unhighlightSelected();
      expect(itemWithoutChildren2.selected).toBeTruthy();
    });
  });

  describe('getSelectedItem', () => {
    it('Should return a top level selected item', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithChildren = new NavbarItemModel(item2);
      itemWithChildren.selected = true;
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([itemWithoutChildren, itemWithChildren]);

      expect(model.getSelectedItem()).toEqual(itemWithChildren);
    });

    it('Should return a sub menu selected item', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      child2.selected = true;
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([itemWithoutChildren, itemWithChildren]);

      expect(model.getSelectedItem()).toEqual(child2);
    });
  });

  describe('initSelected', () => {
    it('Should init a selected top level item', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([itemWithoutChildren, itemWithChildren]);

      model.initSelected('import');
      expect(itemWithoutChildren.selected).toBeTruthy();
    });

    it('Should init a selected sub menu item', () => {
      const itemWithoutChildren = new NavbarItemModel(item1);
      const itemWithChildren = new NavbarItemModel(item2);
      const child1 = new NavbarItemModel(item3);
      const child2 = new NavbarItemModel(item4);
      itemWithChildren.children = [child1, child2];
      const model = buildModelFromInstances([itemWithoutChildren, itemWithChildren]);

      model.initSelected('relationships');
      expect(itemWithChildren.open).toBeTruthy();
      expect(child2.selected).toBeTruthy();
    });
  });
})

function buildModelFromInstances(items: NavbarItemModel[] = []): NavbarModel {
  return new NavbarModel(items);
}

function buildModel(items: any[] = []): NavbarModel {
  const _items = items.map(item => new NavbarItemModel({...item}));
  return new NavbarModel(_items);
}

const item1 = {
  label: 'Import',
  labelKey: 'common.import',
  href: 'import',
  order: 0,
  role: 'IS_AUTHENTICATED_FULLY',
  icon: 'icon-import',
  guideSelector: 'menu-import',
  hasParent: false,
  selected: false,
  children: []
};

const item2 = {
  label: 'Explore',
  labelKey: 'menu.explore.label',
  href: '#',
  order: 1,
  role: 'IS_AUTHENTICATED_FULLY',
  icon: 'icon-data',
  guideSelector: 'menu-explore',
  hasParent: false,
  selected: false,
  children: []
};

const item3 = {
  label: 'Class hierarchy',
  labelKey: 'menu.class.hierarchy.label',
  href: 'hierarchy',
  order: 1,
  parent: 'Explore',
  guideSelector: 'menu-class-hierarchy',
  children: [],
  hasParent: true,
  selected: false
};

const item4 = {
  label: 'Class relationships',
  labelKey: 'menu.class.relationships.label',
  href: 'relationships',
  order: 2,
  parent: 'Explore',
  guideSelector: 'sub-menu-class-relationships',
  children: [],
  hasParent: true,
  selected: false
};

const item5 = {
  label: 'Visual graph',
  labelKey: 'visual.graph.label',
  href: 'graphs-visualizations',
  order: 5,
  parent: 'Explore',
  children: [],
  guideSelector: 'sub-menu-visual-graph',
  hasParent: true,
  selected: false
};

const item6 = {
  label: 'SPARQL',
  labelKey: 'menu.sparql.label',
  href: 'sparql',
  order: 2,
  icon: 'icon-sparql',
  children: [],
  guideSelector: 'sub-menu-visual-graph',
  hasParent: false,
  selected: false
};
