import {arrow, autoUpdate, computePosition, flip, hide, Middleware, offset, Placement, shift} from '@floating-ui/dom';
import {OntoTooltipConfiguration} from '../components/onto-tooltip/models/onto-tooltip-configuration';
import {HTMLElementWithTooltip, HTMLTooltipElement} from '../components/onto-tooltip/models/html-element-with-tooltip';

/**
 * A wrapper class that provides a Tooltip.
 */
export class TooltipInstance {
  // Delay before tooltip is removed to allow user to hover over it and prevent removal
  private static readonly DESTROY_DELAY_MS = 100;

  private floatingElement: HTMLTooltipElement;
  private arrowElement: HTMLElement;
  private cleanupAutoUpdate: (() => void) | null = null;
  private isVisible = false;
  private isDestroyed = false;
  private pendingDestroy = false;

  constructor(
    private readonly referenceElement: HTMLElementWithTooltip,
    private readonly config: OntoTooltipConfiguration
  ) {
    this.createFloatingElement();
    this.createArrowElement();
  }

  /**
   * Shows the tooltip by computing its position and making it visible.
   */
  show(): void {
    this.pendingDestroy = false;
    if (this.isVisible) {
      return;
    }

    // Call onShow callback
    if (this.config.onShow) {
      this.config.onShow();
    }

    this.isVisible = true;
    this.appendToTarget();

    // Start auto-updating position
    this.cleanupAutoUpdate = autoUpdate(
      this.referenceElement,
      this.floatingElement,
      () => this.updatePosition()
    );

    this.updatePosition();
    this.floatingElement.style.visibility = 'visible';
    this.floatingElement.style.opacity = '0.9';
  }

  /**
   * Hides the tooltip.
   */
  hide(): void {
    if (!this.isVisible) {
      return;
    }

    this.isVisible = false;

    // Call onHide callback
    if (this.config.onHide) {
      this.config.onHide();
    }

    this.floatingElement.style.visibility = 'hidden';
    this.floatingElement.style.opacity = '0';

    // Stop auto-updating
    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = null;
    }
  }

  /**
   * Updates the content of the tooltip.
   */
  setContent(content: string): void {
    const contentElement = this.floatingElement.querySelector('.tooltip-content');
    if (contentElement) {
      if (this.config.allowHTML) {
        contentElement.innerHTML = content;
      } else {
        contentElement.textContent = content;
      }
    }
  }

  /**
   * Destroys the tooltip and cleans up resources.
   */
  destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    this.pendingDestroy = true;

    setTimeout(() => {
      if (this.pendingDestroy) {

        this.hide();

        if (this.floatingElement) {
          this.floatingElement.remove();
        }

        this.isDestroyed = true;
        delete this.floatingElement.tooltipTarget;
        delete this.referenceElement._tooltipInstance;
        delete this.referenceElement.hideTooltip;
      }
    }, TooltipInstance.DESTROY_DELAY_MS);
  }

  /**
   * Creates the floating tooltip element.
   */
  private createFloatingElement(): void {
    this.floatingElement = document.createElement('div');
    this.floatingElement.className = 'tooltip-box';
    this.floatingElement.dataset.theme = this.config.theme;
    this.floatingElement.style.position = 'absolute';
    this.floatingElement.style.top = '0';
    this.floatingElement.style.left = '0';
    this.floatingElement.style.visibility = 'hidden';
    this.floatingElement.style.opacity = '0';
    this.floatingElement.style.transition = 'opacity 0.2s ease-in-out';
    this.floatingElement.style.zIndex = '9999';

    const contentElement = document.createElement('div');
    contentElement.className = 'tooltip-content';

    if (this.config.allowHTML) {
      contentElement.innerHTML = this.config.content ?? '';
    } else {
      contentElement.textContent = this.config.content ?? '';
    }

    this.floatingElement.appendChild(contentElement);

    this.floatingElement.tooltipTarget = this.referenceElement;

    this.referenceElement.hideTooltip = () => {
      this.destroy();
    };
  }

  /**
   * Creates the arrow element for the tooltip.
   */
  private createArrowElement(): void {
    this.arrowElement = document.createElement('div');
    this.arrowElement.className = 'tooltip-arrow';
    this.arrowElement.style.position = 'absolute';
    this.floatingElement.appendChild(this.arrowElement);
  }

  /**
   * Appends the floating element to the target container.
   */
  private appendToTarget(): void {
    const appendTo = this.config.appendTo;

    let targetContainer: Element;
    if (typeof appendTo === 'function') {
      targetContainer = appendTo(this.referenceElement);
    } else if (appendTo === 'parent') {
      targetContainer = this.referenceElement.parentElement || document.body;
    } else {
      targetContainer = appendTo;
    }

    targetContainer.appendChild(this.floatingElement);
  }

  /**
   * Computes and updates the position of the tooltip.
   */
  private async updatePosition(): Promise<void> {
    const middleware: Middleware[] = [
      hide(),
      flip(),
      offset(8),
      shift({padding: 5}),
      arrow({element: this.arrowElement})
    ];

    const placement = this.mapPlacement(this.config.placement);

    const {x, y, placement: finalPlacement, middlewareData} = await computePosition(
      this.referenceElement,
      this.floatingElement,
      {
        placement,
        middleware
      }
    );

    if (middlewareData.hide) {
      Object.assign(this.floatingElement.style, {
        visibility: middlewareData.hide.referenceHidden
          ? 'hidden'
          : 'visible',
      });
    }

    // Update floating element position
    Object.assign(this.floatingElement.style, {
      left: `${x}px`,
      top: `${y}px`
    });

    this.floatingElement.dataset.placement = finalPlacement;

    // Update arrow position
    if (middlewareData.arrow) {
      const {x: arrowX, y: arrowY} = middlewareData.arrow;
      const side = finalPlacement.split('-')[0];

      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right'
      }[side];

      this.arrowElement.dataset.placement = staticSide;

      Object.assign(this.arrowElement.style, {
        left: arrowX === null ? '' : `${arrowX}px`,
        top: arrowY === null ? '' : `${arrowY}px`,
        // Set offset equal to half the size of the arrow
        [staticSide]: '-5px'
      });
    }
  }

  /**
   * Maps OntoTooltipPlacement to Floating UI Placement.
   */
  private mapPlacement(placement: string): Placement {
    if (!placement || placement === 'auto') {
      return 'right';
    }
    return placement as Placement;
  }
}
