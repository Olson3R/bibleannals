// Utility functions for scroll behavior management

/**
 * Checks if an element is visible within the current viewport
 * @param element - DOM element to check
 * @returns true if element is visible in viewport
 */
export function isElementVisible(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  const windowWidth = window.innerWidth || document.documentElement.clientWidth;
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= windowHeight &&
    rect.right <= windowWidth
  );
}

/**
 * Smoothly scrolls an element into view if it's not visible
 * @param element - DOM element to scroll to
 * @param block - Scroll alignment ('start', 'center', 'end', 'nearest')
 * @param delay - Optional delay before scrolling (in ms)
 */
export function scrollToElementIfNotVisible(
  element: Element, 
  block: ScrollLogicalPosition = 'center',
  delay = 100
): void {
  if (!isElementVisible(element)) {
    setTimeout(() => {
      element.scrollIntoView({ behavior: 'smooth', block });
    }, delay);
  }
}

/**
 * Scrolls to an element by selector if it exists and is not visible
 * @param selector - CSS selector for the element
 * @param block - Scroll alignment
 * @param delay - Optional delay before scrolling
 */
export function scrollToSelector(
  selector: string,
  block: ScrollLogicalPosition = 'center',
  delay = 100
): void {
  const element = document.querySelector(selector);
  if (element) {
    scrollToElementIfNotVisible(element, block, delay);
  }
}

/**
 * Scrolls to an element with a custom offset to account for sticky headers
 * @param selector - CSS selector for the element
 * @param offset - Offset in pixels from the top (default accounts for sticky header)
 * @param delay - Optional delay before scrolling
 */
export function scrollToSelectorWithOffset(
  selector: string,
  offset = 180, // Default offset for sticky header
  delay = 100
): void {
  const element = document.querySelector(selector);
  if (element) {
    scrollToElementWithOffset(element, offset, delay);
  }
}

/**
 * Scrolls to an element with a custom offset to account for sticky headers
 * @param element - DOM element to scroll to
 * @param offset - Offset in pixels from the top (default accounts for sticky header)
 * @param delay - Optional delay before scrolling
 */
export function scrollToElementWithOffset(
  element: Element,
  offset = 180, // Default offset for sticky header
  delay = 100
): void {
  setTimeout(() => {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }, delay);
}