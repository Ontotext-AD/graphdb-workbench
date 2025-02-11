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
