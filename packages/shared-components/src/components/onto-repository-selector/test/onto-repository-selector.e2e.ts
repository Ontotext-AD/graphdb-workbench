import { newE2EPage } from '@stencil/core/testing';

describe('onto-repository-selector', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<onto-repository-selector></onto-repository-selector>');

    const element = await page.find('onto-repository-selector');
    expect(element).toHaveClass('hydrated');
  });
});
