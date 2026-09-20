import { AlertTriangle } from 'lucide-react';
import Modal from '@/ui/reusables/Modal/Modal.tsx';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDanger?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  isDanger = false,
}: ConfirmDialogProps) {
  function handleConfirm() {
    onConfirm();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-5">
        {/* Icon + Message */}
        <div className="flex items-start gap-4">
          {isDanger && (
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />
            </div>
          )}
          <p className="font-body text-soroco-mocha text-sm sm:text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={[
              'inline-flex items-center justify-center gap-2',
              'px-5 py-2.5 rounded-full font-body font-semibold text-sm',
              'transition-all duration-200 active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              isDanger
                ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
                : 'bg-soroco-amber text-white hover:bg-soroco-sienna focus-visible:ring-soroco-amber',
            ].join(' ')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
