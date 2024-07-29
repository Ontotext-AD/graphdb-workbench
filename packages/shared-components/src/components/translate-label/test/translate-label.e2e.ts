import { newE2EPage } from '@stencil/core/testing';

describe('translate-label', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<translate-label></translate-label>');

    const element = await page.find('translate-label');
    expect(element).toHaveClass('hydrated');
  });
});
