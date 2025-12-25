import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  noPadding?: boolean;
}
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
  noPadding
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl'
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />

    <div ref={modalRef} className={`
          relative w-full ${maxWidthClasses[maxWidth]} transform rounded-xl bg-white dark:bg-slate-900 shadow-2xl transition-all
          flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800
        `} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
        <h3 id="modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-500 dark:hover:text-slate-300 transition-colors" aria-label="Close modal">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto ${noPadding ? '' : 'px-6 py-4'}`}>{children}</div>
    </div>
  </div>;
}