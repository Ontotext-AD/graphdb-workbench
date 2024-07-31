import { newSpecPage } from '@stencil/core/testing';
import { OntoLayout } from '../onto-layout';

describe('onto-layout', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [OntoLayout],
      html: `<onto-layout></onto-layout>`,
    });
    expect(page.root).toEqualHtml(`
      <onto-layout>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </onto-layout>
    `);
  });
});
