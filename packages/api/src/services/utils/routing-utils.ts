/**
 * Redirects the current page to a specified URL using the single-spa framework.
 *
 * @param url - The target URL to which the page should be redirected.
 */
export function navigateTo(url: string): (event: Event) => void {
  return (event: Event): void => {
    if (event) {
      event.preventDefault();
    }
    window.singleSpa.navigateToUrl(url);
  };
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
 * Retrieves the pathname portion of the current URL.
 *
 * @returns {string} The pathname of the current URL, which represents the path segment that comes after the host and before the query string.
 */
export function getPathName(): string {
  return window.location.pathname;
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
