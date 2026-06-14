import { ReactNode } from 'react';

interface ModalProps {
  open:      boolean;
  onClose:   () => void;
  title?:    string;
  children:  ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

const maxWidthClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

export function Modal({ open, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-2xl shadow-xl
                    flex flex-col max-h-[90vh] overflow-hidden`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 id="modal-title" className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
}
