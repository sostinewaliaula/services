import { Search, X, RotateCw } from 'lucide-react';
import { Select } from './ui/Select';
import { ServiceCategory } from '../types/service';
import { Button } from './ui/Button';

interface FilterPanelProps {
  category: ServiceCategory | 'All';
  type: string | 'All';
  environment: string | 'All';
  showFeaturedOnly: boolean;
  onCategoryChange: (category: ServiceCategory | 'All') => void;
  onTypeChange: (type: string) => void;
  onEnvironmentChange: (env: string | 'All') => void;
  onFeaturedChange: (featured: boolean) => void;
  onClearFilters: () => void;
  totalResults: number;
  categories: string[];
  serviceTypes: string[];
  environments: string[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function FilterPanel({
  category,
  type,
  environment,
  showFeaturedOnly,
  onCategoryChange,
  onTypeChange,
  onEnvironmentChange,
  onFeaturedChange,
  onClearFilters,
  totalResults,
  categories,
  serviceTypes,
  environments,
  searchTerm,
  onSearchChange,
  onRefresh,
  isLoading
}: FilterPanelProps) {
  const hasActiveFilters = category !== 'All' || type !== 'All' || environment !== 'All' || showFeaturedOnly || searchTerm !== '';

  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-[65px] z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-row items-center gap-4">
          {/* Mobile/Sticky Search */}
          <div className="relative flex-1 max-w-xs md:hidden">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 flex-1 overflow-x-auto no-scrollbar py-1">
            <div className="min-w-[140px]">
              <Select
                value={category}
                onChange={(e) => onCategoryChange(e.target.value as ServiceCategory | 'All')}
                aria-label="Filter by category"
                className="h-9 text-xs"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            <div className="min-w-[130px]">
              <Select
                value={type}
                onChange={(e) => onTypeChange(e.target.value)}
                aria-label="Filter by type"
                className="h-9 text-xs"
              >
                <option value="All">All Types</option>
                {serviceTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>

            <div className="min-w-[130px]">
              <Select
                value={environment}
                onChange={(e) => onEnvironmentChange(e.target.value as string | 'All')}
                aria-label="Filter by environment"
                className="h-9 text-xs"
              >
                <option value="All">All Envs</option>
                {environments.map((env) => (
                  <option key={env} value={env}>
                    {env}
                  </option>
                ))}
              </Select>
            </div>

            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors select-none shrink-0 h-9">
              <input
                type="checkbox"
                checked={showFeaturedOnly}
                onChange={(e) => onFeaturedChange(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
              />
              <span className="text-xs font-medium text-slate-700">Featured</span>
            </label>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden lg:inline text-xs text-slate-500 font-medium">
              {totalResults} {totalResults === 1 ? 'result' : 'results'}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0"
              title="Refresh Data"
              disabled={isLoading}
            >
              <RotateCw className={`h-3.5 w-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-8 text-[11px] text-slate-500 hover:text-red-600 px-2"
              >
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}