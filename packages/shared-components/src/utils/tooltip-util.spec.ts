// Mock TooltipInstance before imports
import {HTMLElementWithTooltip} from '../components/onto-tooltip/models/html-element-with-tooltip';

const mockConstructor = jest.fn();
jest.mock('./tooltip-instance', () => ({
  TooltipInstance: jest.fn().mockImplementation((...args) => mockConstructor(...args))
}));

import {TooltipUtil} from './tooltip-util';
import {newSpecPage, SpecPage} from 'jest-stencil-runner';

// Create mock instance factory
const createMockInstance = () => ({
  show: jest.fn(),
  hide: jest.fn(),
  destroy: jest.fn(),
  setContent: jest.fn(),
  state: {isVisible: false, isDestroyed: false},
  props: {trigger: 'manual'}
});

describe('TooltipUtil', () => {
  let element: HTMLElementWithTooltip;
  let page: SpecPage;
  let mockInstance;

  beforeEach(async () => {
    page = await newSpecPage({
      components: [],
      html: '<button>Click me</button>',
    });
    element = page.body.querySelector('button') as unknown as HTMLElementWithTooltip;

    // Create a fresh mock instance for each test
    mockInstance = createMockInstance();
    mockConstructor.mockReturnValue(mockInstance);
  });

  afterEach(() => {
    page.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('getTooltipInstance', () => {
    it('should return undefined when no tooltip is attached', () => {
      expect(TooltipUtil.getTooltipInstance(element)).toBeUndefined();
    });

    it('should return the existing tooltip instance', () => {
      const instance = TooltipUtil.getOrCreateTooltipInstance(element);
      expect(TooltipUtil.getTooltipInstance(element)).toBe(instance);
    });
  });

  describe('createTooltip', () => {
    it('should create TooltipInstance with config from element attributes', () => {
      element.setAttribute('tooltip-content', 'test');
      element.setAttribute('tooltip-theme', 'dark');
      element.setAttribute('tooltip-placement', 'top');
      element.setAttribute('tooltip-append-to', 'body');

      TooltipUtil.createTooltip(element);

      expect(mockConstructor).toHaveBeenCalledWith(element, expect.objectContaining({
        content: 'test',
        theme: 'dark',
        placement: 'top',
      }));
      expect(element.classList.contains('onto-tooltip')).toBeTruthy();
    });
  });

  describe('getOrCreateTooltipInstance', () => {
    it('should return existing tooltip instance if present', () => {
      const instance = TooltipUtil.createTooltip(element);
      const result = TooltipUtil.getOrCreateTooltipInstance(element);
      expect(result).toBe(instance);
    });

    it('should create new instance if none exists', () => {
      element.setAttribute('tooltip-content', 'new');
      let instance = TooltipUtil.getTooltipInstance(element);
      expect(instance).toBeFalsy();
      instance = TooltipUtil.getOrCreateTooltipInstance(element);
      expect(instance).toBeTruthy();
      expect(mockConstructor).toHaveBeenCalled();
    });
  });

  describe('updateTooltipContent', () => {
    it('should update content if tooltip exists and content is not empty', () => {
      const instance = TooltipUtil.createTooltip(element);
      TooltipUtil.updateTooltipContent(element, 'Updated');
      expect(instance.setContent).toHaveBeenCalledWith('Updated');
    });

    it('should do nothing if no tooltip is present', () => {
      TooltipUtil.updateTooltipContent(element, 'Noop');
      expect(() => TooltipUtil.updateTooltipContent(element, 'Noop')).not.toThrow();
    });

    it('should do nothing if content is empty', () => {
      const instance = TooltipUtil.createTooltip(element);
      TooltipUtil.updateTooltipContent(element, '');
      expect(instance.setContent).not.toHaveBeenCalled();
    });
  });

  describe('destroyTooltip', () => {
    it('should not destroy tooltip if instance exists, but not created by util method', () => {
      const destroy = jest.fn();
      const instance = {
        destroy,
        state: {isDestroyed: false}
      };
      // @ts-expect-error TS2339: Property _tooltipInstance does not exist on type HTMLElement
      element._tooltipInstance = instance;

      TooltipUtil.destroyTooltip(element);
      expect(destroy).not.toHaveBeenCalled();
    });

    it('should destroy tooltip if instance exists when created by util method', () => {
      TooltipUtil.getOrCreateTooltipInstance(element);
      TooltipUtil.destroyTooltip(element);
      expect(mockInstance.destroy).toHaveBeenCalled();
    });

    it('should not throw if no instance exists', () => {
      expect(() => TooltipUtil.destroyTooltip(element)).not.toThrow();
    });
  });

  describe('getTooltipTarget', () => {
    it('should return self if element has tooltip-content', () => {
      element.setAttribute('tooltip-content', 'yes');
      expect(TooltipUtil.getTooltipTarget(element)).toBe(element);
    });

    it('should return parent with tooltip-content', () => {
      const parent = document.createElement('div');
      parent.setAttribute('tooltip-content', 'yes');
      parent.appendChild(element);
      document.body.appendChild(parent);

      expect(TooltipUtil.getTooltipTarget(element)).toBe(parent);
    });

    it('should return null if no matching element found', () => {
      expect(TooltipUtil.getTooltipTarget(element)).toBeNull();
    });
  });
});
