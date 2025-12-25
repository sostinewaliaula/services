import { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { Service, ServiceCategory, ServiceCategoryData, ServiceTypeData, EnvironmentData, TeamData } from '../types/service';
import { Button } from '../components/ui/Button';
import { ServiceCard } from '../components/ServiceCard';
import { FeaturedServices } from '../components/FeaturedServices';
import { Header } from '../components/Header';
import { FilterPanel } from '../components/FilterPanel';
import { ServiceDetailModal } from '../components/ServiceDetailModal';
import { Loader2 } from 'lucide-react';

export function Dashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategoryData[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceTypeData[]>([]);
  const [environments, setEnvironments] = useState<EnvironmentData[]>([]);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'All'>('All');
  const [selectedEnv, setSelectedEnv] = useState<string | 'All'>('All');
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
      const [servicesData, categoriesData, typesData, envData, teamsData] = await Promise.all([
        api.getServices(),
        api.getCategories(),
        api.getServiceTypes(),
        api.getEnvironments(),
        api.getTeams()
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
      setServiceTypes(typesData);
      setEnvironments(envData);
      setTeams(teamsData);
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
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        service.name.toLowerCase().includes(term) ||
        (service.url && service.url.toLowerCase().includes(term)) ||
        (service.ip_address && service.ip_address.toLowerCase().includes(term)) ||
        (service.port && service.port.toString().includes(term));
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

  const allEnvNames = useMemo(() => {
    return ['All', ...environments.map(e => e.name)];
  }, [environments]);

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
        environments={allEnvNames.filter(e => e !== 'All')}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={fetchData}
        isLoading={loading}
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
          <>
            <FeaturedServices
              services={filteredServices.filter(s => s.isFeatured)}
              onServiceClick={handleServiceClick}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {filteredServices.filter(s => !s.isFeatured).map(service => (
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
          </>
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
        environments={environments}
        teams={teams}
      />
    </div>
  );
}