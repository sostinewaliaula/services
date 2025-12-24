import React from 'react';
import { Select } from './ui/Select';
import { ServiceCategory, ServiceEnvironment } from '../types/service';
import { Filter, X } from 'lucide-react';
import { Button } from './ui/Button';
interface FilterPanelProps {
  category: ServiceCategory | 'All';
  environment: ServiceEnvironment | 'All';
  showFeaturedOnly: boolean;
  onCategoryChange: (category: ServiceCategory | 'All') => void;
  onEnvironmentChange: (env: ServiceEnvironment | 'All') => void;
  onFeaturedChange: (featured: boolean) => void;
  onClearFilters: () => void;
  totalResults: number;
}
export function FilterPanel({
  category,
  environment,
  showFeaturedOnly,
  onCategoryChange,
  onEnvironmentChange,
  onFeaturedChange,
  onClearFilters,
  totalResults
}: FilterPanelProps) {
  const hasActiveFilters = category !== 'All' || environment !== 'All' || showFeaturedOnly;
  return <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="w-full sm:w-48">
              <Select value={category} onChange={e => onCategoryChange(e.target.value as ServiceCategory | 'All')} aria-label="Filter by category">
                <option value="All">All Categories</option>
                <option value="Databases">Databases</option>
                <option value="Application Servers">App Servers</option>
                <option value="HR Systems">HR Systems</option>
                <option value="Asset Management">Asset Management</option>
                <option value="Ticketing Systems">Ticketing</option>
                <option value="Task Trackers">Task Trackers</option>
                <option value="Infrastructure">Infrastructure</option>
              </Select>
            </div>

            <div className="w-full sm:w-40">
              <Select value={environment} onChange={e => onEnvironmentChange(e.target.value as ServiceEnvironment | 'All')} aria-label="Filter by environment">
                <option value="All">All Environments</option>
                <option value="Production">Production</option>
                <option value="Test">Test</option>
                <option value="Dev">Dev</option>
              </Select>
            </div>

            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors select-none">
              <input type="checkbox" checked={showFeaturedOnly} onChange={e => onFeaturedChange(e.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700">
                Featured Only
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
            <span className="text-sm text-slate-500 font-medium">
              {totalResults} {totalResults === 1 ? 'result' : 'results'}
            </span>

            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-slate-500 hover:text-red-600">
                <X className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>}
          </div>
        </div>
      </div>
    </div>;
}