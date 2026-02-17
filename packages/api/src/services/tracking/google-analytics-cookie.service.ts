import {service} from '../../providers';
import {CookieService} from '../cookie';
import {Service} from '../../providers/service/service';
import {WindowService} from '../window';

// The prefix of all GA cookies
const GA_COOKIE_NAME_PREFIX = '_ga';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    google_tag_manager?: Record<string, unknown>;
    google_tag_data?: Record<string, unknown>;
  }
}

export class GoogleAnalyticsCookieService implements Service {
  private readonly cookieService = service(CookieService);
  // Flag to prevent multiple simultaneous setups of GTM scripts, which can lead to duplicate script injections and
  // potential tracking issues.
  private isSettingUp = false;

  /**
   * Adds the Google Tag Manager (GTM) script to the document's head if it is not already present.
   * This function creates a new script element for GTM and appends it to the document's head.
   */
  setIfAbsent() {
    if (this.isSettingUp || this.gtmScriptExists()) {
      return;
    }

    this.isSettingUp = true;

    if (!this.gtmScriptExists()) {
      // Clear the existing dataLayer to prevent any previously pushed events from being processed by the new GTM script.
      if (WindowService.getWindow().dataLayer) {
        WindowService.getWindow().dataLayer = [];
      }
      const dataLayerScript = WindowService.getDocument().createElement('script');
      dataLayerScript.text = '(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({\'gtm.start\': new Date().getTime(),event:\'gtm.js\'}); var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!=\'dataLayer\'?\'&l=\'+l:\'\'; j.async=true; j.src=\'https://www.googletagmanager.com/gtm.js?id=\'+i+dl; f.parentNode.insertBefore(j,f);})(window,document,\'script\',\'dataLayer\',\'GTM-WBP6C6Z4\');';
      WindowService.getDocument().getElementsByTagName('head')[0].appendChild(dataLayerScript);
    }
  }

  /**
   * Removes all Google Analytics-related scripts and cookies from the document.
   */
  remove() {
    this.isSettingUp = false;

    if (this.gtmScriptExists()) {
      this.removeGoogleAnalyticsScripts();
    }

    this.removeGoogleAnalyticsCookies();
  }

  /**
   * Retrieves all cookies with a specified prefix and removes each of them.
   */
  removeGoogleAnalyticsCookies() {
    const allCookies = this.cookieService.getAll();
    for (const [key] of Object.entries(allCookies)) {
      if (key.startsWith(GA_COOKIE_NAME_PREFIX)) {
        this.cookieService.remove(key);
      }
    }
  }

  /**
   * Disables the Google Tag Manager (GTM) by preventing any further events from being pushed to the `dataLayer`.
   * This function also removes all existing GTM script elements from the document's head and body.
   *
   * Since this is a Single Page Application (SPA), removing and re-adding scripts must happen dynamically without
   * reloading the window. This method is used to remove GTM scripts when tracking is disallowed, rather than
   * performing a page reload, which is generally avoided
   *
   * 1. Disables the `dataLayer.push` method to prevent further GTM events from being tracked.
   * 2. Searches for and removes any `<script>` elements that include 'googletagmanager' in their `src` or script content.
   */
  private removeGoogleAnalyticsScripts() {
    // Disable the `dataLayer.push` method to prevent any further events from being tracked by GTM.
    if (WindowService.getWindow().dataLayer) {
      WindowService.getWindow().dataLayer = [];
    }

    const scripts = WindowService.getDocument().getElementsByTagName('script');
    const regex = /googletagmanager/i;

    // Iterate through all script elements and remove those that match the regex.
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && regex.test(scripts[i].src)) {
        scripts[i].remove();
      } else if (regex.test(scripts[i].text)) {
        scripts[i].remove();
      }
    }

    if (WindowService.getWindow().google_tag_manager) {
      delete WindowService.getWindow().google_tag_manager;
    }
    if (WindowService.getWindow().google_tag_data) {
      delete WindowService.getWindow().google_tag_data;
    }
  }

  /**
   * Checks if a Google Tag Manager (GTM) script is already present in the document.
   *
   * When the GTM script is injected, it dynamically adds additional scripts depending on how many tags
   * are configured within your GTM container. These scripts are usually inserted into the `<head>` section,
   * but it’s better to search through the entire document to ensure all related GTM scripts are found.
   *
   * This function searches through all `<script>` elements in the document and returns `true` if any script
   * has a `src` attribute that contains 'googletagmanager'. It returns `false` otherwise.
   *
   * @return Returns `true` if a GTM script is found, otherwise `false`.
   */
  private gtmScriptExists() {
    const scripts = WindowService.getDocument().getElementsByTagName('script');
    return Array.from(scripts).some((script) => script.src?.includes('googletagmanager'));
  }
}
