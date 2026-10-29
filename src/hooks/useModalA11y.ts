import { useEffect, useRef } from 'react';

/**
 * Modal accessibility helpers: traps Tab within the dialog, restores focus to
 * the previously focused element on unmount, and returns a ref for the panel.
 */
export function useModalA11y<T extends HTMLElement>(onRequestClose?: () => void) {
  const panelRef = useRef<T>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    if (!panel) return;

    // Move focus into the panel (first focusable, else the panel itself).
    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null || panel === el);

    const first = focusables()[0];
    (first || panel).focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onRequestClose) {
        e.preventDefault();
        onRequestClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [onRequestClose]);

  return panelRef;
}
