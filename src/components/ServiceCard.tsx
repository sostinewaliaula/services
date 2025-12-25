import { useState } from 'react';
import { Service } from '../types/service';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { ServiceIcon } from './ServiceIcon';
import { Database, Server, Users, Package, Ticket, CheckSquare, Globe, Hash, Link as LinkIcon, Copy, Check, ExternalLink, Key, Tag, Download } from 'lucide-react';
import { downloadServiceDetails } from '../utils/downloadService';

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

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadServiceDetails(service);
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
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <ServiceIcon
              name={service.name}
              category={service.category}
              logoUrl={service.logo_url}
              size="md"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{service.category}</span>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Tag className="h-3 w-3" /> {service.serviceTypeName || 'Generic'}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {service.isFeatured && <Badge variant="warning" className="shadow-sm">Featured</Badge>}
            {service.url ? (
              <Badge variant={getStatusVariant(service.status)}>{service.status}</Badge>
            ) : (
              <Badge variant="neutral">No URL</Badge>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {service.name}
          </h3>

          <div className="space-y-1 mb-3">
            <div className="flex items-start justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-md border border-slate-100 dark:border-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:border-blue-100 dark:group-hover:border-blue-800/50 transition-colors">
              <div className="flex items-start gap-1.5 overflow-hidden">
                <LinkIcon className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span className="font-mono break-all leading-tight">{service.url || (service.pdb_name ? `PDB: ${service.pdb_name}` : 'No URL')}</span>
              </div>
              {service.url && (
                <div className="flex items-center gap-1 shrink-0">
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleOpenLink}
                    className="p-0.5 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-blue-600"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <button
                    onClick={handleCopy}
                    className="p-0.5 hover:bg-white rounded border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-blue-600"
                    title="Copy URL"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-md border border-slate-100 dark:border-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:border-indigo-100 dark:group-hover:border-indigo-800/50 transition-colors">
              <Globe className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
              <span className="font-mono">{service.ip_address || 'No IP'}</span>
            </div>
            {service.port && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-md border border-slate-100 dark:border-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:border-emerald-100 dark:group-hover:border-emerald-800/50 transition-colors">
                <Hash className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="font-mono">Port: {service.port}</span>
              </div>
            )}
          </div>

          {service.tags && service.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {service.tags.map(tag => (
                <span key={tag.id} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-300 group-hover:border-blue-100 dark:group-hover:border-blue-800 transition-colors">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Users className="h-3 w-3" />
              <span className="font-medium">{service.team}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors mr-1"
                title="Download Details"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
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