import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const options = [
        { id: 'light', icon: Sun, label: 'Light' },
        { id: 'system', icon: Monitor, label: 'System' },
        { id: 'dark', icon: Moon, label: 'Dark' }
    ] as const;

    return (
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
            {options.map(({ id, icon: Icon, label }) => (
                <button
                    key={id}
                    onClick={() => setTheme(id)}
                    className={`relative p-1.5 rounded-lg flex items-center gap-2 group overflow-hidden ${theme === id
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    title={label}
                >
                    <Icon className={`h-4 w-4 ${theme === id ? 'scale-110' : 'scale-100'}`} />
                    {theme === id && (
                        <span className="text-[10px] font-bold pr-1 animate-in fade-in slide-in-from-left-1">
                            {label}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
