/**
 * Accessibility (A11y) Utilities
 * Basierend auf Optimierungsbericht für bessere Barrierefreiheit
 */

// Keyboard navigation helper
export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowDown?: () => void,
  onArrowUp?: () => void
) => {
  switch (event.key) {
    case 'Enter':
      event.preventDefault();
      onEnter?.();
      break;
    case 'Escape':
      event.preventDefault();
      onEscape?.();
      break;
    case 'ArrowDown':
      event.preventDefault();
      onArrowDown?.();
      break;
    case 'ArrowUp':
      event.preventDefault();
      onArrowUp?.();
      break;
  }
};

// Focus management
export const manageFocus = {
  trap: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  restore: (previousActiveElement: Element | null) => {
    if (previousActiveElement && 'focus' in previousActiveElement) {
      (previousActiveElement as HTMLElement).focus();
    }
  }
};

// ARIA utilities
export const ariaUtils = {
  announceToScreenReader: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  setAriaExpanded: (element: HTMLElement, expanded: boolean) => {
    element.setAttribute('aria-expanded', expanded.toString());
  },

  setAriaSelected: (element: HTMLElement, selected: boolean) => {
    element.setAttribute('aria-selected', selected.toString());
  }
};

// Color contrast checker
export const checkColorContrast = (foreground: string, background: string): boolean => {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const srgb = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * srgb[0]! + 0.7152 * srgb[1]! + 0.0722 * srgb[2]!;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return ratio >= 4.5; // WCAG AA standard
};

// Screen reader utilities
export const screenReaderUtils = {
  hideFromScreenReader: (element: HTMLElement) => {
    element.setAttribute('aria-hidden', 'true');
  },

  showToScreenReader: (element: HTMLElement) => {
    element.removeAttribute('aria-hidden');
  },

  setAriaLabel: (element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label);
  },

  setAriaDescribedBy: (element: HTMLElement, id: string) => {
    element.setAttribute('aria-describedby', id);
  }
};

// Skip links for keyboard navigation
export const createSkipLink = (targetId: string, text: string = 'Zum Hauptinhalt springen') => {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    transition: top 0.3s;
    z-index: 9999;
  `;

  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });

  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });

  return skipLink;
};

// Accessibility audit helper
export const performA11yAudit = () => {
  const issues: string[] = [];

  // Check for missing alt text
  const images = document.querySelectorAll('img:not([alt])');
  if (images.length > 0) {
    issues.push(`${images.length} Bilder ohne alt-Text gefunden`);
  }

  // Check for missing labels
  const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
  const inputsWithoutLabels = Array.from(inputs).filter(input => {
    const id = input.getAttribute('id');
    return !id || !document.querySelector(`label[for="${id}"]`);
  });
  
  if (inputsWithoutLabels.length > 0) {
    issues.push(`${inputsWithoutLabels.length} Eingabefelder ohne Label gefunden`);
  }

  // Check for missing headings hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastHeadingLevel = 0;
  for (const heading of headings) {
    const level = parseInt(heading.tagName.slice(1));
    if (level > lastHeadingLevel + 1) {
      issues.push('Überschriften-Hierarchie ist nicht korrekt');
      break;
    }
    lastHeadingLevel = level;
  }

  return {
    score: Math.max(0, 100 - (issues.length * 10)),
    issues,
    recommendations: issues.length === 0 ? ['Barrierefreiheit ist gut umgesetzt!'] : issues
  };
};

// Development-only a11y logging
if (import.meta.env.DEV) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const audit = performA11yAudit();
      console.group('♿ Accessibility Audit');
      console.log('Score:', audit.score);
      console.log('Issues:', audit.issues);
      console.groupEnd();
    }, 3000);
  });
}