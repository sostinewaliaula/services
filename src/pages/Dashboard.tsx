import { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { Service, ServiceCategory, ServiceCategoryData, ServiceEnvironment, ServiceTypeData } from '../types/service';
import { Button } from '../components/ui/Button';
import { ServiceCard } from '../components/ServiceCard';
import { Header } from '../components/Header';
import { FilterPanel } from '../components/FilterPanel';
import { ServiceDetailModal } from '../components/ServiceDetailModal';
import { Loader2 } from 'lucide-react';

export function Dashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryData[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'All'>('All');
  const [selectedEnv, setSelectedEnv] = useState<ServiceEnvironment | 'All'>('All');
  const [selectedType, setSelectedType] = useState<string | 'All'>('All');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesData, categoriesData, typesData] = await Promise.all([
        api.getServices(),
        api.getCategories(),
        api.getServiceTypes()
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
      setServiceTypes(typesData);
      setError(null);
    } catch (err) {
      setError('Failed to load services. Please check if the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsDetailModalOpen(true);
  };

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
      const matchesType = selectedType === 'All' || service.serviceTypeName === selectedType;
      const matchesEnv = selectedEnv === 'All' || service.environment === selectedEnv;
      const matchesFeatured = !showFeaturedOnly || service.isFeatured;
      return matchesSearch && matchesCategory && matchesType && matchesEnv && matchesFeatured;
    });
  }, [services, searchTerm, selectedCategory, selectedType, selectedEnv, showFeaturedOnly]);

  const allCategoryNames = useMemo(() => {
    return ['All', ...categories.map(c => c.name)];
  }, [categories]);

  const allTypeNames = useMemo(() => {
    return ['All', ...serviceTypes.map(t => t.name)];
  }, [serviceTypes]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <FilterPanel
        category={selectedCategory}
        type={selectedType}
        environment={selectedEnv}
        showFeaturedOnly={showFeaturedOnly}
        onCategoryChange={setSelectedCategory}
        onTypeChange={setSelectedType}
        onEnvironmentChange={setSelectedEnv}
        onFeaturedChange={setShowFeaturedOnly}
        onClearFilters={() => {
          setSearchTerm('');
          setSelectedCategory('All');
          setSelectedType('All');
          setSelectedEnv('All');
          setShowFeaturedOnly(false);
        }}
        totalResults={filteredServices.length}
        categories={allCategoryNames.filter(c => c !== 'All')}
        serviceTypes={allTypeNames.filter(t => t !== 'All')}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Crunching infrastructure data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <h3 className="text-red-900 font-bold text-lg mb-2">Connection Error</h3>
            <p className="text-red-700">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onClick={handleServiceClick}
              />
            ))}
            {filteredServices.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-500 text-lg">No services found matching your criteria.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedService(null);
        }}
        categories={categories}
        serviceTypes={serviceTypes}
      />
    </div>
  );
}