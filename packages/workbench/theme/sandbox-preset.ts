import {definePreset} from '@primeng/themes';
import Material from '@primeng/themes/material';
import {MaterialBaseDesignTokens} from '@primeng/themes/material/base';
import {ComponentsDesignTokens, Preset} from '@primeng/themes/types';
import {SbButtonDesignTokens} from './components/button-design-tokens';
import {SbCardDesignTokens} from './components/card-design-tokens';

const SandboxPreset = definePreset(Material, {
  components: {
    button: SbButtonDesignTokens,
    card: SbCardDesignTokens,
  } as ComponentsDesignTokens,
  primitive: {
    borderRadius: {
      none: '0',
      xs: '0.5rem',
      sm: '0.5rem',
      md: '0.5rem',
      lg: '0.5rem',
      xl: '0.5rem'
    },
    red: {
      50: '#fff4f4',
      100: '#fdc9c9',
      200: '#fc9e9e',
      300: '#fa7474',
      400: '#f94949',
      500: '#CC013F',
      600: '#d21a1a',
      700: '#ad1515',
      800: '#881111',
      900: '#630c0c',
      950: '#3e0808'
    },
    pink: {
      50: '#FEFBFC',
      100: '#FDF2F7',
      200: '#F8D3E2',
      300: '#F5BDD4',
      400: '#ED91B7',
      500: '#E66198',
      600: '#DF367C',
      700: '#B01C59',
      800: '#6E1238',
      900: '#420B21',
      950: '#420B21'
    },
    gray: {
      0: '#FFF',
      50: '#F8F8FC',
      100: '#EEF2F7',
      200: '#D2DDEA',
      300: '#AFC4DA',
      400: '#85A5C6',
      500: '#49729D',
      600: '#3B5C7F',
      700: '#07365F',
      800: '#031B30',
      900: '#020E18',
      950: '#000'
    }
  },
  semantic: {
    primary: {
      50: 'var(--gw-primary-50)',
      100: 'var(--gw-primary-100)',
      200: 'var(--gw-primary-200)',
      300: 'var(--gw-primary-300)',
      400: 'var(--gw-primary-400)',
      500: 'var(--gw-primary-500)',
      600: 'var(--gw-primary-600)',
      700: 'var(--gw-primary-700)',
      800: 'var(--gw-primary-800)',
      900: 'var(--gw-primary-900)',
      950: 'var(--gw-primary-950)'
    },
    overlay: {
      popover: {
        shadow: '{highShadow}'
      },
      modal: {
        borderRadius: '{border.radius.xl}',
        padding: '1.5rem',
        shadow: '{lowShadow}'
      }
    },
    focusRing: {
      width: '2px',
      style: 'dashed',
      color: '{emerald.500}',
      offset: '1px'
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.700}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.800}',
          activeColor: '{primary.900}'
        },
        formField: {
          borderColor: '#D0D6DD',
          hoverBorderColor: '{primary.color}',
          focusBorderColor: '{primary.color}',
          color: '{gray.700}',
          disabledBackground: '{disabledBgColor}',
          disabledColor: '{disabledTextColor}',
          placeholderColor: '#C8CED9'
        },
        text: {
          color: '{gray.700}'
        },
        surface: {
          0: '{primary.contrast.color}',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}'
        }
      }
    }
  }
} as Preset<MaterialBaseDesignTokens>);

export default SandboxPreset;
