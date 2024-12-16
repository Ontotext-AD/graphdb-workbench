import { newSpecPage } from '@stencil/core/testing';
import { OntoLicenseAlert } from '../onto-license-alert';

describe('onto-license-alert', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [OntoLicenseAlert],
      html: `<onto-license-alert></onto-license-alert>`,
    });
    expect(page.root).toEqualHtml(`
      <onto-license-alert>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </onto-license-alert>
    `);
  });
});
