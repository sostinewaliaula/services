import React, { useMemo, useState } from 'react';
import { mockServices } from '../data/mockServices';
import { Service, ServiceCategory, ServiceEnvironment } from '../types/service';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { FeaturedServices } from '../components/FeaturedServices';
import { ServicesGrid } from '../components/ServicesGrid';
import { ServiceDetailModal } from '../components/ServiceDetailModal';
import { LayoutGrid } from 'lucide-react';
export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'All'>('All');
  const [selectedEnv, setSelectedEnv] = useState<ServiceEnvironment | 'All'>('All');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Filter Logic
  const filteredServices = useMemo(() => {
    return mockServices.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || service.description.toLowerCase().includes(searchQuery.toLowerCase()) || service.owner.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
      const matchesEnv = selectedEnv === 'All' || service.environment === selectedEnv;
      const matchesFeatured = !showFeaturedOnly || service.isFeatured;
      return matchesSearch && matchesCategory && matchesEnv && matchesFeatured;
    });
  }, [searchQuery, selectedCategory, selectedEnv, showFeaturedOnly]);
  const featuredServices = useMemo(() => {
    // If we are filtering, we might not want to show the separate featured section
    // or we might want to show only featured services that match the filter.
    // For this design, let's keep the featured section static unless search is active.
    if (searchQuery || selectedCategory !== 'All' || selectedEnv !== 'All' || showFeaturedOnly) {
      return [];
    }
    return mockServices.filter(s => s.isFeatured);
  }, [searchQuery, selectedCategory, selectedEnv, showFeaturedOnly]);
  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };
  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedEnv('All');
    setShowFeaturedOnly(false);
  };
  return <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <LayoutGrid className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Services Hub
                </h1>
                <p className="text-sm text-slate-500">
                  Internal IT Service Directory
                </p>
              </div>
            </div>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </header>

      {/* Filter Panel */}
      <FilterPanel category={selectedCategory} environment={selectedEnv} showFeaturedOnly={showFeaturedOnly} onCategoryChange={setSelectedCategory} onEnvironmentChange={setSelectedEnv} onFeaturedChange={setShowFeaturedOnly} onClearFilters={handleClearFilters} totalResults={filteredServices.length} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Featured Section - Only show when no filters are active */}
        {featuredServices.length > 0 && <FeaturedServices services={featuredServices} onServiceClick={handleServiceClick} />}

        {/* All Services Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {featuredServices.length > 0 ? 'All Services' : 'Search Results'}
            </h2>
          </div>

          <ServicesGrid services={filteredServices} onServiceClick={handleServiceClick} grouped={!showFeaturedOnly && selectedCategory === 'All' && !searchQuery} />
        </div>
      </main>

      {/* Service Detail Modal */}
      <ServiceDetailModal service={selectedService} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>;
}