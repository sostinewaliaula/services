export type ServiceCategory = 'Databases' | 'Application Servers' | 'HR Systems' | 'Asset Management' | 'Ticketing Systems' | 'Task Trackers' | 'Infrastructure';
export type ServiceStatus = 'Active' | 'Maintenance' | 'Deprecated';
export type ServiceEnvironment = 'Production' | 'Test' | 'Dev';
export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  status: ServiceStatus;
  environment: ServiceEnvironment;
  url?: string;
  owner: string;
  team: string;
  notes?: string;
  isFeatured: boolean;
  lastUpdated: string;
  documentation?: string;
  dashboard?: string;
}