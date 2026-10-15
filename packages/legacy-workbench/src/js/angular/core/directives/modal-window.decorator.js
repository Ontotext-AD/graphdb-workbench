/**
 * Fills the gaps in the keyboard and screen reader support of the ui-bootstrap 0.14.3 modals, for every dialog opened
 * with `$uibModal`.
 *
 * ui-bootstrap already moves the focus into the dialog, keeps Tab inside it, closes it on Escape and returns the focus
 * to the opener. What it lacks:
 * - Its window has `role="dialog"`, but no `aria-modal` and no accessible name, so screen readers do not announce
 *   a modal with a title. The window is marked as modal and labelled with the `.modal-title` of the dialog template.
 *   The title is looked up on every digest, because templates switch it with `ng-if`.
 * - When the opener is an item of a dropdown menu, the menu is already closed when the dialog closes, so the opener
 *   cannot take the focus and it is lost to the body. The focus goes to the toggle of that menu instead.
 */
let modalTitleCounter = 0;

const DROPDOWN_SELECTOR = '[uib-dropdown], .dropdown, .btn-group';
const DROPDOWN_TOGGLE_SELECTOR = '[uib-dropdown-toggle], .dropdown-toggle';

angular.module('graphdb.framework.core.directives.modal-window', ['ui.bootstrap.modal'])
    .config(['$provide', function($provide) {
        $provide.decorator('uibModalWindowDirective', ['$delegate', function($delegate) {
            const directive = $delegate[0];
            const link = directive.link;
            directive.compile = function() {
                return function(scope, element, ...rest) {
                    link(scope, element, ...rest);
                    element.attr('aria-modal', 'true');
                    scope.$watch(() => element[0].querySelector('.modal-title'), (title) => {
                        if (!title) {
                            element.removeAttr('aria-labelledby');
                            return;
                        }
                        if (!title.id) {
                            title.id = `modal-title-${++modalTitleCounter}`;
                        }
                        element.attr('aria-labelledby', title.id);
                    });
                };
            };
            return $delegate;
        }]);

        $provide.decorator('$uibModalStack', ['$delegate', function($delegate) {
            ['close', 'dismiss'].forEach((method) => {
                const original = $delegate[method];
                $delegate[method] = function(modalInstance, ...rest) {
                    const top = $delegate.getTop();
                    const opener = top && top.key === modalInstance ? top.value.modalOpener : undefined;
                    const result = original(modalInstance, ...rest);
                    if (opener && document.activeElement !== opener) {
                        focusDropdownToggle(opener);
                    }
                    return result;
                };
            });
            return $delegate;
        }]);
    }]);

function focusDropdownToggle(opener) {
    const dropdown = opener.closest && opener.closest(DROPDOWN_SELECTOR);
    const toggle = dropdown && dropdown.querySelector(DROPDOWN_TOGGLE_SELECTOR);
    if (toggle) {
        toggle.focus();
    }
}
