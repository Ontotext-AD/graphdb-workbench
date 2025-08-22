import {Component, h, Host, Listen} from '@stencil/core';
import {TooltipUtil} from '../../utils/tooltip-util';

@Component({
  tag: 'onto-tooltip',
  styleUrl: 'onto-tooltip.scss',
  shadow: false,
})
export class OntoTooltip {
  private observer: MutationObserver;

  /**
   * Checks if the target of the 'mouseover' event has tooltip configuration.
   * If it does, creates a tooltip instance and displays it.
   *
   * @param event - The 'mouseover' event triggered on a document element.
   */
  @Listen('mouseover', {target: 'document'})
  onMouseover(event: MouseEvent): void {
    const target = TooltipUtil.getTooltipTarget(event.target as HTMLElement);
    if (!target) {
      return;
    }

    const tooltipInstance = TooltipUtil.getOrCreateTooltipInstance(target);
    tooltipInstance.show();
    target.hideTooltip = () => {
      tooltipInstance.hide();
    };
  }

  /**
   * Destroys the tooltip if it is present.
   *
   * @param event - The 'mouseout' event triggered on a document element.
   */
  @Listen('mouseout', { target: 'document' })
  onMouseout(event: MouseEvent): void {
    const target = TooltipUtil.getTooltipTarget(event.target as HTMLElement);
    if (!target) {
      return;
    }
    const relatedTarget = event.relatedTarget as HTMLElement;

    // Ensure the mouse is completely outside the target and its children
    if (!relatedTarget || !target.contains(relatedTarget)) {
      const tooltipInstance = TooltipUtil.getTooltipInstance(target);
      if (tooltipInstance && tooltipInstance.props.trigger === 'manual') {
        TooltipUtil.destroyTooltip(target);
      }
    }
  }

  connectedCallback() {
    this.handleRemovedNodes();
  }

  disconnectedCallback() {
    this.observer?.disconnect();
  }

  render() {
    return <Host></Host>;
  }

  /**
   * Clears tooltips associated with elements that have been removed from the DOM.
   *
   * @param records - An array of MutationRecord objects, each representing a change to the DOM tree.
   *                  The function iterates over these records to find and clear tooltips for removed nodes.
   */
  private readonly clearTooltipsForRemovedElements = (records: MutationRecord[]): void => {
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
  private readonly removeTooltipFromNode = (node: Node): boolean => {
    if (node instanceof HTMLElement) {
      const tooltipInstance = TooltipUtil.getTooltipInstance(node);
      if (tooltipInstance) {
        TooltipUtil.destroyTooltip(node);
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
}
