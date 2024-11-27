import { newSpecPage } from '@stencil/core/testing';
import { OntoTooltip } from '../onto-tooltip';

describe('onto-tooltip', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [OntoTooltip],
      html: `<onto-tooltip></onto-tooltip>`,
    });
    expect(page.root).toEqualHtml(`
      <onto-tooltip>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </onto-tooltip>
    `);
  });
});
