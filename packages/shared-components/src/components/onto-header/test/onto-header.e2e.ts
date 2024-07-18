import { newE2EPage } from '@stencil/core/testing';

describe('onto-header', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<onto-header></onto-header>');

    const element = await page.find('onto-header');
    expect(element).toHaveClass('hydrated');
  });
});
