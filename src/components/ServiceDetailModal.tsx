import React from 'react';
import { Service } from '../types/service';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { ExternalLink, FileText, BarChart2, Clock, User, Shield, Globe, AlertTriangle } from 'lucide-react';
interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}
export function ServiceDetailModal({
  service,
  isOpen,
  onClose
}: ServiceDetailModalProps) {
  if (!service) return null;
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
  return <Modal isOpen={isOpen} onClose={onClose} title="Service Details" maxWidth="2xl">
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-slate-900">
              {service.name}
            </h2>
            <Badge variant={getStatusVariant(service.status)}>
              {service.status}
            </Badge>
          </div>
          <p className="text-slate-600 text-lg leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {service.url && <a href={service.url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
              <Button className="w-full sm:w-auto gap-2">
                <ExternalLink className="h-4 w-4" />
                Launch Service
              </Button>
            </a>}
          {service.documentation && <a href={service.documentation} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
              <Button variant="secondary" className="w-full sm:w-auto gap-2">
                <FileText className="h-4 w-4" />
                Documentation
              </Button>
            </a>}
          {service.dashboard && <a href={service.dashboard} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <BarChart2 className="h-4 w-4" />
                Metrics
              </Button>
            </a>}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Globe className="h-4 w-4" /> Environment
            </div>
            <div className="text-slate-900 font-medium">
              {service.environment}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Shield className="h-4 w-4" /> Category
            </div>
            <div className="text-slate-900 font-medium">{service.category}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <User className="h-4 w-4" /> Owner
            </div>
            <div className="text-slate-900 font-medium">{service.owner}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Users className="h-4 w-4" /> Team
            </div>
            <div className="text-slate-900 font-medium">{service.team}</div>
          </div>
        </div>

        {/* Notes Section */}
        {service.notes && <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900 mb-1">
                  Important Notes
                </h4>
                <p className="text-sm text-amber-800">{service.notes}</p>
              </div>
            </div>
          </div>}

        {/* Footer Info */}
        <div className="flex items-center gap-2 text-xs text-slate-400 pt-4 border-t border-slate-100">
          <Clock className="h-3 w-3" />
          <span>
            Last updated: {new Date(service.lastUpdated).toLocaleDateString()}
          </span>
          <span className="mx-1">•</span>
          <span>ID: {service.id}</span>
        </div>
      </div>
    </Modal>;
}