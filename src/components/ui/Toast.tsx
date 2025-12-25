import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info as InfoIcon } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 max-w-md w-full sm:w-auto">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in fade-in slide-in-from-right-4 duration-300
                            ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                                toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' :
                                    toast.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                                        'bg-white border-slate-200 text-slate-800'}
                        `}
                    >
                        <div className="flex-shrink-0">
                            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                            {toast.type === 'warning' && <AlertCircle className="h-5 w-5 text-amber-500" />}
                            {toast.type === 'info' && <InfoIcon className="h-5 w-5 text-blue-500" />}
                        </div>
                        <p className="text-sm font-medium flex-grow">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors"
                        >
                            <X className="h-4 w-4 opacity-60" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
