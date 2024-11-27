import { newE2EPage } from '@stencil/core/testing';

describe('onto-tooltip', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<onto-tooltip></onto-tooltip>');

    const element = await page.find('onto-tooltip');
    expect(element).toHaveClass('hydrated');
  });
});
