import {RenderingMode} from './yasgui/rendering-mode';
import {TabQueryModel} from './yasgui/tab-query-model';
import {YasguiResetFlags} from './yasgui-reset-flags';
import {Tab} from './yasgui/yasgui';
import {OngoingRequestsInfo} from './ongoing-requests-info';
import {OntotextYasguiElement} from './ontotext-yasgui-element';

/**
 * This class provides an abstraction over the ontotext yasgui web component.
 */
export class YasguiComponent {
  constructor(private readonly yasguiComponent: OntotextYasguiElement) {}

  /**
   * Changes rendering mode of component.
   * @param newRenderMode - then new render mode of component. Value have to be one of {@link RenderingMode}
   * @
   */
  changeRenderMode(newRenderMode: RenderingMode): Promise<void> {
    return this.yasguiComponent.changeRenderMode(newRenderMode);
  }

  /**
   * Allows the client to set a query in the current opened tab.
   * @param query The query that should be set in the current focused tab.
   */
  setQuery(query: string): Promise<void> {
    return this.yasguiComponent.setQuery(query);
  }

  /**
   * Executes the YASQE query from the currently opened tab and switches to the specified <code>renderingMode</code> when the query is executed.
   * @param renderingMode - specifies the new view mode of the component when the query is executed.
   */
  query(renderingMode?: RenderingMode): Promise<never> {
    return this.yasguiComponent.query(renderingMode);
  }

  /**
   * Fetches the query from YASQE editor.
   */
  getQuery(): Promise<string> {
    return this.yasguiComponent.getQuery();
  }

  /**
   * Checks if query is valid.
   */
  isQueryValid(): Promise<boolean> {
    return this.yasguiComponent.isQueryValid();
  }

  /**
   * Allows the client to init the editor using a query model. When the query and query name are
   * found in any existing opened tab, then it'd be focused. Otherwise, a new tab will be created and
   * initialized using the provided query model.
   * If the query model is not provided, then a new tab with the default query will be just opened and focused.
   * @param queryModel - the model used for initializing the editor tab.
   */
  openTab(queryModel?: TabQueryModel): Promise<Tab> {
    // While this does the job in this particular method, we definitely need a more general approach
    // for handling the fact that there is a chance for the client to hit the problem where when the
    // OntotextYasgui instance is created and returned the wrapped Yasgui instance might not be yet
    // initialized.
    return this.yasguiComponent.openTab(queryModel);
  }

  /**
   * Utility method allowing the client to get the mode of the query which is written in the current
   * editor tab.
   * The query mode can be either `query` or `update` regarding the query mode. This method just
   * exposes the similar utility method from the yasqe component.
   */
  getQueryMode(): Promise<string> {
    return this.yasguiComponent.getQueryMode();
  }

  /**
   * Utility method allowing the client to get the type of the query which is written in the current
   * editor tab.
   * The query mode can be `INSERT`, `LOAD`, `CLEAR`, `DELETE`, etc. This method just exposes the
   * similar utility method from the yasqe component.
   */
  getQueryType(): Promise<string> {
    return this.yasguiComponent.getQueryType();
  }

  /**
   * Fetches the query result and return it as JSON.
   */
  getEmbeddedResultAsJson(): Promise<unknown> {
    return this.yasguiComponent.getEmbeddedResultAsJson();
  }

  /**
   * Fetches the query result and return it as CSV.
   */
  getEmbeddedResultAsCSV(): Promise<unknown> {
    return this.yasguiComponent.getEmbeddedResultAsCSV();
  }

  /**
   * Hides the YASQE action button with the name <code>yasqeActionButtonNames</code>.
   * @param yasqeActionButtonNames - the name of the action that needs to be hidden. The name have to be value/values from {@see YasqeButtonName}.
   */
  hideYasqeActionButton(yasqeActionButtonNames: string | string[]): Promise<void> {
    return this.yasguiComponent.hideYasqeActionButton(yasqeActionButtonNames);
  }

  /**
   * Shows the YASQE action button with the name <code>yasqeActionButtonNames</code>.
   * @param yasqeActionButtonNames - the name of the action that needs to be displayed. The name have to be value/values from {@see YasqeButtonName}.
   */
  showYasqeActionButton(yasqeActionButtonNames: string | string[]): Promise<void> {
    return this.yasguiComponent.showYasqeActionButton(yasqeActionButtonNames);
  }

  /**
   * Aborts the running query if any.
   */
  abortQuery(): Promise<never> {
    return this.yasguiComponent.abortQuery();
  }

  /**
   * Fetches info about ongoing requests.
   */
  getOngoingRequestsInfo(): Promise<OngoingRequestsInfo> {
    return this.yasguiComponent.getOngoingRequestsInfo();
  }

  /**
   * Aborts all ongoing requests.
   */
  abortAllRequests(): Promise<never> {
    return this.yasguiComponent.abortAllRequests();
  }

  /**
   * Re-initializes the YASGUI component.
   * @param flags the flags specifying what to reset to default config values
   */
  reInitYasgui(flags: YasguiResetFlags): Promise<never> {
    return this.yasguiComponent.reInitYasgui(flags);
  }

  /**
   * Sets the theme in the YASQE editor.
   *
   * @param themeName - The name of the theme to apply.
   *   - Must match a CodeMirror theme name (e.g., "dracula", "monokai").
   *   - The corresponding **CSS file for the theme must be loaded** before calling this method,
   *     otherwise the theme will not be applied. You can load the CSS via:
   *       - `<link>` tag in HTML
   *       - importing the CSS file in your project
   *       - dynamically injecting a `<style>` element
   *   - You can also define a **custom theme** by adding CSS rules for
   *     `.cm-s-{themeName}.CodeMirror` and related token classes.
   * @returns A Promise that resolves once the theme has been successfully applied.
   *
   * @example
   * // Applying a theme from an external CSS file. The corresponding CSS file must be loaded first.
   * setTheme("dracula").then(() => console.log("Theme applied"));
   *
   * @example
   * // Applying a custom theme (CSS must be loaded first)
   * setTheme("mytheme").then(() => console.log("Custom theme applied"));
   */
  setTheme(themeName: string): Promise<void> {
    return this.yasguiComponent.setTheme(themeName);
  }
}
