export interface ServiceCategoryData {
  id: string;
  name: string;
}

export interface ServiceTypeData {
  id: string;
  name: string;
}

export interface EnvironmentData {
  id: string;
  name: string;
}

export interface TeamData {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}

export type ServiceCategory = string;
export type ServiceStatus = 'Active' | 'Maintenance' | 'Deprecated' | 'Online' | 'Offline';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  category_id?: string;
  service_type_id?: string;
  serviceTypeName?: string;
  status: ServiceStatus;
  environment: string;
  environment_id?: string;
  url: string;
  ip_address?: string;
  port?: number;
  owner: string;
  team: string;
  team_id?: string;
  notes?: string;
  isFeatured: boolean;
  lastUpdated: string;
  documentation?: string;
  dashboard?: string;
  db_connection?: string;
  db_username?: string;
  db_password?: string;
  pdb_name?: string;
  service_username?: string;
  service_password?: string;
  tags?: Tag[];
}