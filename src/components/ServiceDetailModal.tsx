import { useState } from 'react';
import { Service, ServiceCategoryData, ServiceTypeData, EnvironmentData, TeamData } from '../types/service';
import { Modal } from './ui/Modal';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { ServiceForm } from './ServiceForm';
import { useAuth } from '../context/AuthContext';
import { ServiceIcon } from './ServiceIcon';
import { ExternalLink, FileText, BarChart2, Clock, Shield, Globe, AlertTriangle, Users, Key, Database, Edit, Trash2, Tag, Copy, Check, Eye, EyeOff, Download } from 'lucide-react';
import { downloadServiceDetails } from '../utils/downloadService';

interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (id: string, data: Partial<Service>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  categories?: ServiceCategoryData[];
  serviceTypes?: ServiceTypeData[];
  environments?: EnvironmentData[];
  teams?: TeamData[];
}

export function ServiceDetailModal({
  service,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  categories = [],
  serviceTypes = [],
  environments = [],
  teams = []
}: ServiceDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showDbPassword, setShowDbPassword] = useState(false);
  const [showServicePassword, setShowServicePassword] = useState(false);
  const { isAuthenticated } = useAuth();

  if (!service) return null;

  const handleUpdate = async (data: Partial<Service>) => {
    if (!onUpdate) return;
    try {
      setIsSubmitting(true);
      await onUpdate(service.id, data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating service:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (window.confirm(`Are you sure you want to delete ${service.name}?`)) {
      try {
        await onDelete(service.id);
        onClose();
      } catch (err) {
        console.error('Error deleting service:', err);
      }
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const CopyButton = ({ text, field }: { text: string, field: string }) => (
    <button
      onClick={() => handleCopy(text, field)}
      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ml-2"
      title="Copy to clipboard"
    >
      {copiedField === field ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
    </button>
  );

  const handleDownload = () => {
    if (!service) return;
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsEditing(false);
        onClose();
      }}
      title={isEditing ? 'Edit Service' : 'Service Details'}
      maxWidth="3xl"
      noPadding
    >
      {isEditing ? (
        <ServiceForm
          initialData={service}
          categories={categories}
          serviceTypes={serviceTypes}
          environments={environments}
          teams={teams}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={isSubmitting}
        />
      ) : (
        <div className="p-6 space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <ServiceIcon
                name={service.name}
                category={service.category}
                logoUrl={service.logo_url}
                size="lg"
                className="shadow-md"
              />
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{service.name}</h2>
                  {service.url ? (
                    <Badge variant={getStatusVariant(service.status)}>{service.status}</Badge>
                  ) : (
                    <Badge variant="neutral">No URL</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded flex items-center gap-1 border border-blue-100 dark:border-blue-900/30 uppercase tracking-wider">
                    <Tag className="h-3 w-3" /> {service.serviceTypeName || 'Generic'}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {service.category}
                  </span>
                </div>

                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.tags.map(tag => (
                      <span key={tag.id} className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {onUpdate && isAuthenticated && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && isAuthenticated && (
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            {service.url && (
              <a href={service.url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                <Button className="w-full sm:w-auto gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Launch Service
                </Button>
              </a>
            )}
            {service.documentation && (
              <a href={service.documentation} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                <Button variant="secondary" className="w-full sm:w-auto gap-2">
                  <FileText className="h-4 w-4" />
                  Documentation
                </Button>
              </a>
            )}
            {service.dashboard && (
              <a href={service.dashboard} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none">
                <Button variant="outline" className="w-full sm:w-auto gap-2">
                  <BarChart2 className="h-4 w-4" />
                  Metrics
                </Button>
              </a>
            )}
            <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Globe className="h-4 w-4" /> Environment
              </div>
              <div className="text-slate-900 dark:text-white font-medium">{service.environment}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Shield className="h-4 w-4" /> Category
              </div>
              <div className="text-slate-900 dark:text-white font-medium">{service.category}</div>
            </div>


            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Users className="h-4 w-4" /> Team
              </div>
              <div className="text-slate-900 dark:text-white font-medium">{service.team}</div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <Globe className="h-4 w-4" /> IP Address
              </div>
              <div className="text-slate-900 dark:text-white font-medium font-mono text-sm">
                {service.ip_address || 'N/A'}{service.port ? `:${service.port}` : ''}
              </div>
            </div>
          </div>

          {/* Infrastructure & Login Info Section */}
          {(service.db_connection || service.service_username || service.service_password) && (
            <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-4">
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider flex items-center gap-2">
                <Key className="h-4 w-4" /> Access & Database Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.db_connection && (
                  <div className="sm:col-span-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                      <Database className="h-3 w-3" /> Database Connection
                    </div>
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 border border-blue-100 dark:border-blue-900/50 rounded">
                      <div className="text-slate-900 dark:text-slate-200 font-mono text-xs break-all">
                        {service.db_connection}
                      </div>
                      <CopyButton text={service.db_connection} field="db_connection" />
                    </div>
                  </div>
                )}

                {service.pdb_name && (
                  <div className="sm:col-span-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                      <Database className="h-3 w-3" /> PDB Name
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-slate-900 dark:text-slate-200 font-medium text-sm">
                        {service.pdb_name}
                      </div>
                      <CopyButton text={service.pdb_name} field="pdb_name" />
                    </div>
                  </div>
                )}

                {service.db_username && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-blue-600">DB Username</div>
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-1.5 border border-blue-50 dark:border-blue-900/30 rounded">
                      <div className="text-slate-900 dark:text-slate-200 font-mono text-xs">{service.db_username}</div>
                      <CopyButton text={service.db_username} field="db_username" />
                    </div>
                  </div>
                )}

                {service.db_password && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-blue-600">DB Password</div>
                    <div className="flex items-center justify-between bg-slate-900 px-2 py-0.5 rounded w-full">
                      <div className="text-slate-300 font-mono text-xs">
                        {showDbPassword ? service.db_password : '••••••••'}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowDbPassword(!showDbPassword)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                          title={showDbPassword ? "Hide password" : "Show password"}
                        >
                          {showDbPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                        <button
                          onClick={() => handleCopy(service.db_password!, 'db_password')}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedField === 'db_password' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {service.service_username && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-blue-600">Service Username</div>
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-1.5 border border-blue-50 dark:border-blue-900/30 rounded">
                      <div className="text-slate-900 dark:text-slate-200 font-mono text-xs">{service.service_username}</div>
                      <CopyButton text={service.service_username} field="service_username" />
                    </div>
                  </div>
                )}

                {service.service_password && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-blue-600">Service Password</div>
                    <div className="flex items-center justify-between bg-slate-900 px-2 py-0.5 rounded w-full">
                      <div className="text-slate-300 font-mono text-xs">
                        {showServicePassword ? service.service_password : '••••••••'}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setShowServicePassword(!showServicePassword)}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                          title={showServicePassword ? "Hide password" : "Show password"}
                        >
                          {showServicePassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                        <button
                          onClick={() => handleCopy(service.service_password!, 'service_password')}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedField === 'service_password' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {service.notes && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">Important Notes</h4>
                  <p className="text-sm text-amber-800 dark:text-amber-300">{service.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Clock className="h-3 w-3" />
            <span>Last updated: {new Date(service.lastUpdated).toLocaleDateString()}</span>
            <span className="mx-1">•</span>
            <span>ID: {service.id}</span>
          </div>
        </div>
      )}
    </Modal>
  );
}