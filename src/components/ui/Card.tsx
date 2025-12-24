import React from 'react';
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}
export function Card({
  children,
  className = '',
  hoverEffect = false,
  ...props
}: CardProps) {
  return <div className={`
        bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden
        ${hoverEffect ? 'transition-all duration-200 hover:shadow-md hover:-translate-y-1 hover:border-blue-200 cursor-pointer' : ''}
        ${className}
      `} {...props}>
      {children}
    </div>;
}