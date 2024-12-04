import { newSpecPage } from '@stencil/core/testing';
import { OntoRepositorySelector } from '../onto-repository-selector';

describe('onto-repository-selector', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [OntoRepositorySelector],
      html: `<onto-repository-selector></onto-repository-selector>`,
    });
    expect(page.root).toEqualHtml(`
      <onto-repository-selector>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </onto-repository-selector>
    `);
  });
});
