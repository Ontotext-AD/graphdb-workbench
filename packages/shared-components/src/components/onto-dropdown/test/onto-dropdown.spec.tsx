import { newSpecPage } from '@stencil/core/testing';
import { OntoDropdown } from '../onto-dropdown';

describe('onto-dropdown', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [OntoDropdown],
      html: `<onto-dropdown></onto-dropdown>`,
    });
    expect(page.root).toEqualHtml(`
      <onto-dropdown>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </onto-dropdown>
    `);
  });
});
