window.PluginRegistry = (function() {

    const plugins = [];

    const registry = {};

    function processOrderedPlugin(pluginDefinition, currentExtensions) {
        let sameOrderPluginIndex;

        currentExtensions.forEach(function(element, index) {
            if (pluginDefinition.order === element.order) {
                sameOrderPluginIndex = index;
                return false; // NOSONAR
            }
        });

        // If there is an existing plugin with the same order, the one with higher priority gets added
        // An error gets thrown for two plugins with the same order and same priority
        if (isDefined(sameOrderPluginIndex)) {
            const sameOrderPlugin = currentExtensions[sameOrderPluginIndex];

            if (pluginDefinition.priority === sameOrderPlugin.priority) {
                throw new Error('There is already a plugin with the same order and priority. Extension point "' + currentExtensions.extensionPoint
                    + '" order "' + pluginDefinition.order + '"');
            } else if (pluginDefinition.priority > sameOrderPlugin.priority) {
                currentExtensions[sameOrderPluginIndex] = pluginDefinition;
            }
        } else {
            currentExtensions.push(pluginDefinition);
        }

        currentExtensions.sort(function(prev, current) {
            return prev.order - current.order;
        });
    }

    function assignDefaultPriority(pluginDefinition) {
        if (!isNumber(pluginDefinition.priority)) {
            if (isDefined(pluginDefinition.priority)) {
                throw new Error('Priority is defined but is not a number');
            }

            pluginDefinition.priority = 0;
        }
    }

    function isNumber(variable) {
        return !isNaN(parseFloat(variable)) && isFinite(variable) && typeof variable !== 'string';
    }

    function isDefined(variable) {
        return typeof variable !== 'undefined';
    }

    function registerPlugin(extensionPoint, pluginDefinition) {
        if (pluginDefinition.disabled) {
            return;
        }

        let currentPointPlugins = plugins[extensionPoint];

        if (!isDefined(currentPointPlugins)) {
            currentPointPlugins = [];
            currentPointPlugins.extensionPoint = extensionPoint;
            plugins[extensionPoint] = currentPointPlugins;
        }

        // If there is even one ordered plugin, all of the plugins should be ordered too
        if (isNumber(pluginDefinition.order)) {
            if (currentPointPlugins.ordered === false) {
                throw new Error('Cannot add an ordered plugin definition to unordered extension point');
            }

            assignDefaultPriority(pluginDefinition);

            processOrderedPlugin(pluginDefinition, currentPointPlugins);
            currentPointPlugins.ordered = true;
        } else {
            if (currentPointPlugins.ordered === true) {
                throw new Error('Cannot add unordered plugin definition to an ordered extension point');
            }

            currentPointPlugins.push(pluginDefinition);
            currentPointPlugins.ordered = false;
        }
    }

    registry.add = function(extensionPoint, pluginDefinition) {
        if (Array.isArray(pluginDefinition)) {
            pluginDefinition.forEach(function(element) {
                registerPlugin(extensionPoint, element);
            });
        } else {
            registerPlugin(extensionPoint, pluginDefinition);
        }
    };

    /**
     * @param {string} extensionPoint The extension point name for which to get the registered plugins.
     * @return {Array} An array with registered plugins.
     */
    registry.get = function(extensionPoint) {
        return plugins[extensionPoint];
    };

    /**
     * @param {string} extensionPoint The extension point name for which to get the registered plugins.
     * @param {Function} predicate A callback function which will be used as a predicate in call to Array#find function
     * and must return a boolean value.
     * @return {Object|undefined} A plugin definition or undefined.
     */
    registry.findPlugin = function(extensionPoint, predicate) {
        return plugins[extensionPoint].find(predicate);
    };

    registry.clear = function(extensionPoint) {
        plugins[extensionPoint] = [];
    };

    registry.listModules = function() {
        return plugins;
    };

    return registry;

})();
