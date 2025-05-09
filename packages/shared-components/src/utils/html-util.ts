const INTERACTIVE_ELEMENTS_SELECTOR = 'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

export class HtmlUtil {
  /**
   * Setter for the document body overflow property.
   *
   * @param newOverflow - the new overflow value.
   *
   * @return the old overflow value.
   */
  static setDocumentBodyOverflow(newOverflow: string): string {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = newOverflow;
    return oldOverflow;
  }

  /**
   * Hides the document body overflow.
   *
   * @return the value of overflow before set it to hidden.
   */
  static hideDocumentBodyOverflow(): string {
    return HtmlUtil.setDocumentBodyOverflow('hidden');
  }

  /**
   * Focuses the next element within a specified parent element based on the <code>activeElementSelector</code>, that selects all elements to be focused.
   *
   * @param parentElement - The parent element containing the focusable elements.
   * @param activeElementSelector - The CSS selector for identifying focusable elements.
   */
  static focusNextElement(parentElement: HTMLElement, activeElementSelector = INTERACTIVE_ELEMENTS_SELECTOR): void {
    const focusableElements: any [] = Array.from(parentElement.querySelectorAll(activeElementSelector));
    if (focusableElements.length > 0) {
      const currentIndex = focusableElements.indexOf(document.activeElement);
      const nextIndex = (currentIndex + 1) % focusableElements.length;
      const nextActiveElement = focusableElements[nextIndex] as HTMLElement;
      if (nextActiveElement) {
        nextActiveElement.focus();
      }
    }
  }

  /**
   * Focuses the previous element within a specified parent element based on the <code>activeElementSelector</code>, that selects all elements to be focused.
   *
   * @param parentElement - The parent element containing the focusable elements.
   * @param activeElementSelector - The CSS selector for identifying focusable elements.
   */
  static focusPreviousElement(parentElement: HTMLElement, activeElementSelector = INTERACTIVE_ELEMENTS_SELECTOR): void {
    const focusableElements: any[] = Array.from(parentElement.querySelectorAll(activeElementSelector));
    if (focusableElements.length > 0) {
      const currentIndex = focusableElements.indexOf(document.activeElement);
      const previousIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
      const previousActiveElement = focusableElements[previousIndex] as HTMLElement;
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    }
  }

  static preventLeavingDialog(hostElement: HTMLElement, ev: KeyboardEvent) {
    if (ev.key === 'Tab') {
      ev.preventDefault();
      if (ev.shiftKey) {
        HtmlUtil.focusPreviousElement(hostElement);
      } else {
        HtmlUtil.focusNextElement(hostElement);
      }
    }
  }

  /**
   * Focuses an element in the document based on the provided CSS selector.
   *
   * @param selector - A CSS selector string used to identify the element to focus.
   *                   This should be a valid CSS selector that uniquely identifies the target element.
   */
  static focusElement(selector: string): void {
    const element = document.querySelector(selector) as HTMLElement;
    element?.focus();
  }

  /**
   * Scrolls an element into the visible area of its scrollable container.
   *
   * @param elementSelector - A CSS selector string used to identify the element to scroll into view.
   *                          This should be a valid CSS selector that uniquely identifies the target element.
   * @param options the scroll into view options.
   */
  static scrollElementIntoView(elementSelector: string, options: ScrollIntoViewOptions = {block: 'nearest'}): void {
    const element = document.querySelector(elementSelector) as HTMLElement;
    if (!element) {
      return;
    }

    element.scrollIntoView(options);
  }

  /**
   * Waits for an element to appear in the DOM by observing DOM mutations.
   * This function creates a MutationObserver that watches for changes in the document body
   * and resolves with the element once it becomes available.
   *
   * @param selector - A CSS selector string used to identify the element to wait for.
   *                   This should be a valid CSS selector that uniquely identifies the target element.
   *
   * @returns A Promise that resolves with the found HTMLElement when it appears in the DOM,
   *          or rejects if an error occurs during the observation process.
   */
  static waitForElement(selector: string): Promise<HTMLElement> {
     return new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        try {
          const element = document.querySelector(selector) as HTMLElement;
          if (element) {
            observer.disconnect();
            resolve(element);
          }
        } catch (error) {
          observer.disconnect();
          reject(error);
        }
      });
      observer.observe(document.body, { subtree: true, childList: true, attributes: true });
    });
  }
}
