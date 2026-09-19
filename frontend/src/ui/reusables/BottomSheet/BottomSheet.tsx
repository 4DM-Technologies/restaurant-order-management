import { useEffect, type ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  /* Body scroll lock */
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* Escape key */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            key="sheet-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-soroco-charcoal/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet panel */}
          <motion.div
            key="sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'sheet-title' : undefined}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) onClose();
            }}
            className="relative z-10 bg-white rounded-t-3xl shadow-warm-xl w-full"
            style={{ maxHeight: '90dvh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 rounded-full bg-soroco-linen" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-6 pt-2 pb-4 border-b border-soroco-linen shrink-0">
                <h2
                  id="sheet-title"
                  className="font-display text-xl font-semibold text-soroco-charcoal"
                >
                  {title}
                </h2>
              </div>
            )}

            {/* Scrollable body */}
            <div className="overflow-y-auto px-6 py-4 flex-1 overscroll-contain">
              {children}
            </div>

            {/* Safe area bottom padding */}
            <div className="safe-area-pb" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const portal = document.getElementById('modal-root') ?? document.body;
  return ReactDOM.createPortal(content, portal);
}
