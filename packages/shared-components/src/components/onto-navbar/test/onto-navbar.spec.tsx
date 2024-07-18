import { newSpecPage } from '@stencil/core/testing';
import { OntoNavbar } from '../onto-navbar';

describe('onto-navbar', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [OntoNavbar],
      html: `<onto-navbar></onto-navbar>`,
    });
    expect(page.root).toEqualHtml(`
      <onto-navbar>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </onto-navbar>
    `);
  });
});
