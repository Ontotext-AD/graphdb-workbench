import { newE2EPage } from '@stencil/core/testing';

describe('onto-footer', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<onto-footer></onto-footer>');

    const element = await page.find('onto-footer');
    expect(element).toHaveClass('hydrated');
  });
});
