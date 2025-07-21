import { ButtonDesignTokens } from '@primeng/themes/types/button';

export const SbButtonDesignTokens: ButtonDesignTokens = {
  css: () => `.p-button {font-size: 0.875rem} .p-button:not(.p-button-icon-only):not(.p-button-fluid) {justify-content: flex-start}`,
  root: {
    iconOnlyWidth: '2.357rem',
    roundedBorderRadius: '0.25rem',
    paddingY: '0.375rem',
    paddingX: '0.75rem'
  },
  colorScheme: {
    light: {
      root: {
        danger: {
          background: '{red.500}',
          hoverBackground: '{red.400}',
          activeBackground: '{red.300}',
          borderColor: '{red.500}',
          hoverBorderColor: '{red.400}',
          activeBorderColor: '{red.300}',
          color: '#ffffff',
          hoverColor: '#ffffff',
          activeColor: '#ffffff',
          focusRing: {
            color: '{red.500}',
            shadow: 'none'
          }
        }
      }
    }
  }
};
