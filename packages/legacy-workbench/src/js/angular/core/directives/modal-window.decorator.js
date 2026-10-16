/**
 * Adds what the ui-bootstrap 0.14.3 modals lack for keyboard and screen reader users, to every `$uibModal` dialog.
 */
let modalTitleCounter = 0;

const DROPDOWN_SELECTOR = '[uib-dropdown], .dropdown, .btn-group';
const DROPDOWN_TOGGLE_SELECTOR = '[uib-dropdown-toggle], .dropdown-toggle';

angular.module('graphdb.framework.core.directives.modal-window', ['ui.bootstrap.modal'])
    .config(['$provide', function($provide) {
        // ui-bootstrap gives the modal window `role="dialog"`, but no `aria-modal` and no name.
        // This marks it as modal and names it by the `.modal-title` of the template. The title is looked up on every
        // digest, because some templates switch it with `ng-if`.
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

        // ui-bootstrap itself returns the focus to the element that opened the modal, e.g. a button.
        // This only handles the case when that element is hidden after the close (an item of a closed dropdown
        // menu): the focus goes to the toggle of its dropdown instead.
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
