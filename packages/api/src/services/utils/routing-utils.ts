/**
 * Redirects the current page to a specified URL using the single-spa framework.
 * Made to be used from views. If you are not navigating from a view, use <code>navigate</code> instead
 *
 * @param url - The target URL to which the page should be redirected.
 */
export function navigateTo(url: string): (event: Event) => void {
  return (event: Event): void => {
    if (event) {
      event.preventDefault();
    }
    navigate(url);
  };
}

/**
 * Navigates to the specified URL using the single-spa framework.
 * Suitable for in-code navigation. If you need to navigate from a view, use <code>navigateTo</code> instead.
 * @param url - The target URL to which the page should be redirected.
 */
export function navigate(url: string) {
  window.singleSpa.navigateToUrl(url);
}

/**
 * Opens a new tab with the specified URL.
 * @param url - The URL to open in a new tab.
 */
export function openInNewTab(url: string): void {
  window.open(url, '_blank');
}

/**
 * Checks if the current page is the home page.
 *
 * @returns {boolean} Returns true if the current page is the home page, false otherwise.
 */
export function isHomePage(): boolean {
  return getPathName() === '/';
}

/**
 * Retrieves the pathname portion of the current URL without the context prefix.
 *
 * @returns {string} The pathname of the current URL, which represents the path segment that comes after the context (if any) and before the query string.
 */
export function getPathName(): string {
  return window.location.pathname.substring(getContextName().length - 1);
}

/**
 * Returns the context name (base href) from the `<base>` tag in the document.
 *
 * This is usually the base path under which the app is deployed, e.g. '/graphdb/'.
 * If no `<base>` tag is found, returns '/' by default.
 *
 * @returns {string} The context path as specified in the base href (always ending with a slash).
 */
export function getContextName(): string {
  return document.querySelector('base')?.getAttribute('href') ?? '/';
}

/**
 * Retrieves the current route from the URL, removing the leading <code>/</code>.
 * For example:<br>
 * Calling <code>getCurrentRoute()</code> while on http://localhost:9000/sparql will return <code>"sparql"</code><br>
 * Calling <code>getCurrentRoute()</code> while on http://localhost:9000/graphql/endpoints will return <code>"graphql/endpoints"<code>
 */
export function getCurrentRoute(): string {
  return getPathName().substring(1);
}
