import { Search, Settings, LayoutDashboard, X, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';
import { Button } from './ui/Button';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    actionButton?: {
        label: string;
        onClick: () => void;
        icon: React.ElementType;
    };
    searchPlaceholder?: string;
}

export function Header({ searchTerm, onSearchChange, actionButton, searchPlaceholder = "Search services..." }: HeaderProps) {
    const location = useLocation();
    const isManagePage = location.pathname === '/manage';
    const { isAuthenticated, logout } = useAuth();

    return (
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo & Info */}
                    <Link to="/" id="header-logo" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
                        <div className="flex items-center justify-center">
                            <img src={logo} alt="Service Hub Logo" className="h-10 w-auto object-contain" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                                Services Hub
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                Infrastructure Directory
                            </p>
                        </div>
                    </Link>

                    <div className="flex-1 max-w-lg hidden md:block">
                        <div id="header-search" className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                className="w-full pl-10 pr-10 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm dark:text-slate-200"
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => onSearchChange('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                                    title="Clear search"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div id="theme-toggle-container">
                            <ThemeToggle />
                        </div>

                        {actionButton && (
                            <Button size="sm" onClick={actionButton.onClick} className="gap-2 bg-blue-600 hover:bg-blue-700">
                                <actionButton.icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{actionButton.label}</span>
                                <span className="sm:hidden">{actionButton.label.split(' ')[0]}</span>
                            </Button>
                        )}
                        <Link to={isManagePage ? '/' : '/manage'}>
                            <Button size="sm" variant={isManagePage ? 'outline' : 'secondary'} className="gap-2">
                                {isManagePage ? (
                                    <>
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span className="hidden sm:inline">Back to Dashboard</span>
                                        <span className="sm:hidden">Back</span>
                                    </>
                                ) : (
                                    <>
                                        <Settings className="h-4 w-4" />
                                        <span className="hidden sm:inline">Manage Services</span>
                                        <span className="sm:hidden">Manage</span>
                                    </>
                                )}
                            </Button>
                        </Link>

                        {isAuthenticated && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={logout}
                                className="gap-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
