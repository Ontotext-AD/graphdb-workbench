import { newE2EPage } from '@stencil/core/testing';

describe('onto-language-selector', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<onto-language-selector></onto-language-selector>');

    const element = await page.find('onto-language-selector');
    expect(element).toHaveClass('hydrated');
  });
});
