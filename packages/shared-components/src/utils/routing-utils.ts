/**
 * Redirects the current page to a specified URL using the single-spa framework.
 *
 * @param url - The target URL to which the page should be redirected.
 */
export function navigateTo(url: string): (event: Event) => void {
  return (event: Event): void => {
    event.preventDefault();
    window.singleSpa.navigateToUrl(url);
  }
}
