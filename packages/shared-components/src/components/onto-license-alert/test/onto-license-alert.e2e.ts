import { newE2EPage } from '@stencil/core/testing';

describe('onto-license-alert', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<onto-license-alert></onto-license-alert>');

    const element = await page.find('onto-license-alert');
    expect(element).toHaveClass('hydrated');
  });
});
