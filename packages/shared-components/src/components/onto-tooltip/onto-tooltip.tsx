import {Component, h, Host, Listen} from '@stencil/core';
import tippy, {Instance, Placement} from 'tippy.js';
import {OntoTooltipConfiguration} from './models/onto-tooltip-configuration';

@Component({
    tag: 'onto-tooltip',
    styleUrl: 'onto-tooltip.scss',
    shadow: false,
})
export class OntoTooltip {

    private static readonly ATTR_CONTENT = 'tooltip-content';
    private static readonly ATTR_THEME = 'tooltip-theme';
    private static readonly ATTR_PLACEMENT = 'tooltip-placement';
    private static readonly ATTR_TRIGGER = 'tooltip-trigger';
    private static readonly ATTR_APPEND_TO = 'tooltip-append-to';

    private observer: MutationObserver;

    /**
     * Checks if the target of the 'mouseover' event has tooltip configuration.
     * If it does, creates a tooltip instance and displays it.
     *
     * @param event - The 'mouseover' event triggered on a document element.
     */
    @Listen('mouseover', {target: 'document'})
    onMouseover(event: MouseEvent): void {
        const target = this.getTooltipTarget(event.target as HTMLElement);
        if (!target) {
            return;
        }

        let tooltipInstance = this.getTooltipInstance(target);
        // Avoid recreating an instance if it already exists
        if (!tooltipInstance) {
            tooltipInstance = tippy(target, this.getConfig(target));
        }
        tooltipInstance.show();
    }

    /**
     * Destroys the tooltip if it is present.
     *
     * @param event - The 'mouseout' event triggered on a document element.
     */
    @Listen('mouseout', { target: 'document' })
    onMouseout(event: MouseEvent): void {
        const target = this.getTooltipTarget(event.target as HTMLElement);
        if (!target) {
            return;
        }
        const relatedTarget = event.relatedTarget as HTMLElement;

        // Ensure the mouse is completely outside the target and its children
        if (!relatedTarget || !target.contains(relatedTarget)) {
            const tooltipInstance = this.getTooltipInstance(target);
            if (tooltipInstance) {
                if (tooltipInstance.props.trigger === 'manual') {
                tooltipInstance.destroy();
            }
        }
    }
    }

    componentWillLoad() {
        this.handleRemovedNodes();
    }

    disconnectedCallback() {
        this.observer?.disconnect();
    }

    render() {
        return <Host></Host>;
    }

    /**
     * Get the tippy instance associated with an element.
     */
    private getTooltipInstance(element: HTMLElement): Instance | undefined {
        // @ts-ignore
        return element._tippy;
    }

    /**
     * Clears tooltips associated with elements that have been removed from the DOM.
     *
     * @param records - An array of MutationRecord objects, each representing a change to the DOM tree.
     *                  The function iterates over these records to find and clear tooltips for removed nodes.
     */
    private clearTooltipsForRemovedElements = (records: MutationRecord[]): void => {
        for (const record of records) {
            for (const node of Array.from(record.removedNodes)) {
                if (this.removeTooltipFromNode(node)) {
                  // stop iterating if a tooltip is found and destroyed,
                  // since we can't have more than one tooltip
                  return;
                }
            }
        }
    };

  /**
   * Recursively removes tooltips from a given node and its children.
   *
   * This function checks if the given node is an HTMLElement and has an associated tooltip.
   * If a tooltip is found, it is destroyed. If not, the function then recursively checks all child nodes.
   *
   * @param node - The DOM node to check for tooltips.
   * @returns A boolean indicating whether a tooltip was found and destroyed (true) or not (false).
   */
  private removeTooltipFromNode = (node: Node): boolean => {
      if (node instanceof HTMLElement) {
          const tooltipInstance = this.getTooltipInstance(node);
          if (tooltipInstance) {
              tooltipInstance.destroy();
              return true;
          }
          node.childNodes.forEach(this.removeTooltipFromNode);
      }
      return false;
  };

    /**
     * Initializes a MutationObserver to monitor the document body for removed nodes.
     * When nodes are removed, it triggers the clearing of tooltips associated with those nodes.
     */
    private handleRemovedNodes(): void {
        this.observer = new MutationObserver(this.clearTooltipsForRemovedElements);
        this.observer.observe(document.body, {childList: true, subtree: true});
    }

    /**
     * Creates a tooltip configuration for the provided element.
     *
     * @param element - an element with tooltip configuration.
     */
    private getConfig(element: HTMLElement): OntoTooltipConfiguration {
        return new OntoTooltipConfiguration()
            .setContent(element.getAttribute(OntoTooltip.ATTR_CONTENT))
            .setTheme(element.getAttribute(OntoTooltip.ATTR_THEME))
            .setPlacement(element.getAttribute(OntoTooltip.ATTR_PLACEMENT) as Placement)
            .setTrigger(element.getAttribute(OntoTooltip.ATTR_TRIGGER))
            .setAppendTo(element.getAttribute(OntoTooltip.ATTR_APPEND_TO));
    }

    /**
     * Recursively finds the closest ancestor (including the given element itself) that has a `tooltip-content` attribute.
     * This is used to identify the element associated with a tooltip when an event occurs on a child element.
     *
     * @param element - The starting HTML element where the search begins.
     * @returns The closest HTML element with the `tooltip-content` attribute, or `null` if no such element is found.
     */
    private getTooltipTarget(element: HTMLElement): HTMLElement | null {
        while (element && !element.getAttribute(OntoTooltip.ATTR_CONTENT)) {
            element = element.parentElement;
        }
        return element;
    }
}
