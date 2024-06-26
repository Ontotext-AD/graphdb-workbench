/**
 * An interface for elements that can be plugged into yasr toolbar.
 * These elements will be sorted depends on {@link YasrToolbarPlugin#getOrder};
 */
export class YasrToolbarPlugin {

    constructor() {
        /**
         * This method is called when the yasr toolbar is created.
         *
         * @param {Yasr} yasr - the parent yasr of toolbar.
         * @return {HTMLElement}
         */
        this.createElement = (yasr) => undefined;

        /**
         * This method is called when draw method of yasr is called.
         *
         * @param {HTMLElement} element - the element created in {@link YasrToolbarPlugin#createElement}.
         * @param {Yasr} yasr - the parent yasr of toolbar.
         */
        this.updateElement = (element, yasr) => {
        };

        /**
         * Returned value will be used for toolbar element ordering.
         *
         * @return {number} - the order number.
         */
        this.getOrder = () => 0;

        /**
         * This method is called when yasr is destroyed.
         *
         * @param {HTMLElement} element - the element created in {@link YasrToolbarPlugin#createElement}.
         * @param {Yasr} yasr - the parent yasr of toolbar.
         */
        this.destroy = (element, yasr) => {
        };
    }
}
