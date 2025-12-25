import React from 'react';
import { ChevronDown } from 'lucide-react';
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}
export function Select({
  className = '',
  children,
  label,
  ...props
}: SelectProps) {
  return <div className="relative">
    {label && (
      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
        {label} {props.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
    )}
    <div className="relative">
      <select className={`
            w-full appearance-none rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-1.5 pr-10 text-xs text-slate-900 dark:text-slate-200
            focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}
          `} {...props}>
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
        <ChevronDown className="h-4 w-4" />
      </div>
    </div>
  </div>;
}