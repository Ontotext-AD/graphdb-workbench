import { newSpecPage } from '@stencil/core/testing';
import { OntoLanguageSelector } from '../onto-language-selector';

describe('onto-language-selector', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [OntoLanguageSelector],
      html: `<onto-language-selector></onto-language-selector>`,
    });
    expect(page.root).toEqualHtml(`
      <onto-language-selector>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </onto-language-selector>
    `);
  });
});
