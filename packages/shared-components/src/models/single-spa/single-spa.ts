export interface SingleSpa {
  /**
   * Navigates the single-spa application to the specified URL.
   *
   * @param url - The URL to navigate to
   */
  navigateToUrl: (url: string) => void;
}
