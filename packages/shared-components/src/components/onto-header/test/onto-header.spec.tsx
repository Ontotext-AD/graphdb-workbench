import { newSpecPage } from '@stencil/core/testing';
import { OntoHeader } from '../onto-header';

describe('onto-header', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [OntoHeader],
      html: `<onto-header></onto-header>`,
    });
    expect(page.root).toEqualHtml(`
      <onto-header>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </onto-header>
    `);
  });
});
