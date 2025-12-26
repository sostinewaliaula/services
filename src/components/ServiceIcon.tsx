import React from 'react';
import { API_BASE_URL } from '../api/client';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ServiceIconProps {
    name: string;
    category: string;
    logoUrl?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({
    name,
    category,
    logoUrl,
    size = 'md',
    className = ''
}) => {
    const sizeClasses = {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-14 w-14 text-lg',
        xl: 'h-20 w-20 text-2xl'
    };

    const iconSizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-7 w-7',
        xl: 'h-10 w-10'
    };

    // Generate initials
    const initials = name
        .split(/[\s-_]+/)
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    // Get category-based gradient
    const getGradient = (cat: string) => {
        switch (cat) {
            case 'Databases':
                return 'from-blue-500 to-cyan-400';
            case 'Application Servers':
                return 'from-indigo-600 to-purple-500';
            case 'HR Systems':
                return 'from-pink-500 to-rose-400';
            case 'Asset Management':
                return 'from-orange-500 to-amber-400';
            case 'Ticketing Systems':
                return 'from-purple-600 to-indigo-500';
            case 'Task Trackers':
                return 'from-emerald-500 to-teal-400';
            default:
                return 'from-slate-500 to-slate-400';
        }
    };

    const getCategoryIcon = (cat: string): LucideIcon | null => {
        switch (cat) {
            case 'Databases': return LucideIcons.Database;
            case 'Application Servers': return LucideIcons.Server;
            case 'HR Systems': return LucideIcons.Users;
            case 'Asset Management': return LucideIcons.Package;
            case 'Ticketing Systems': return LucideIcons.Ticket;
            case 'Task Trackers': return LucideIcons.CheckSquare;
            default: return null;
        }
    };

    const IconComponent = getCategoryIcon(category);
    const gradient = getGradient(category);

    return (
        <div className={`shrink-0 flex items-center justify-center rounded-xl overflow-hidden shadow-sm border border-white/20 select-none ${sizeClasses[size]} ${className}`}>
            {logoUrl ? (
                <img
                    src={(logoUrl.startsWith('http') || logoUrl.startsWith('data:')) ? logoUrl : `${API_BASE_URL.replace('/api', '')}${logoUrl}`}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            ) : (
                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient} text-white font-bold tracking-wider`}>
                    {IconComponent ? (
                        <IconComponent className={iconSizeClasses[size]} />
                    ) : (
                        initials
                    )}
                </div>
            )}
        </div>
    );
};
