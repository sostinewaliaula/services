import React from 'react';
import { Service } from '../types/service';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Database, Server, Users, Package, Ticket, CheckSquare, ExternalLink } from 'lucide-react';
interface ServiceCardProps {
  service: Service;
  onClick: (service: Service) => void;
}
export function ServiceCard({
  service,
  onClick
}: ServiceCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Databases':
        return <Database className="h-5 w-5 text-blue-500" />;
      case 'Application Servers':
        return <Server className="h-5 w-5 text-indigo-500" />;
      case 'HR Systems':
        return <Users className="h-5 w-5 text-pink-500" />;
      case 'Asset Management':
        return <Package className="h-5 w-5 text-orange-500" />;
      case 'Ticketing Systems':
        return <Ticket className="h-5 w-5 text-purple-500" />;
      case 'Task Trackers':
        return <CheckSquare className="h-5 w-5 text-green-500" />;
      default:
        return <div className="h-5 w-5 text-slate-500" />;
    }
  };
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Maintenance':
        return 'warning';
      case 'Deprecated':
        return 'danger';
      default:
        return 'neutral';
    }
  };
  const getEnvVariant = (env: string) => {
    switch (env) {
      case 'Production':
        return 'default';
      case 'Test':
        return 'neutral';
      case 'Dev':
        return 'outline';
      default:
        return 'neutral';
    }
  };
  return <Card hoverEffect={true} onClick={() => onClick(service)} className="h-full flex flex-col">
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
            {getCategoryIcon(service.category)}
          </div>
          <div className="flex gap-2">
            {service.isFeatured && <Badge variant="warning" className="shadow-sm">
                Featured
              </Badge>}
            <Badge variant={getStatusVariant(service.status)}>
              {service.status}
            </Badge>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {service.name}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-4">
            {service.description}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">{service.team}</span>
            </div>
            <Badge variant={getEnvVariant(service.environment)} className="text-[10px] px-2 py-0">
              {service.environment}
            </Badge>
          </div>
        </div>
      </div>
    </Card>;
}