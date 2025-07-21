import { CardDesignTokens } from '@primeng/themes/types/card';

export const SbCardDesignTokens: CardDesignTokens = {
  css: () => `
    .p-card-body {
    font-size: .875rem;
    line-height: 1.25rem;
  }`,
  title: {
    fontSize: '1rem',
    fontWeight: '700'
  },
  body: {
    padding: '1.5rem'
  },
  root: {
    shadow: '0px 4px 8px -2px rgba(16, 24, 40, 0.10), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)'
  }
};
