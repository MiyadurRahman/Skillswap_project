import { useEffect } from 'react';

// Shared keyboard and scroll behavior for modal surfaces.
export function useDialogBehavior(open, onClose) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    const focusFrame = requestAnimationFrame(() => {
      document
        .querySelector(
          '[role="dialog"]:not([aria-hidden="true"]) button, [role="dialog"]:not([aria-hidden="true"]) input, [role="dialog"]:not([aria-hidden="true"]) select, [role="dialog"]:not([aria-hidden="true"]) textarea'
        )
        ?.focus();
    });

    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);
}
