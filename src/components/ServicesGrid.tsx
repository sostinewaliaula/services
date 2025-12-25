import { Service } from '../types/service';
import { ServiceCard } from './ServiceCard';
interface ServicesGridProps {
  services: Service[];
  onServiceClick: (service: Service) => void;
  grouped?: boolean;
}
export function ServicesGrid({
  services,
  onServiceClick,
  grouped = true
}: ServicesGridProps) {
  if (services.length === 0) {
    return <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
      <h3 className="text-lg font-medium text-slate-900 mb-1">
        No services found
      </h3>
      <p className="text-slate-500">
        Try adjusting your search or filters to find what you're looking for.
      </p>
    </div>;
  }
  // If not grouped, just show a grid
  if (!grouped) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
      {services.map(service => <ServiceCard key={service.id} service={service} onClick={onServiceClick} />)}
    </div>;
  }
  // Group by category
  const categories = Array.from(new Set(services.map(s => s.category))).sort();
  return <div className="space-y-8">
    {categories.map(category => {
      const categoryServices = services.filter(s => s.category === category);
      return <section key={category}>
        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          {category}
          <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {categoryServices.length}
          </span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {categoryServices.map(service => <ServiceCard key={service.id} service={service} onClick={onServiceClick} />)}
        </div>
      </section>;
    })}
  </div>;
}