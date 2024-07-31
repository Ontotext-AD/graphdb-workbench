import {NavbarService} from '../navbar-service';
import {ExternalMenuModel} from '../external-menu-model';
import {NavbarItemModel, NavbarModel} from '../navbar-model';

describe('NavbarService', () => {
  let mockExternalMenuModel: ExternalMenuModel;

  beforeEach(() => {
    mockExternalMenuModel = [
      {
        items: [
          {
            label: 'Import',
            labelKey: 'common.import',
            href: 'import',
            order: 0,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-import',
            guideSelector: 'menu-import',
            children: []
          }
        ]
      },
      {
        items: [
          {
            label: 'Explore',
            labelKey: 'menu.explore.label',
            href: '#',
            order: 1,
            role: 'IS_AUTHENTICATED_FULLY',
            icon: 'icon-data',
            guideSelector: 'menu-explore',
            children: []
          }
        ]
      },
      {
        items: [
          {
            label: 'Class relationships',
            labelKey: 'menu.class.relationships.label',
            href: 'relationships',
            order: 2,
            parent: 'Explore',
            guideSelector: 'sub-menu-class-relationships'
          },
          {
            label: 'Class hierarchy',
            labelKey: 'menu.class.hierarchy.label',
            href: 'hierarchy',
            order: 1,
            parent: 'Explore',
            guideSelector: 'menu-class-hierarchy'
          },
          {
            label: 'Visual graph',
            labelKey: 'visual.graph.label',
            href: 'graphs-visualizations',
            order: 5,
            parent: 'Explore',
            children: [],
            guideSelector: 'sub-menu-visual-graph'
          }
        ]
      }
    ];
  });

  describe('map', () => {
    it('should map external menu model to navbar model', () => {
      const navbarModel = NavbarService.map(mockExternalMenuModel);
      expect(navbarModel).toBeInstanceOf(NavbarModel);
      const actual = new NavbarModel();
      actual.addItem(new NavbarItemModel({
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
      }));
      actual.addItem(new NavbarItemModel({
        label: 'Explore',
        labelKey: 'menu.explore.label',
        href: '#',
        order: 1,
        role: 'IS_AUTHENTICATED_FULLY',
        icon: 'icon-data',
        guideSelector: 'menu-explore',
        hasParent: false,
        selected: false,
        children: [
          new NavbarItemModel({
            label: 'Class hierarchy',
            labelKey: 'menu.class.hierarchy.label',
            href: 'hierarchy',
            order: 1,
            parent: 'Explore',
            guideSelector: 'menu-class-hierarchy',
            children: [],
            hasParent: true,
            selected: false
          }),
          new NavbarItemModel({
            label: 'Class relationships',
            labelKey: 'menu.class.relationships.label',
            href: 'relationships',
            order: 2,
            parent: 'Explore',
            guideSelector: 'sub-menu-class-relationships',
            children: [],
            hasParent: true,
            selected: false
          }),
          new NavbarItemModel({
            label: 'Visual graph',
            labelKey: 'visual.graph.label',
            href: 'graphs-visualizations',
            order: 5,
            parent: 'Explore',
            children: [],
            guideSelector: 'sub-menu-visual-graph',
            hasParent: true,
            selected: false
          })
        ]
      }));
      expect(navbarModel).toEqual(actual)
    });
  });
});
