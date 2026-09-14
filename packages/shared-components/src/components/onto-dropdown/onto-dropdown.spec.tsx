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
});
