import {TooltipUtil} from './tooltip-util';
import * as tippyModule from 'tippy.js';
import {newSpecPage, SpecPage} from "jest-stencil-runner";

const tippySpy = jest.spyOn(tippyModule, 'default');

describe('TooltipUtil', () => {
  let element: HTMLElement;
  let page: SpecPage;

  beforeEach(async () => {
    page = await newSpecPage({
      components: [],
      html: '<button>Click me</button>',
    });
    element = page.body.querySelector('button');
  });

  afterEach(() => {
    page.body.innerHTML = '';
    jest.resetAllMocks();
  });

  describe('getTooltipInstance', () => {
    it('should return undefined when no tooltip is attached', () => {
      expect(TooltipUtil.getTooltipInstance(element)).toBeUndefined();
    });

    it('should return the existing tooltip instance', () => {
      const instance = {} as tippyModule.Instance;
      // @ts-ignore
      element._tippy = instance;
      expect(TooltipUtil.getTooltipInstance(element)).toBe(instance);
    });
  });

  describe('createTooltip', () => {
    it('should call tippy.js with config from element attributes', () => {
      element.setAttribute('tooltip-content', 'test');
      element.setAttribute('tooltip-theme', 'dark');
      element.setAttribute('tooltip-placement', 'top');
      element.setAttribute('tooltip-trigger', 'click');
      element.setAttribute('tooltip-append-to', 'body');

      TooltipUtil.createTooltip(element);

      expect(tippySpy).toHaveBeenCalledWith(element, expect.objectContaining({
        content: 'test',
        theme: 'dark',
        placement: 'top',
        trigger: 'click',
        appendTo: expect.anything(),
      }));
    });
  });

  describe('getOrCreateTooltipInstance', () => {
    it('should return existing tooltip instance if present', () => {
      const instance = {} as tippyModule.Instance;
      // @ts-ignore
      element._tippy = instance;
      const result = TooltipUtil.getOrCreateTooltipInstance(element);
      expect(result).toBe(instance);
    });

    it('should create new instance if none exists', () => {
      element.setAttribute('tooltip-content', 'new');
      TooltipUtil.getOrCreateTooltipInstance(element);
      expect(tippySpy).toHaveBeenCalled();
    });
  });

  describe('updateTooltipContent', () => {
    it('should update content if tooltip exists and content is not empty', () => {
      const setContent = jest.fn();
      const instance = {setContent} as unknown as tippyModule.Instance;
      // @ts-ignore
      element._tippy = instance;

      TooltipUtil.updateTooltipContent(element, 'Updated');
      expect(setContent).toHaveBeenCalledWith('Updated');
    });

    it('should do nothing if no tooltip is present', () => {
      expect(() => TooltipUtil.updateTooltipContent(element, 'Noop')).not.toThrow();
    });

    it('should do nothing if content is empty', () => {
      const setContent = jest.fn();
      const instance = {setContent} as unknown as tippyModule.Instance;
      // @ts-ignore
      element._tippy = instance;

      TooltipUtil.updateTooltipContent(element, '');
      expect(setContent).not.toHaveBeenCalled();
    });
  });

  describe('destroyTooltip', () => {
    it('should destroy tooltip if instance exists', () => {
      const destroy = jest.fn();
      const instance = {destroy} as unknown as tippyModule.Instance;
      // @ts-ignore
      element._tippy = instance;

      TooltipUtil.destroyTooltip(element);
      expect(destroy).toHaveBeenCalled();
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
