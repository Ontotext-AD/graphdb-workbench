import {newSpecPage} from '@stencil/core/testing';
import {DropdownItem} from '../../models/dropdown/dropdown-item';

jest.mock('@ontotext/workbench-api', () => ({
  LanguageContextService: class {},
  Loggers: {getLoggerInstance: () => ({error: jest.fn(), warn: jest.fn()})},
  ServiceProvider: {
    get: () => ({
      getDefaultBundle: () => ({}),
      onLanguageBundleChanged: () => jest.fn(),
    }),
  },
}));

let OntoDropdown: typeof import('./onto-dropdown').OntoDropdown;

beforeAll(async () => {
  ({OntoDropdown} = await import('./onto-dropdown'));
});

describe('onto-dropdown item tooltips', () => {
  it('does not show an asynchronous tooltip after the pointer leaves the item', async () => {
    let resolveTooltip: (content: string) => void;
    const tooltip = new Promise<string>((resolve) => {
      resolveTooltip = resolve;
    });
    const item = new DropdownItem<string>()
      .setName('Item')
      .setValue('item')
      .setTooltip(() => tooltip);
    const page = await newSpecPage({
      components: [OntoDropdown],
      html: '<onto-dropdown></onto-dropdown>',
    });
    page.root.items = [item];
    await page.waitForChanges();

    const menuItem = page.root.querySelector('.onto-dropdown-menu-item') as HTMLButtonElement;
    const dispatchEventSpy = jest.spyOn(menuItem, 'dispatchEvent');

    menuItem.dispatchEvent(new MouseEvent('mouseenter'));
    menuItem.dispatchEvent(new MouseEvent('mouseleave'));
    resolveTooltip('Resolved tooltip');
    await tooltip;
    await Promise.resolve();

    expect(menuItem.getAttribute('tooltip-content')).toBeNull();
    expect(dispatchEventSpy).not.toHaveBeenCalledWith(expect.objectContaining({type: 'mouseover'}));
  });

  it('refreshes the hovered button tooltip once when the tooltip function changes', async () => {
    // Utility function to flush pending promises and timeouts
    const flush = () => new Promise((resolve) => setTimeout(resolve, 100));
    // Initial tooltip function for the dropdown button
    const initialTooltip = jest.fn(() => Promise.resolve('Initial tooltip'));
    // new specPage for the dropdown component
    const page = await newSpecPage({
      components: [OntoDropdown],
      html: '<onto-dropdown></onto-dropdown>',
    });

    page.root.dropdownButtonTooltip = initialTooltip;
    await page.waitForChanges();

    // Hover over the dropdown button to trigger the initial tooltip
    const button = page.root.querySelector('.onto-dropdown-button') as HTMLButtonElement;
    button.dispatchEvent(new MouseEvent('mouseenter'));
    await flush();
    await page.waitForChanges();

    expect(button.getAttribute('tooltip-content')).toBe('Initial tooltip');
    expect(initialTooltip).toHaveBeenCalledTimes(1);

    // Update the tooltip function for the dropdown button
    const refreshedTooltip = jest.fn(() => Promise.resolve('Refreshed tooltip'));
    page.root.dropdownButtonTooltip = refreshedTooltip;
    await page.waitForChanges();
    await flush();
    await page.waitForChanges();

    expect(button.getAttribute('tooltip-content')).toBe('Refreshed tooltip');
    expect(refreshedTooltip).toHaveBeenCalledTimes(1);
    expect(initialTooltip).toHaveBeenCalledTimes(1);
  });

  it('refreshes the hovered item tooltip once when the item tooltip function changes', async () => {
    // Utility function to flush pending promises and timeouts
    const flush = () => new Promise((resolve) => setTimeout(resolve, 100));
    // Initial tooltip function for the dropdown item
    const initialTooltip = jest.fn(() => Promise.resolve('Initial tooltip'));
    // new specPage for the dropdown component
    const page = await newSpecPage({
      components: [OntoDropdown],
      html: '<onto-dropdown></onto-dropdown>',
    });

    // Utility function to create a dropdown item with a tooltip
    const createItem = (tooltip: () => Promise<string>) => new DropdownItem<string>()
      .setName('Item')
      .setValue('item')
      .setTooltip(tooltip);
    
    page.root.items = [createItem(initialTooltip)];
    await page.waitForChanges();

    // Hover over the menu item to trigger the initial tooltip
    const menuItem = page.root.querySelector('.onto-dropdown-menu-item') as HTMLButtonElement;
    menuItem.dispatchEvent(new MouseEvent('mouseenter'));
    await flush();
    await page.waitForChanges();

    expect(menuItem.getAttribute('tooltip-content')).toBe('Initial tooltip');
    expect(initialTooltip).toHaveBeenCalledTimes(1);

    // Update the tooltip function for the dropdown item
    const refreshedTooltip = jest.fn(() => Promise.resolve('Refreshed tooltip'));
    page.root.items = [createItem(refreshedTooltip)];
    await page.waitForChanges();
    await flush();
    await page.waitForChanges();

    expect(menuItem.getAttribute('tooltip-content')).toBe('Refreshed tooltip');
    expect(refreshedTooltip).toHaveBeenCalledTimes(1);
    expect(initialTooltip).toHaveBeenCalledTimes(1);
  });
});
