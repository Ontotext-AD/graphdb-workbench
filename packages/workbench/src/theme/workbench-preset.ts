import {MaterialBaseDesignTokens} from '@primeuix/themes/material/base';
import Nora from '@primeuix/themes/nora';
import {definePreset} from '@primeuix/themes';
import {ComponentsDesignTokens, Preset} from '@primeuix/themes/types';

const WorkbenchPreset = definePreset(Nora, {
  components: {
  } satisfies ComponentsDesignTokens
} satisfies Preset<MaterialBaseDesignTokens>);

export default WorkbenchPreset;
