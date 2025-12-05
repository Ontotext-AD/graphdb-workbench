import {TooltipInstance} from '../../../utils/tooltip-instance';

export type HTMLElementWithTooltip = HTMLElement & {
  _tooltipInstance: TooltipInstance;
  hideTooltip?: () => void;
}

export type HTMLTooltipElement = HTMLDivElement & { tooltipTarget?: HTMLElementWithTooltip };
