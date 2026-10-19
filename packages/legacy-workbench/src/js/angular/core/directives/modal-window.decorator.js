/**
 * Adds what the ui-bootstrap 0.14.3 modals lack for keyboard and screen reader users, to every `$uibModal` dialog.
 */
let modalTitleCounter = 0;

const DROPDOWN_SELECTOR = '[uib-dropdown], .dropdown, .btn-group';
const DROPDOWN_TOGGLE_SELECTOR = '[uib-dropdown-toggle], .dropdown-toggle';
const TABBABLE_SELECTOR = 'a[href], area[href], input, button, select, textarea, iframe, object, embed, ' +
    '[tabindex], [contenteditable="true"]';

angular.module('graphdb.framework.core.directives.modal-window', ['ui.bootstrap.modal'])
    .config(['$provide', function($provide) {
        $provide.decorator('uibModalWindowDirective', ['$delegate', decorateModalWindow]);
        $provide.decorator('$uibModalStack', ['$delegate', decorateModalStack]);
    }]);

/**
 * Marks the modal window as modal and names it by the `.modal-title` of its template.
 *
 * ui-bootstrap gives the window `role="dialog"`, but no `aria-modal` and no name.
 *
 * @param {Array<Object>} $delegate The definitions of the `uibModalWindow` directive.
 * @returns {Array<Object>} The same definitions, with a link function that adds the ARIA attributes.
 */
function decorateModalWindow($delegate) {
    const directive = $delegate[0];
    const link = directive.link;
    directive.compile = () => (scope, element, ...rest) => {
        link(scope, element, ...rest);
        element.attr('aria-modal', 'true');
        // Looked up on every digest, because some templates switch the title with `ng-if`.
        scope.$watch(() => element[0].querySelector('.modal-title'), (title) => labelByTitle(element, title));
    };
    return $delegate;
}

/**
 * Points the `aria-labelledby` of the modal window to its title, giving the title an id if it has none.
 *
 * @param {JQLite} element The modal window element.
 * @param {HTMLElement|null} title The title of the modal, or `null` when the template has none.
 */
function labelByTitle(element, title) {
    if (!title) {
        element.removeAttr('aria-labelledby');
        return;
    }
    if (!title.id) {
        title.id = `modal-title-${++modalTitleCounter}`;
    }
    element.attr('aria-labelledby', title.id);
}

/**
 * Moves the focus to the dropdown toggle when the modal opener is hidden, and replaces the ui-bootstrap focus trap.
 *
 * ui-bootstrap returns the focus to the opener itself, which fails for an item of a closed dropdown menu.
 * The replacement trap is {@link keepFocusInModal}.
 *
 * @param {Object} $delegate The `$uibModalStack` service.
 * @returns {Object} The same service, with `close` and `dismiss` wrapped and its own focus trap turned off.
 */
function decorateModalStack($delegate) {
    ['close', 'dismiss'].forEach((method) => {
        $delegate[method] = withFocusFallback($delegate, $delegate[method]);
    });
    // The ui-bootstrap Tab handler moves the focus only on the first or the last item, so this turns it off.
    $delegate.isFocusInFirstItem = () => false;
    $delegate.isFocusInLastItem = () => false;
    document.addEventListener('keydown', (event) => keepFocusInModal($delegate, event));
    return $delegate;
}

/**
 * Keeps the Tab focus inside the top modal, wrapping from its last item to the first one and back.
 *
 * The ui-bootstrap trap caches the items on the first Tab press, so it misses the ones rendered or enabled later,
 * and it is off for modals opened with `keyboard: false`. This trap looks the items up on every Tab press.
 *
 * @param {Object} modalStack The `$uibModalStack` service.
 * @param {KeyboardEvent} event The keydown event; ignored unless it is an unhandled Tab press with a modal open.
 */
function keepFocusInModal(modalStack, event) {
    const modalWindow = modalStack.getTop()?.value.modalDomEl?.[0];
    if (event.key !== 'Tab' || event.defaultPrevented || !modalWindow) {
        return;
    }
    const items = getTabbableElements(modalWindow);
    const active = document.activeElement;
    const isOutside = !modalWindow.contains(active);
    const activeIndex = items.indexOf(active);
    let target;
    if (event.shiftKey && (isOutside || active === modalWindow || activeIndex === 0)) {
        target = items.at(-1);
    } else if (!event.shiftKey && (isOutside || activeIndex === items.length - 1)) {
        target = items[0];
    }
    if (target || !items.length) {
        event.preventDefault();
        (target ?? modalWindow).focus();
    }
}

/**
 * Returns the elements of the modal window that the Tab key stops on.
 *
 * @param {HTMLElement} modalWindow The modal window element.
 * @returns {HTMLElement[]} The elements, in document order.
 */
function getTabbableElements(modalWindow) {
    return Array.from(modalWindow.querySelectorAll(TABBABLE_SELECTOR))
        .filter((element) => element.tabIndex >= 0 && !element.disabled && element.getClientRects().length > 0 &&
            getComputedStyle(element).visibility !== 'hidden');
}

/**
 * Wraps `close` or `dismiss` to focus the dropdown toggle when the modal opener could not take the focus back.
 *
 * @param {Object} modalStack The `$uibModalStack` service.
 * @param {function} original The original `close` or `dismiss` of the service.
 * @returns {function} The wrapped method, with the same arguments and result as the original.
 */
function withFocusFallback(modalStack, original) {
    return (modalInstance, ...rest) => {
        const top = modalStack.getTop();
        const opener = top?.key === modalInstance ? top.value.modalOpener : undefined;
        const result = original(modalInstance, ...rest);
        if (opener && document.activeElement !== opener) {
            focusDropdownToggle(opener);
        }
        return result;
    };
}

/**
 * Focuses the toggle of the dropdown that contains the given element, if there is one.
 *
 * @param {HTMLElement} opener The element that opened the modal.
 */
function focusDropdownToggle(opener) {
    opener.closest?.(DROPDOWN_SELECTOR)?.querySelector(DROPDOWN_TOGGLE_SELECTOR)?.focus();
}
