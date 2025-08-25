import {OntoTooltipConfiguration} from '../components/onto-tooltip/models/onto-tooltip-configuration';
import tippy, {Instance} from 'tippy.js';
import {OntoTooltipPlacement} from '../components/onto-tooltip/models/onto-tooltip-placement';
import {HTMLElementWithTooltip} from '../components/onto-tooltip/models/html-element-with-tooltip';

export class TooltipUtil {
  private static readonly ATTR_CONTENT = 'tooltip-content';
  private static readonly ATTR_THEME = 'tooltip-theme';
  private static readonly ATTR_PLACEMENT = 'tooltip-placement';
  private static readonly ATTR_TRIGGER = 'tooltip-trigger';
  private static readonly ATTR_APPEND_TO = 'tooltip-append-to';
  private static readonly TOOLTIP_CLASS = 'onto-tooltip';

  /**
   * Returns the Tippy instance associated with an element, if it exists.
   */
  static getTooltipInstance(element: HTMLElement): Instance | undefined {
    // @ts-expect-error TS2339: Property _tippy does not exist on type HTMLElement
    return element._tippy;
  }

  /**
   * Creates a new Tippy tooltip instance on the given element using
   * the OntoTooltipConfiguration.
   *
   * @param target - The HTMLElement to attach the tooltip to.
   * @returns The newly created Tippy Instance.
   */
  static createTooltip(target: HTMLElement): Instance {
    target.classList.add(TooltipUtil.TOOLTIP_CLASS);
    return tippy(target, TooltipUtil.getConfig(target));
  }

  /**
   * Returns an existing Tippy instance or creates a new one if not present.
   *
   * @param target - The HTMLElement to find or attach the tooltip to.
   * @returns The existing or newly created Tippy Instance.
   */
  static getOrCreateTooltipInstance(target: HTMLElement): Instance {
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
      .setTrigger(element.getAttribute(TooltipUtil.ATTR_TRIGGER))
      .setAppendTo(element.getAttribute(TooltipUtil.ATTR_APPEND_TO));
  }

  /**
   * Updates the content of an existing Tippy tooltip, if present.
   * Does nothing if tooltip does not exist or content is empty.
   */
  static updateTooltipContent(target: HTMLElement, content: string): void {
    const tip = TooltipUtil.getTooltipInstance(target);
    if (tip && content !== '') {
      tip.setContent(content);
    }
  }

  /**
   * Destroys the Tippy tooltip on the given element, if present.
   */
  static destroyTooltip(target: HTMLElement): void {
    const tip = TooltipUtil.getTooltipInstance(target);
    if (target.classList.contains(TooltipUtil.TOOLTIP_CLASS) && tip && !tip.state?.isDestroyed) {
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
    return element;
  }
}
