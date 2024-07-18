import { newE2EPage } from '@stencil/core/testing';

describe('onto-navbar', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<onto-navbar></onto-navbar>');

    const element = await page.find('onto-navbar');
    expect(element).toHaveClass('hydrated');
  });
});
