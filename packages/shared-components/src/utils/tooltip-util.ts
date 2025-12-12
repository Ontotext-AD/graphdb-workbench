import {OntoTooltipConfiguration} from '../components/onto-tooltip/models/onto-tooltip-configuration';
import {TooltipInstance} from './tooltip-instance';
import {OntoTooltipPlacement} from '../components/onto-tooltip/models/onto-tooltip-placement';
import {HTMLElementWithTooltip, HTMLTooltipElement} from '../components/onto-tooltip/models/html-element-with-tooltip';

export class TooltipUtil {
  private static readonly ATTR_CONTENT = 'tooltip-content';
  private static readonly ATTR_THEME = 'tooltip-theme';
  private static readonly ATTR_PLACEMENT = 'tooltip-placement';
  private static readonly ATTR_APPEND_TO = 'tooltip-append-to';
  private static readonly TOOLTIP_CLASS = 'onto-tooltip';

  /**
   * Returns the TooltipInstance associated with an element, if it exists.
   */
  static getTooltipInstance(element: HTMLElement): TooltipInstance | undefined {
    return element['_tooltipInstance'];
  }

  /**
   * Creates a new TooltipInstance on the given element using
   * the OntoTooltipConfiguration.
   *
   * @param target - The HTMLElement to attach the tooltip to.
   * @returns The newly created TooltipInstance.
   */
  static createTooltip(target: HTMLElement): TooltipInstance {
    target.classList.add(TooltipUtil.TOOLTIP_CLASS);
    const instance = new TooltipInstance(target as HTMLElementWithTooltip, TooltipUtil.getConfig(target));
    target['_tooltipInstance'] = instance;
    return instance;
  }

  /**
   * Returns an existing TooltipInstance or creates a new one if not present.
   *
   * @param target - The HTMLElement to find or attach the tooltip to.
   * @returns The existing or newly created TooltipInstance.
   */
  static getOrCreateTooltipInstance(target: HTMLElement): TooltipInstance {
    const existing = TooltipUtil.getTooltipInstance(target);
    if (existing) {
      return existing;
    }
    return TooltipUtil.createTooltip(target);
  }

  private static getConfig(element: HTMLElement): OntoTooltipConfiguration {
    return new OntoTooltipConfiguration()
      .setContent(element.getAttribute(TooltipUtil.ATTR_CONTENT))
      .setTheme(element.getAttribute(TooltipUtil.ATTR_THEME))
      .setPlacement(element.getAttribute(TooltipUtil.ATTR_PLACEMENT) as OntoTooltipPlacement)
      .setAppendTo(element.getAttribute(TooltipUtil.ATTR_APPEND_TO));
  }

  /**
   * Updates the content of an existing TooltipInstance, if present.
   * Does nothing if tooltip does not exist or content is empty.
   */
  static updateTooltipContent(target: HTMLElement, content: string): void {
    const tip = TooltipUtil.getTooltipInstance(target);
    if (tip && content !== '') {
      tip.setContent(content);
    }
  }

  /**
   * Destroys the TooltipInstance on the given element, if present.
   */
  static destroyTooltip(target: HTMLElementWithTooltip): void {
    const tip = TooltipUtil.getTooltipInstance(target);
    if (target.classList.contains(TooltipUtil.TOOLTIP_CLASS) && tip) {
      tip.destroy();
    }
  }

  /**
   * Recursively finds the closest ancestor (including the given element itself) that has a `tooltip-content` attribute.
   * This is used to identify the element associated with a tooltip when an event occurs on a child element.
   *
   * @param element - The starting HTML element where the search begins.
   * @returns The closest HTML element with the `tooltip-content` attribute, or `null` if no such element is found.
   */
  static getTooltipTarget(element: HTMLElement): HTMLElementWithTooltip | null {
    while (element && !element.getAttribute(TooltipUtil.ATTR_CONTENT)) {
      element = element.parentElement;
    }
    return element as HTMLElementWithTooltip | null;
  }

  static getTooltip(element: HTMLElement): HTMLTooltipElement | null {
    while (element && !element.classList.contains('tooltip-box')) {
      element = element.parentElement;
    }
    return element as HTMLTooltipElement;
  }
}
