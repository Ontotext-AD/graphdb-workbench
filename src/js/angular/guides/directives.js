/**
 * Used from guide functionality for easy selection of elements where popover dialog will be appear.
 * Example of usage:
 * <a href="" guide-selector="some-unique-string">
 *     ...
 * </a>
 * Usage of directive will keep guide safety if someone change link from example to be button or something else, the guide will continue to working.
 */
angular.module('graphdb.framework.guides.directives', []).directive('guideSelector', function() {return {}});
