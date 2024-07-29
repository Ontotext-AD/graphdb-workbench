import { newSpecPage } from '@stencil/core/testing';
import { TranslateLabel } from '../translate-label';

describe('translate-label', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [TranslateLabel],
      html: `<translate-label></translate-label>`,
    });
    expect(page.root).toEqualHtml(`
      <translate-label>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </translate-label>
    `);
  });
});
