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
        <div class="header-component">
          <div class="search-component">&#x1F50D;</div>
          <div class="repository-selector-component">TestRepo &#8964;</div>
          <div class="language-selector-component">EN &#8964;</div>
        </div>
      </onto-header>
    `);
  });
});
