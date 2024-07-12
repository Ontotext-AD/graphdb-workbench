import { newSpecPage } from '@stencil/core/testing';
import { OntoFooter } from '../onto-footer';

describe('onto-footer', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [OntoFooter],
      html: `<onto-footer></onto-footer>`,
    });
    expect(page.root).toEqualHtml(`
      <onto-footer>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </onto-footer>
    `);
  });
});
