import { newE2EPage } from '@stencil/core/testing';

describe('onto-layout', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<onto-layout></onto-layout>');

    const element = await page.find('onto-layout');
    expect(element).toHaveClass('hydrated');
  });
});
