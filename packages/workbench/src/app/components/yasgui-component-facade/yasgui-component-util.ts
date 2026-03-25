import {
  WindowService,
} from '@ontotext/workbench-api';
import {Tab} from './models/yasgui/yasgui';
import {YasguiComponent} from './models/yasgui-component';
import {OntotextYasguiElement} from './models/ontotext-yasgui-element';

/**
 * Defines the colors in which the tab name has to be changed.
 * @type {string[]} - Array of valid CSS values for the color property.
 */
const HIGHLIGHT_TAB_NAME_COLORS = ['var(--gw-primary-base)', '', 'var(--gw-primary-base)'];

/**
 * Defines the time when the tab name color has to change.
 *
 * @type {number} - Time in milliseconds.
 */
const COLOR_CHANGES_INTERVAL = 400;

export class YasguiComponentUtil {
  /**
   * Finds the yasgui component by the component selector and returns it. The function returns null if the component is
   * not found.
   * @param componentSelector - the unique selector of the yasgui component.
   * @returns The found yasgui component or null if the component is not found.
   */
  static getOntotextYasguiElement(componentSelector: string) {
    const hostElement = document.querySelector(componentSelector);
    if (!hostElement) {
      return null;
    }
    // app-yasgui-component-facade renders <ontotext-yasgui> directly in its template.
    // We query it inside the host element.
    const ontotextYasguiElement = hostElement.querySelector('ontotext-yasgui') as unknown as OntotextYasguiElement;
    if (!ontotextYasguiElement) {
      return null;
    }
    return new YasguiComponent(ontotextYasguiElement);
  };

  /**
   * Finds the yasgui component by the directive selector and returns it as a promise. The promise is resolved when the
   * component is found or rejected if the component is not found after the specified timeout.
   *
   * @param directiveSelector - the unique selector of the yasgui component directive.
   * @param timeoutInSeconds - how many times to looking for the directive.
   * @returns A promise which is resolved with the found yasgui component or rejected if the component is not found
   * after the specified timeout.
   */
  static getOntotextYasguiElementAsync(directiveSelector: string, timeoutInSeconds = 1): Promise<YasguiComponent> {
    return new Promise((resolve, reject) => {
      let component = YasguiComponentUtil.getOntotextYasguiElement(directiveSelector);
      if (component) {
        resolve(component);
        return;
      }
      let iteration = Math.max(((timeoutInSeconds ?? 1) * 1000), 1000);
      const waitTime = 100;
      const interval = setInterval(() => {
        component = YasguiComponentUtil.getOntotextYasguiElement(directiveSelector);
        if (component) {
          clearInterval(interval);
          resolve(component);
        } else {
          iteration -= waitTime;
          if (iteration < 0) {
            clearInterval(interval);
            console.info('YASGUI component is not found', directiveSelector);
            reject(new Error('Element is not found: ' + directiveSelector));
          }
        }
      }, waitTime);
    });
  };

  // /**
  //  * Executes a <code>query</code>
  //  * @param {string} directiveSelector
  //  * @param {string} query
  //  * @return {Promise<YasguiComponent>}
  //  */
  // const executeSparqlQuery = (directiveSelector, query) => {
  //   let yasguiComponent = undefined;
  //   return setQuery(directiveSelector, query)
  //     .then((yasgui) => {
  //       yasguiComponent = yasgui;
  //       return yasgui;
  //     })
  //     .then(() => yasguiComponent.query())
  //     .then(() => yasguiComponent);
  // };
  //
  // /**
  //  * Set the <code>query</code> to editor.
  //  * @param {string} directiveSelector
  //  * @param {string} query
  //  * @return {Promise<YasguiComponent>}
  //  */
  // const setQuery = (directiveSelector, query) => {
  //   let yasguiComponent = undefined;
  //   return getOntotextYasguiElementAsync(directiveSelector)
  //     .then((yasgui) => {
  //       yasguiComponent = yasgui;
  //       return yasgui;
  //     })
  //     .then(() => yasguiComponent.setQuery(query))
  //     .then(() => yasguiComponent);
  // };

  /**
   * Makes the <code>tab</code> name to blinks for a while. The color of the name is changes every 400 milliseconds.
   * The colors are defined in <code>HIGHLIGHT_TAB_NAME_COLORS</code>;
   *
   * @param tab - the tab which name have to be highlighted.
   */
  static highlightTabName(tab: Tab){
    const tabElement = YasguiComponentUtil.getTabElement(tab);
    if (!tabElement) {
      return;
    }

    let index = 0;
    let interval = 0;

    const highlightFun = () => {
      tabElement.style.color = HIGHLIGHT_TAB_NAME_COLORS[index++];
      if (index >= HIGHLIGHT_TAB_NAME_COLORS.length) {
        tabElement.style.color = '';
        clearInterval(interval);
      }
    };

    interval = WindowService.getWindow().setInterval(highlightFun, COLOR_CHANGES_INTERVAL);
    highlightFun();
  };

  static getTabElement(tab?: Tab) {
    const tabElement = tab?.yasgui?.tabElements?.get(tab.getId());
    return tabElement?.tabEl;
  };
}
