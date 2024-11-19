import { newE2EPage } from '@stencil/core/testing';

describe('onto-dropdown', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<onto-dropdown></onto-dropdown>');

    const element = await page.find('onto-dropdown');
    expect(element).toHaveClass('hydrated');
  });
});
