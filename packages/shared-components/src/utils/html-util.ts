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
}
