import { useState } from 'react';
import { Service } from '../types/service';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Database, Server, Users, Package, Ticket, CheckSquare, Globe, Hash, Link as LinkIcon, Copy, Check, ExternalLink, Key, Tag } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onClick: (service: Service) => void;
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!service.url) return;

    navigator.clipboard.writeText(service.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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
      case 'Online':
        return 'success';
      case 'Maintenance':
        return 'warning';
      case 'Deprecated':
      case 'Offline':
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

  return (
    <Card hoverEffect={true} onClick={() => onClick(service)} className="h-full flex flex-col group">
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">{getCategoryIcon(service.category)}</div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{service.category}</span>
              <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                <Tag className="h-3 w-3" /> {service.serviceTypeName || 'Generic'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {service.isFeatured && <Badge variant="warning" className="shadow-sm">Featured</Badge>}
            <Badge variant={getStatusVariant(service.status)}>{service.status}</Badge>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {service.name}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-start justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
              <div className="flex items-start gap-2 overflow-hidden">
                <LinkIcon className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <span className="font-mono break-all">{service.url || 'No URL Found'}</span>
              </div>
              {service.url && (
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleOpenLink}
                    className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-blue-600"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-blue-600"
                    title="Copy URL"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
              <Globe className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="font-mono">{service.ip_address || 'No IP Found'}</span>
            </div>
            {service.port && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                <Hash className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-mono">Port: {service.port}</span>
              </div>
            )}
          </div>

          {service.tags && service.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {service.tags.map(tag => (
                <span key={tag.id} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <div className="flex items-center gap-2 text-slate-700">
              <Users className="h-3 w-3" />
              <span className="font-medium">{service.team}</span>
            </div>
            <div className="flex items-center gap-2">
              {(service.service_username || service.service_password) && (
                <div title="Credentials Available">
                  <Key className="h-3 w-3 text-amber-500" />
                </div>
              )}
              {service.db_connection && (
                <div title="Database Info Available">
                  <Database className="h-3 w-3 text-blue-500" />
                </div>
              )}
              <Badge variant={getEnvVariant(service.environment)} className="text-[10px] px-2 py-0">
                {service.environment}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}