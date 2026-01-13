import {NavbarItemModel, NavbarModel} from '../navbar-model';
import {ProductInfo, LoggerService, ExternalMenuModel} from '@ontotext/workbench-api';
import {LoggerProvider} from '../../../services/logger-provider';
jest.spyOn(LoggerProvider, 'logger', 'get').mockReturnValue({
  loggers: jest.fn()
} as unknown as LoggerService);
import {NavbarService} from '../navbar-service';

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
            shouldShow: true,
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
            shouldShow: true,
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
            guideSelector: 'sub-menu-class-relationships',
            shouldShow: true
          },
          {
            label: 'Class hierarchy',
            labelKey: 'menu.class.hierarchy.label',
            href: 'hierarchy',
            order: 1,
            parent: 'Explore',
            guideSelector: 'menu-class-hierarchy',
            shouldShow: true
          },
          {
            label: 'Visual graph',
            labelKey: 'visual.graph.label',
            href: 'graphs-visualizations',
            order: 5,
            parent: 'Explore',
            children: [],
            guideSelector: 'sub-menu-visual-graph',
            shouldShow: true
          }
        ]
      }
    ];
  });

  describe('map', () => {
    it('should map external menu model to navbar model', () => {
      const mockProductInfo = {
        workbench: '',
        productType: '',
        productVersion: '',
        shortVersion: '',
        sesame: '',
        connectors: ''
      } as ProductInfo;
      const navbarModel = NavbarService.map(mockExternalMenuModel, mockProductInfo);
      expect(navbarModel).toBeInstanceOf(NavbarModel);
      const actual = new NavbarModel();
      const importItem = new NavbarItemModel({
        label: 'Import',
        labelKey: 'common.import',
        href: 'import',
        order: 0,
        role: 'IS_AUTHENTICATED_FULLY',
        icon: 'icon-import',
        guideSelector: 'menu-import',
        children: [],
        hasParent: false,
        selected: false,
        shouldShow: true
      });
      const exploreItem = new NavbarItemModel({
        label: 'Explore',
        labelKey: 'menu.explore.label',
        href: '#',
        order: 1,
        role: 'IS_AUTHENTICATED_FULLY',
        icon: 'icon-data',
        guideSelector: 'menu-explore',
        hasParent: false,
        selected: false,
        shouldShow: true,
        children: []
      });
      exploreItem.addChildren(
        new NavbarItemModel({
          label: 'Class hierarchy',
          labelKey: 'menu.class.hierarchy.label',
          href: 'hierarchy',
          order: 1,
          parent: 'Explore',
          guideSelector: 'menu-class-hierarchy',
          children: [],
          hasParent: true,
          selected: false,
          shouldShow: true
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
          selected: false,
          shouldShow: true
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
          selected: false,
          shouldShow: true
        })
      );
      actual.addItem(importItem);
      actual.addItem(exploreItem);
      expect(navbarModel).toEqual(actual);
    });
  });
});
