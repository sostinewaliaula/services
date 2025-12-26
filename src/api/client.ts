import { Service, ServiceCategoryData, ServiceTypeData, Tag, EnvironmentData, TeamData } from '../types/service';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = {
    getServices: async (): Promise<Service[]> => {
        const response = await fetch(`${API_BASE_URL}/services`);
        if (!response.ok) {
            throw new Error('Failed to fetch services');
        }
        return response.json();
    },
    getCategories: async (): Promise<ServiceCategoryData[]> => {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        return response.json();
    },
    getServiceTypes: async (): Promise<ServiceTypeData[]> => {
        const response = await fetch(`${API_BASE_URL}/service-types`);
        if (!response.ok) {
            throw new Error('Failed to fetch service types');
        }
        return response.json();
    },
    getTags: async (): Promise<Tag[]> => {
        const response = await fetch(`${API_BASE_URL}/tags`);
        if (!response.ok) {
            throw new Error('Failed to fetch tags');
        }
        return response.json();
    },
    createService: async (service: Partial<Service>): Promise<{ id: string }> => {
        const response = await fetch(`${API_BASE_URL}/services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(service)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to create service');
        }
        return response.json();
    },
    updateService: async (id: string, service: Partial<Service>): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/services/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(service)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to update service');
        }
    },
    deleteService: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/services/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete service');
        }
    },
    checkUptime: async (): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/services/uptime/check`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to trigger uptime check');
        }
    },
    createCategory: async (category: { name: string }): Promise<{ id: string }> => {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        });
        if (!response.ok) {
            throw new Error('Failed to create category');
        }
        return response.json();
    },
    updateCategory: async (id: string, category: { name: string }): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(category)
        });
        if (!response.ok) {
            throw new Error('Failed to update category');
        }
    },
    deleteCategory: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete category');
        }
    },
    createServiceType: async (type: { name: string }): Promise<{ id: string }> => {
        const response = await fetch(`${API_BASE_URL}/service-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(type)
        });
        if (!response.ok) {
            throw new Error('Failed to create service type');
        }
        return response.json();
    },
    updateServiceType: async (id: string, type: { name: string }): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/service-types/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(type)
        });
        if (!response.ok) {
            throw new Error('Failed to update service type');
        }
    },
    deleteServiceType: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/service-types/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete service type');
        }
    },
    getCategoriesForType: async (serviceTypeId: string): Promise<ServiceCategoryData[]> => {
        const response = await fetch(`${API_BASE_URL}/service-types/${serviceTypeId}/categories`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories for service type');
        }
        return response.json();
    },
    getTagsForType: async (serviceTypeId: string): Promise<Tag[]> => {
        const response = await fetch(`${API_BASE_URL}/service-types/${serviceTypeId}/tags`);
        if (!response.ok) {
            throw new Error('Failed to fetch tags for service type');
        }
        return response.json();
    },
    associateCategoryWithType: async (typeId: string, categoryId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/service-types/${typeId}/categories/${categoryId}`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to associate category with type');
        }
    },
    removeCategoryFromType: async (typeId: string, categoryId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/service-types/${typeId}/categories/${categoryId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to remove category from type');
        }
    },
    associateTagWithType: async (typeId: string, tagId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/service-types/${typeId}/tags/${tagId}`, {
            method: 'POST'
        });
        if (!response.ok) {
            throw new Error('Failed to associate tag with type');
        }
    },
    removeTagFromType: async (typeId: string, tagId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/service-types/${typeId}/tags/${tagId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to remove tag from type');
        }
    },
    createTag: async (tag: { name: string }): Promise<{ id: string }> => {
        const response = await fetch(`${API_BASE_URL}/tags`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tag)
        });
        if (!response.ok) {
            throw new Error('Failed to create tag');
        }
        return response.json();
    },
    updateTag: async (id: string, tag: { name: string }): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tag)
        });
        if (!response.ok) {
            throw new Error('Failed to update tag');
        }
    },
    deleteTag: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete tag');
        }
    },
    getEnvironments: async (): Promise<EnvironmentData[]> => {
        const response = await fetch(`${API_BASE_URL}/environments`);
        if (!response.ok) {
            throw new Error('Failed to fetch environments');
        }
        return response.json();
    },
    createEnvironment: async (environment: { name: string }): Promise<{ id: string }> => {
        const response = await fetch(`${API_BASE_URL}/environments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(environment)
        });
        if (!response.ok) {
            throw new Error('Failed to create environment');
        }
        return response.json();
    },
    updateEnvironment: async (id: string, environment: { name: string }): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/environments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(environment)
        });
        if (!response.ok) {
            throw new Error('Failed to update environment');
        }
    },
    deleteEnvironment: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/environments/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete environment');
        }
    },
    getTeams: async (): Promise<TeamData[]> => {
        const response = await fetch(`${API_BASE_URL}/teams`);
        if (!response.ok) {
            throw new Error('Failed to fetch teams');
        }
        return response.json();
    },
    createTeam: async (team: { name: string }): Promise<{ id: string }> => {
        const response = await fetch(`${API_BASE_URL}/teams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(team)
        });
        if (!response.ok) {
            throw new Error('Failed to create team');
        }
        return response.json();
    },
    updateTeam: async (id: string, team: { name: string }): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(team)
        });
        if (!response.ok) {
            throw new Error('Failed to update team');
        }
    },
    deleteTeam: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error('Failed to delete team');
        }
    },
    uploadIcon: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('icon', file);
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/upload/icon`, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            throw new Error('Failed to upload icon');
        }
        return response.json();
    }
};
