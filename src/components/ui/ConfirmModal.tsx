import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'info',
    isLoading = false
}: ConfirmModalProps) {
    const variantColors = {
        danger: 'bg-red-50 text-red-600 border-red-100',
        warning: 'bg-amber-50 text-amber-600 border-amber-100',
        info: 'bg-blue-50 text-blue-600 border-blue-100'
    };

    const confirmButtonVariants = {
        danger: 'danger',
        warning: 'primary', // Use primary for warning if specific warning variant not in Button
        info: 'primary'
    } as const;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
            <div className="space-y-4">
                <div className={`flex items-start gap-3 p-3 rounded-lg border ${variantColors[variant]}`}>
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed">{message}</p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={confirmButtonVariants[variant] === 'danger' ? 'danger' : 'primary'}
                        onClick={() => {
                            onConfirm();
                        }}
                        isLoading={isLoading}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
