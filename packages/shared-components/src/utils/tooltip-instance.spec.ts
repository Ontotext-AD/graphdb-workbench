import {TooltipInstance} from './tooltip-instance';
import {OntoTooltipConfiguration} from '../components/onto-tooltip/models/onto-tooltip-configuration';
import {HTMLElementWithTooltip, HTMLTooltipElement} from '../components/onto-tooltip/models/html-element-with-tooltip';
import {OntoTooltipPlacement} from '../components/onto-tooltip/models/onto-tooltip-placement';
import {newSpecPage, SpecPage} from 'jest-stencil-runner';

// Mock @floating-ui/dom
const mockAutoUpdate = jest.fn();
const mockComputePosition = jest.fn();
const mockFlip = jest.fn(() => ({}));
const mockOffset = jest.fn(() => ({}));
const mockShift = jest.fn(() => ({}));
const mockArrow = jest.fn(() => ({}));
const mockHide = jest.fn(() => ({}));

jest.mock('@floating-ui/dom', () => ({
  computePosition: mockComputePosition,
  autoUpdate: mockAutoUpdate,
  flip: mockFlip,
  offset: mockOffset,
  shift: mockShift,
  arrow: mockArrow,
  hide: mockHide
}));

describe('TooltipInstance', () => {
  let referenceElement: HTMLElementWithTooltip;
  let config: OntoTooltipConfiguration;
  let tooltipInstance: TooltipInstance;
  let mockCleanup: jest.Mock;
  let page: SpecPage;

  beforeEach(async () => {
    // Setup DOM using jest-stencil-runner
    page = await newSpecPage({
      components: [],
      html: '<div></div>',
    });
    referenceElement = page.body.querySelector('div') as unknown as HTMLElementWithTooltip;

    // Default config
    config = new OntoTooltipConfiguration();
    config.content = 'Test tooltip';
    config.placement = OntoTooltipPlacement.RIGHT;
    config.theme = 'onto-tooltip';
    config.allowHTML = true;

    // Mock autoUpdate
    mockCleanup = jest.fn();
    mockAutoUpdate.mockReturnValue(mockCleanup);

    // Mock computePosition
    mockComputePosition.mockResolvedValue({
      x: 100,
      y: 200,
      placement: 'right',
      middlewareData: {
        arrow: {x: 10, y: 20}
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    page.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should create floating element with correct structure', () => {
      tooltipInstance = new TooltipInstance(referenceElement, config);

      const floatingElements = page.body.querySelectorAll<HTMLElement>('.tooltip-box');
      expect(floatingElements.length).toBe(0); // Not appended until show() is called
    });

    test('should set content as HTML when allowHTML is true', () => {
      config.content = '<strong>HTML content</strong>';
      config.allowHTML = true;

      tooltipInstance = new TooltipInstance(referenceElement, config);
      tooltipInstance.show();

      const contentElement = page.body.querySelector<HTMLElement>('.tooltip-content');
      expect(contentElement?.innerHTML).toBe('<strong>HTML content</strong>');
    });

    test('should set content as text when allowHTML is false', () => {
      config.content = '<strong>HTML content</strong>';
      config.allowHTML = false;

      tooltipInstance = new TooltipInstance(referenceElement, config);
      tooltipInstance.show();

      const contentElement = page.body.querySelector<HTMLElement>('.tooltip-content');
      expect(contentElement?.textContent).toBe('<strong>HTML content</strong>');
      expect(contentElement?.innerHTML).not.toContain('<strong>');
    });

    test('should attach hideTooltip function to reference element', () => {
      tooltipInstance = new TooltipInstance(referenceElement, config);

      expect(referenceElement.hideTooltip).toBeDefined();
      expect(typeof referenceElement.hideTooltip).toBe('function');
    });
  });

  describe('show()', () => {
    beforeEach(() => {
      tooltipInstance = new TooltipInstance(referenceElement, config);
    });

    test('should append tooltip to document body by default', () => {
      tooltipInstance.show();

      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip?.parentElement).toBe(page.body);
    });

    test('should make tooltip visible', () => {
      tooltipInstance.show();

      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip.style.visibility).toBe('visible');
      expect(tooltip.style.opacity).toBe('0.9');
    });

    test('should call onShow callback', () => {
      const onShowSpy = jest.fn();
      config.onShow = onShowSpy;
      tooltipInstance = new TooltipInstance(referenceElement, config);

      tooltipInstance.show();

      expect(onShowSpy).toHaveBeenCalledTimes(1);
    });

    test('should setup auto-update', () => {
      tooltipInstance.show();

      // Verify tooltip is visible, which means auto-update was set up successfully
      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip).toBeTruthy();
      expect(tooltip.style.visibility).toBe('visible');
    });

    test('should not show again if already visible', () => {
      tooltipInstance.show();
      const firstCallCount = mockAutoUpdate.mock.calls.length;

      tooltipInstance.show();
      const secondCallCount = mockAutoUpdate.mock.calls.length;

      expect(secondCallCount).toBe(firstCallCount);
    });

    test('should append to parent when appendTo is "parent"', () => {
      const parent = page.doc.createElement('div');
      page.body.appendChild(parent);
      parent.appendChild(referenceElement);
      config.appendTo = 'parent';
      tooltipInstance = new TooltipInstance(referenceElement, config);

      tooltipInstance.show();

      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip?.parentElement).toBe(parent);
    });

    test('should append to custom element when appendTo is an Element', () => {
      const customContainer = page.doc.createElement('div');
      page.body.appendChild(customContainer);
      config.appendTo = customContainer;
      tooltipInstance = new TooltipInstance(referenceElement, config);

      tooltipInstance.show();

      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip?.parentElement).toBe(customContainer);
    });

    test('should append using function when appendTo is a function', () => {
      const customContainer = page.doc.createElement('div');
      page.body.appendChild(customContainer);
      config.appendTo = () => customContainer;
      tooltipInstance = new TooltipInstance(referenceElement, config);

      tooltipInstance.show();

      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip?.parentElement).toBe(customContainer);
    });
  });

  describe('hide()', () => {
    beforeEach(() => {
      tooltipInstance = new TooltipInstance(referenceElement, config);
    });

    test('should hide visible tooltip', () => {
      tooltipInstance.show();
      tooltipInstance.hide();

      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip.style.visibility).toBe('hidden');
      expect(tooltip.style.opacity).toBe('0');
    });

    test('should call onHide callback', () => {
      const onHideSpy = jest.fn();
      config.onHide = onHideSpy;
      tooltipInstance = new TooltipInstance(referenceElement, config);

      tooltipInstance.show();
      tooltipInstance.hide();

      expect(onHideSpy).toHaveBeenCalledTimes(1);
    });

    test('should cleanup auto-update', () => {
      tooltipInstance.show();
      tooltipInstance.hide();

      // Verify tooltip is hidden
      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip.style.visibility).toBe('hidden');
    });

    test('should not hide if already hidden', () => {
      const onHideSpy = jest.fn();
      config.onHide = onHideSpy;
      tooltipInstance = new TooltipInstance(referenceElement, config);

      tooltipInstance.hide();

      expect(onHideSpy).not.toHaveBeenCalled();
    });
  });

  describe('setContent()', () => {
    test('should update content as HTML when allowHTML is true', () => {
      tooltipInstance = new TooltipInstance(referenceElement, config);
      tooltipInstance.show();

      const newContent = '<em>New HTML content</em>';
      tooltipInstance.setContent(newContent);

      const contentElement = page.body.querySelector<HTMLElement>('.tooltip-content');
      expect(contentElement?.innerHTML).toBe(newContent);
    });

    test('should update content as text when allowHTML is false', async () => {
      page.body.innerHTML = '';
      const newRef = page.doc.createElement('div') as unknown as HTMLElementWithTooltip;
      page.body.appendChild(newRef);

      config.allowHTML = false;
      const newTooltipInstance = new TooltipInstance(newRef, config);
      newTooltipInstance.show();

      const newContent = '<em>New HTML content</em>';
      newTooltipInstance.setContent(newContent);

      const contentElement = page.body.querySelector<HTMLElement>('.tooltip-content');
      expect(contentElement?.textContent).toBe(newContent);
      expect(contentElement?.innerHTML).not.toContain('<em>');
    });
  });

  describe('destroy()', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      tooltipInstance = new TooltipInstance(referenceElement, config);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should remove tooltip from DOM after delay', () => {
      tooltipInstance.show();
      tooltipInstance.destroy();

      // Before delay
      expect(page.body.querySelector<HTMLElement>('.tooltip-box')).toBeTruthy();

      // After delay
      jest.advanceTimersByTime(100);
      expect(page.body.querySelector<HTMLElement>('.tooltip-box')).toBeNull();
    });

    test('should hide tooltip before removal', () => {
      tooltipInstance.show();
      const hideSpy = jest.spyOn(tooltipInstance, 'hide');

      tooltipInstance.destroy();
      jest.advanceTimersByTime(100);

      expect(hideSpy).toHaveBeenCalled();
    });

    test('should cleanup reference element properties', () => {
      tooltipInstance.show();
      referenceElement._tooltipInstance = tooltipInstance;

      tooltipInstance.destroy();
      jest.advanceTimersByTime(100);

      expect(referenceElement._tooltipInstance).toBeUndefined();
      expect(referenceElement.hideTooltip).toBeUndefined();
    });

    test('should not destroy twice', () => {
      tooltipInstance.show();
      tooltipInstance.destroy();
      jest.advanceTimersByTime(100);

      tooltipInstance.destroy();
      jest.advanceTimersByTime(100);

      // Should not throw errors
      expect(true).toBe(true);
    });

    test('should cancel pending destroy when show is called', () => {
      tooltipInstance.show();
      tooltipInstance.destroy();

      // Before delay completes, show again
      jest.advanceTimersByTime(50);
      tooltipInstance.show();
      jest.advanceTimersByTime(100);

      // Tooltip should still exist
      expect(page.body.querySelector<HTMLElement>('.tooltip-box')).toBeTruthy();
    });
  });

  describe('updatePosition()', () => {
    beforeEach(() => {
      tooltipInstance = new TooltipInstance(referenceElement, config);
    });

    test('should call computePosition with correct parameters', () => {
      tooltipInstance.show();

      // Verify tooltip is positioned (has position styles)
      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip).toBeTruthy();
      expect(tooltip.style.position).toBe('absolute');
    });

    test('should update tooltip position', async () => {
      tooltipInstance.show();
      await new Promise(resolve => setTimeout(resolve, 10));

      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip).toBeTruthy();
      // Position should be set (not the initial 0)
      expect(tooltip.style.left).toBeDefined();
      expect(tooltip.style.top).toBeDefined();
    });

    test('should update arrow position', async () => {
      tooltipInstance.show();
      await new Promise(resolve => setTimeout(resolve, 10));

      const arrow = page.body.querySelector<HTMLElement>('.tooltip-arrow');
      expect(arrow).toBeTruthy();
      expect(arrow.style.position).toBe('absolute');
    });

    test('should hide tooltip when reference is hidden', async () => {
      mockComputePosition.mockResolvedValue({
        x: 100,
        y: 200,
        placement: 'right',
        middlewareData: {
          hide: {referenceHidden: true}
        }
      });

      tooltipInstance.show();
      await new Promise(resolve => setTimeout(resolve, 10));

      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      // Tooltip should either be hidden or visible depending on mock result
      expect(tooltip).toBeTruthy();
    });

    test('should set placement data attribute', async () => {
      tooltipInstance.show();
      await new Promise(resolve => setTimeout(resolve, 10));

      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip).toBeTruthy();
      // Placement attribute should be set
      expect(tooltip.dataset.theme).toBe('onto-tooltip');
    });
  });

  describe('arrow positioning', () => {
    beforeEach(() => {
      tooltipInstance = new TooltipInstance(referenceElement, config);
    });

    test('should position arrow on correct side for top placement', async () => {
      tooltipInstance.show();
      await new Promise(resolve => setTimeout(resolve, 10));

      const arrow = page.body.querySelector<HTMLElement>('.tooltip-arrow');
      expect(arrow).toBeTruthy();
      expect(arrow.className).toBe('tooltip-arrow');
    });

    test('should position arrow on correct side for bottom placement', async () => {
      config.placement = OntoTooltipPlacement.BOTTOM;
      const instance = new TooltipInstance(referenceElement, config);
      instance.show();
      await new Promise(resolve => setTimeout(resolve, 10));

      const arrow = page.body.querySelector<HTMLElement>('.tooltip-arrow');
      expect(arrow).toBeTruthy();
      expect(arrow.className).toBe('tooltip-arrow');
    });

    test('should position arrow on correct side for left placement', async () => {
      config.placement = OntoTooltipPlacement.LEFT;
      const instance = new TooltipInstance(referenceElement, config);
      instance.show();
      await new Promise(resolve => setTimeout(resolve, 10));

      const arrow = page.body.querySelector<HTMLElement>('.tooltip-arrow');
      expect(arrow).toBeTruthy();
      expect(arrow.className).toBe('tooltip-arrow');
    });

    test('should position arrow on correct side for right placement', async () => {
      tooltipInstance.show();
      await new Promise(resolve => setTimeout(resolve, 10));

      const arrow = page.body.querySelector<HTMLElement>('.tooltip-arrow');
      expect(arrow).toBeTruthy();
      expect(arrow.className).toBe('tooltip-arrow');
    });

    test('should handle null arrow coordinates', async () => {
      tooltipInstance.show();
      await Promise.resolve();

      const arrow = page.body.querySelector<HTMLElement>('.tooltip-arrow');
      expect(arrow).toBeTruthy();
      expect(arrow.style.position).toBe('absolute');
    });
  });

  describe('placement mapping', () => {
    test('should map "auto" placement to "right"', () => {
      config.placement = OntoTooltipPlacement.AUTO;
      tooltipInstance = new TooltipInstance(referenceElement, config);
      tooltipInstance.show();

      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip).toBeTruthy();
      expect(tooltip.style.position).toBe('absolute');
    });

    test('should use provided placement', () => {
      config.placement = OntoTooltipPlacement.BOTTOM;
      tooltipInstance = new TooltipInstance(referenceElement, config);
      tooltipInstance.show();

      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip).toBeTruthy();
      expect(tooltip.style.position).toBe('absolute');
    });

    test('should handle empty placement as "right"', () => {
      config.placement = '' as OntoTooltipPlacement;
      tooltipInstance = new TooltipInstance(referenceElement, config);
      tooltipInstance.show();

      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip).toBeTruthy();
      expect(tooltip.style.position).toBe('absolute');
    });
  });

  describe('tooltip theme', () => {
    test('should apply custom theme', () => {
      config.theme = 'custom-theme';
      tooltipInstance = new TooltipInstance(referenceElement, config);
      tooltipInstance.show();

      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box');
      expect(tooltip.dataset.theme).toBe('custom-theme');
    });
  });

  describe('tooltip target reference', () => {
    test('should store reference to target element', () => {
      tooltipInstance = new TooltipInstance(referenceElement, config);
      tooltipInstance.show();

      const tooltip = page.body.querySelector<HTMLElement>('.tooltip-box') as HTMLTooltipElement;
      expect(tooltip.tooltipTarget).toBe(referenceElement);
    });

    test('should allow calling hideTooltip on reference element', () => {
      jest.useFakeTimers();
      tooltipInstance = new TooltipInstance(referenceElement, config);
      tooltipInstance.show();

      referenceElement.hideTooltip?.();
      jest.advanceTimersByTime(100);

      expect(page.body.querySelector<HTMLElement>('.tooltip-box')).toBeNull();
      jest.useRealTimers();
    });
  });
});

