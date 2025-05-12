export class TooltipUtil {
  /**
   * Updates the content of an existing Tippy tooltip, if present.
   * Does nothing if tooltip does not exist.
   */
  static updateTooltipContent(target: HTMLElement, content: string): void {
    // @ts-ignore
    const tip = target?._tippy;
    if (tip && content !== '') {
      tip.setContent(content);
    }
  }

  /**
   * Destroys the Tippy tooltip on the given element, if present.
   */
  static destroyTooltip(target: HTMLElement): void {
    // @ts-ignore
    const tip = target?._tippy;
    if (tip) {
      tip.destroy();
    }
  }
}

