import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  initialFocusSelector,
  panelClassName,
  bodyClassName,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    const focusable =
      (initialFocusSelector && dialog?.querySelector(initialFocusSelector)) ||
      dialog?.querySelector(
        'input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])',
      );
    focusable?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialog) return;
      const controls = [
        ...dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((element) => !element.disabled);
      if (!controls.length) return;
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.paddingRight = previousBodyPaddingRight;
      previouslyFocused?.focus();
    };
  }, [initialFocusSelector, open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center overflow-hidden overscroll-contain bg-forest/50 p-3 backdrop-blur-md sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => event.target === event.currentTarget && onClose()}
        >
          <motion.section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className={cn(
              'flex max-h-[90vh] max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/85 shadow-[0_30px_90px_rgba(19,42,31,0.28)] backdrop-blur-2xl sm:rounded-card',
              panelClassName,
            )}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-forest/8 px-5 py-4 sm:px-7 sm:py-5">
              <h2 id="modal-title" className="font-display text-xl font-extrabold text-forest">
                {title}
              </h2>
              <Button
                variant="ghost"
                className="size-10 shrink-0 p-0 sm:size-11"
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X className="size-5" />
              </Button>
            </header>
            <div
              className={cn(
                'min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6',
                bodyClassName,
              )}
            >
              {children}
            </div>
            {footer && (
              <footer className="shrink-0 border-t border-forest/8 bg-white/80 px-5 py-4 backdrop-blur-xl sm:px-7 sm:py-5">
                {footer}
              </footer>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
