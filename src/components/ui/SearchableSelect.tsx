import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    id: string;
    name: string;
}

interface SearchableSelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
}

export function SearchableSelect({
    label,
    value,
    onChange,
    options,
    placeholder = "Select...",
    disabled = false,
    required = false,
    className = ""
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const selected = options.find(o => o.id === value);
        if (selected) {
            setSearchTerm(selected.name);
        } else if (!isOpen) { // Only clear if not open (prevent clearing while typing if ID mismatch happens instantly)
            setSearchTerm('');
        }
    }, [value, options, isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Revert to selected value name on close if no new valid selection
                const selected = options.find(o => o.id === value);
                setSearchTerm(selected ? selected.name : '');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value, options]);

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option: Option) => {
        onChange(option.id);
        setSearchTerm(option.name);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (!isOpen) setIsOpen(true);
        // Optional: clear value if search term doesn't match selected? 
        // For now, keep value until explicit select, or maybe clear validation? 
        // We'll stick to simple selection model.
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    {label} {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    className={`
                        w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-1.5 pr-10 text-xs text-slate-900 dark:text-slate-200
                        focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                        disabled:cursor-not-allowed disabled:opacity-50
                        ${className}
                    `}
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    disabled={disabled}
                />
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    disabled={disabled}
                >
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg max-h-60 overflow-auto">
                    {filteredOptions.length > 0 ? (
                        <ul className="py-1">
                            {filteredOptions.map((option) => (
                                <li
                                    key={option.id}
                                    onClick={() => handleSelect(option)}
                                    className={`
                                        px-4 py-2 text-xs cursor-pointer flex items-center justify-between
                                        ${option.id === value ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}
                                    `}
                                >
                                    <span>{option.name}</span>
                                    {option.id === value && <Check className="h-3 w-3" />}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-2 text-xs text-slate-400">No options found</div>
                    )}
                </div>
            )}
        </div>
    );
}
