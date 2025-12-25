import { Service } from '../types/service';
import { ServiceCard } from './ServiceCard';
import { Star } from 'lucide-react';
interface FeaturedServicesProps {
  services: Service[];
  onServiceClick: (service: Service) => void;
}
export function FeaturedServices({
  services,
  onServiceClick
}: FeaturedServicesProps) {
  if (services.length === 0) return null;
  return <section className="py-8">
    <div className="flex items-center gap-2 mb-6">
      <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-md">
        <Star className="h-5 w-5 text-amber-600 dark:text-amber-500 fill-amber-600 dark:fill-amber-500" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Featured Services</h2>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
      {services.map(service => <ServiceCard key={service.id} service={service} onClick={onServiceClick} />)}
    </div>
  </section>;
}