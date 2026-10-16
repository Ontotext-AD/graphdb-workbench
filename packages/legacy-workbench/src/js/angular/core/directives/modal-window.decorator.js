/**
 * Adds what the ui-bootstrap 0.14.3 modals lack for keyboard and screen reader users, to every `$uibModal` dialog.
 */
let modalTitleCounter = 0;

const DROPDOWN_SELECTOR = '[uib-dropdown], .dropdown, .btn-group';
const DROPDOWN_TOGGLE_SELECTOR = '[uib-dropdown-toggle], .dropdown-toggle';

angular.module('graphdb.framework.core.directives.modal-window', ['ui.bootstrap.modal'])
    .config(['$provide', function($provide) {
        $provide.decorator('uibModalWindowDirective', ['$delegate', decorateModalWindow]);
        $provide.decorator('$uibModalStack', ['$delegate', decorateModalStack]);
    }]);

/**
 * ui-bootstrap gives the modal window `role="dialog"`, but no `aria-modal` and no name.
 * This marks it as modal and names it by the `.modal-title` of the template. The title is looked up on every
 * digest, because some templates switch it with `ng-if`.
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
 * ui-bootstrap itself returns the focus to the element that opened the modal, e.g. a button.
 * This only handles the case when that element is hidden after the close (an item of a closed dropdown
 * menu): the focus goes to the toggle of its dropdown instead.
 *
 * @param {Object} $delegate The `$uibModalStack` service.
 * @returns {Object} The same service, with `close` and `dismiss` wrapped.
 */
function decorateModalStack($delegate) {
    ['close', 'dismiss'].forEach((method) => {
        $delegate[method] = withFocusFallback($delegate, $delegate[method]);
    });
    return $delegate;
}

/**
 * Wraps `close` or `dismiss` of the modal stack, so that the focus goes to the dropdown toggle when the opener
 * of the modal could not take it back.
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
