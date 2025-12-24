import React from 'react';
import { Search } from 'lucide-react';
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}
export function Input({
  className = '',
  icon,
  ...props
}: InputProps) {
  return <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </div>}
      <input className={`
          w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
          disabled:cursor-not-allowed disabled:opacity-50
          ${icon ? 'pl-10' : ''}
          ${className}
        `} {...props} />
    </div>;
}