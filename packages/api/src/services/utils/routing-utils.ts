/**
 * Redirects the current page to a specified URL using the single-spa framework.
 *
 * @param url - The target URL to which the page should be redirected.
 */
export function navigateTo(url: string): (event: Event) => void {
  return (event: Event): void => {
    event.preventDefault();
    window.singleSpa.navigateToUrl(url);
  };
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
