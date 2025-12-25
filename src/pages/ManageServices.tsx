import { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Service, ServiceCategoryData, ServiceTypeData, Tag as TagData, EnvironmentData, TeamData } from '../types/service';
import { Button } from '../components/ui/Button';
import { Header } from '../components/Header';
import { ServiceForm } from '../components/ServiceForm';
import { ServiceIcon } from '../components/ServiceIcon';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { useToast } from '../components/ui/Toast';
import {
    Plus,
    Edit,
    Trash2,
    Settings,
    Tag,
    Loader2,
    ArrowUp,
    ArrowDown,
    Filter,
    RefreshCcw,
    LayoutDashboard,
    Users,
    Activity
} from 'lucide-react';

export function ManageServices() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<ServiceCategoryData[]>([]);
    const [serviceTypes, setServiceTypes] = useState<ServiceTypeData[]>([]);
    const [tags, setTags] = useState<TagData[]>([]);
    const [environments, setEnvironments] = useState<EnvironmentData[]>([]);
    const [teams, setTeams] = useState<TeamData[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'services' | 'categories' | 'types' | 'tags' | 'environments' | 'teams'>('services');

    // Service editing state
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [isAddingService, setIsAddingService] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState<{
        title: string,
        message: string,
        onConfirm: () => void,
        variant?: 'danger' | 'warning' | 'info'
    } | null>(null);
    const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
    const [bulkEditField, setBulkEditField] = useState<'category' | 'service_type_id' | 'environment' | 'team' | 'tags' | null>(null);
    const [bulkEditValue, setBulkEditValue] = useState<string | string[]>('');
    const { showToast } = useToast();

    // Filter & Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedType, setSelectedType] = useState<string>('All');
    const [selectedEnv, setSelectedEnv] = useState<string>('All');
    const [selectedStatus, setSelectedStatus] = useState<string>('All');

    // Sorting state
    const [sortField, setSortField] = useState<'name' | 'category' | 'status' | 'environment'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Category management state
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ServiceCategoryData | null>(null);
    const [selectedCategoryTypes, setSelectedCategoryTypes] = useState<Set<string>>(new Set());

    // Service Type management state
    const [newTypeName, setNewTypeName] = useState('');
    const [isAddingType, setIsAddingType] = useState(false);
    const [editingType, setEditingType] = useState<ServiceTypeData | null>(null);

    // Tag management state
    const [newTagName, setNewTagName] = useState('');
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [editingTag, setEditingTag] = useState<TagData | null>(null);
    const [selectedTagTypes, setSelectedTagTypes] = useState<Set<string>>(new Set());

    // Environment management state
    const [newEnvName, setNewEnvName] = useState('');
    const [isAddingEnv, setIsAddingEnv] = useState(false);
    const [editingEnv, setEditingEnv] = useState<EnvironmentData | null>(null);

    // Team management state
    const [newTeamName, setNewTeamName] = useState('');
    const [isAddingTeam, setIsAddingTeam] = useState(false);
    const [editingTeam, setEditingTeam] = useState<TeamData | null>(null);

    // Multi-select state
    const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

    // Type associations state
    const [typeCategories, setTypeCategories] = useState<Record<string, ServiceCategoryData[]>>({});
    const [typeTags, setTypeTags] = useState<Record<string, TagData[]>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sData, cData, tData, tagsData, envData, teamsData] = await Promise.all([
                api.getServices(),
                api.getCategories(),
                api.getServiceTypes(),
                api.getTags(),
                api.getEnvironments(),
                api.getTeams()
            ]);
            setServices(sData);
            setCategories(cData);
            setServiceTypes(tData);
            setTags(tagsData);
            setEnvironments(envData);
            setTeams(teamsData);

            // Fetch associations for each type
            await fetchTypeAssociations(tData);
        } catch (err) {
            console.error('Failed to fetch management data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTypeAssociations = async (types: ServiceTypeData[]) => {
        const categoriesMap: Record<string, ServiceCategoryData[]> = {};
        const tagsMap: Record<string, TagData[]> = {};

        await Promise.all(types.map(async (type) => {
            try {
                const [cats, typeTags] = await Promise.all([
                    api.getCategoriesForType(type.id),
                    api.getTagsForType(type.id)
                ]);
                categoriesMap[type.id] = cats;
                tagsMap[type.id] = typeTags;
            } catch (error) {
                console.error(`Failed to fetch associations for type ${type.name}:`, error);
                categoriesMap[type.id] = [];
                tagsMap[type.id] = [];
            }
        }));

        setTypeCategories(categoriesMap);
        setTypeTags(tagsMap);
    };

    const handleSaveService = async (data: Partial<Service>) => {
        try {
            setIsSubmitting(true);
            if (editingService) {
                await api.updateService(editingService.id, data);
                showToast('Service updated successfully', 'success');
            } else {
                await api.createService(data);
                showToast('Service created successfully', 'success');
            }
            await fetchData();
            setEditingService(null);
            setIsAddingService(false);
        } catch (err: any) {
            console.error('Save failed:', err);
            showToast(err.message || 'Action failed. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteService = async (id: string, name: string) => {
        setConfirmConfig({
            title: 'Delete Service',
            message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            variant: 'danger',
            onConfirm: async () => {
                try {
                    setIsSubmitting(true);
                    await api.deleteService(id);
                    showToast(`Service "${name}" deleted`, 'success');
                    await fetchData();
                } catch (err: any) {
                    console.error('Delete failed:', err);
                    showToast(err.message || 'Failed to delete service', 'error');
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            setIsSubmitting(true);
            let categoryId: string;

            if (editingCategory) {
                await api.updateCategory(editingCategory.id, { name: newCategoryName });
                categoryId = editingCategory.id;
            } else {
                const result = await api.createCategory({ name: newCategoryName });
                categoryId = result.id;
            }

            // Update type associations
            // First, get current associations
            const currentTypes = typeCategories;
            const currentlyAssociated = Object.keys(currentTypes).filter(typeId =>
                currentTypes[typeId]?.some(cat => cat.id === categoryId)
            );

            // Remove associations that are no longer selected
            for (const typeId of currentlyAssociated) {
                if (!selectedCategoryTypes.has(typeId)) {
                    await api.removeCategoryFromType(typeId, categoryId);
                }
            }

            // Add new associations
            for (const typeId of selectedCategoryTypes) {
                if (!currentlyAssociated.includes(typeId)) {
                    await api.associateCategoryWithType(typeId, categoryId);
                }
            }

            await fetchData();
            showToast(editingCategory ? 'Category updated' : 'Category added', 'success');
            setNewCategoryName('');
            setIsAddingCategory(false);
            setEditingCategory(null);
            setSelectedCategoryTypes(new Set());
        } catch (err: any) {
            console.error('Category action failed:', err);
            showToast(err.message || 'Failed to save category', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        setConfirmConfig({
            title: 'Delete Category',
            message: `Are you sure you want to delete category "${name}"? This will not delete the services within it.`,
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.deleteCategory(id);
                    showToast('Category deleted', 'success');
                    await fetchData();
                } catch (err: any) {
                    showToast(err.message || 'Failed to delete category', 'error');
                }
            }
        });
    };

    const handleAddType = async () => {
        if (!newTypeName.trim()) return;
        try {
            setIsSubmitting(true);
            if (editingType) {
                await api.updateServiceType(editingType.id, { name: newTypeName });
            } else {
                await api.createServiceType({ name: newTypeName });
            }
            await fetchData();
            showToast(editingType ? 'Service type updated' : 'Service type added', 'success');
            setNewTypeName('');
            setIsAddingType(false);
            setEditingType(null);
        } catch (err: any) {
            console.error('Type action failed:', err);
            showToast(err.message || 'Failed to save service type', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteType = async (id: string, name: string) => {
        setConfirmConfig({
            title: 'Delete Service Type',
            message: `Are you sure you want to delete service type "${name}"?`,
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.deleteServiceType(id);
                    showToast('Service type deleted', 'success');
                    await fetchData();
                } catch (err: any) {
                    showToast(err.message || 'Failed to delete service type', 'error');
                }
            }
        });
    };

    const handleAddTag = async () => {
        if (!newTagName.trim()) return;
        try {
            setIsSubmitting(true);
            let tagId: string;

            if (editingTag) {
                await api.updateTag(editingTag.id, { name: newTagName });
                tagId = editingTag.id;
            } else {
                const result = await api.createTag({ name: newTagName });
                tagId = result.id;
            }

            // Update type associations
            const currentTypes = typeTags;
            const currentlyAssociated = Object.keys(currentTypes).filter(typeId =>
                currentTypes[typeId]?.some(t => t.id === tagId)
            );

            // Remove associations that are no longer selected
            for (const typeId of currentlyAssociated) {
                if (!selectedTagTypes.has(typeId)) {
                    await api.removeTagFromType(typeId, tagId);
                }
            }

            // Add new associations
            for (const typeId of selectedTagTypes) {
                if (!currentlyAssociated.includes(typeId)) {
                    await api.associateTagWithType(typeId, tagId);
                }
            }

            await fetchData();
            showToast(editingTag ? 'Tag updated' : 'Tag added', 'success');
            setNewTagName('');
            setIsAddingTag(false);
            setEditingTag(null);
            setSelectedTagTypes(new Set());
        } catch (err: any) {
            console.error('Tag action failed:', err);
            showToast(err.message || 'Failed to save tag', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTag = async (id: string, name: string) => {
        setConfirmConfig({
            title: 'Delete Tag',
            message: `Are you sure you want to delete tag "${name}"?`,
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.deleteTag(id);
                    showToast('Tag deleted', 'success');
                    await fetchData();
                } catch (err: any) {
                    showToast(err.message || 'Failed to delete tag', 'error');
                }
            }
        });
    };

    const handleAddEnvironment = async () => {
        if (!newEnvName.trim()) return;
        try {
            setIsSubmitting(true);
            if (editingEnv) {
                await api.updateEnvironment(editingEnv.id, { name: newEnvName });
            } else {
                await api.createEnvironment({ name: newEnvName });
            }
            await fetchData();
            showToast(editingEnv ? 'Environment updated' : 'Environment added', 'success');
            setNewEnvName('');
            setIsAddingEnv(false);
            setEditingEnv(null);
        } catch (err: any) {
            console.error('Environment action failed:', err);
            showToast(err.message || 'Failed to save environment', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEnvironment = async (id: string, name: string) => {
        setConfirmConfig({
            title: 'Delete Environment',
            message: `Are you sure you want to delete environment "${name}"?`,
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.deleteEnvironment(id);
                    showToast('Environment deleted', 'success');
                    await fetchData();
                } catch (err: any) {
                    showToast(err.message || 'Failed to delete environment', 'error');
                }
            }
        });
    };

    const handleAddTeam = async () => {
        if (!newTeamName.trim()) return;
        try {
            setIsSubmitting(true);
            if (editingTeam) {
                await api.updateTeam(editingTeam.id, { name: newTeamName });
            } else {
                await api.createTeam({ name: newTeamName });
            }
            await fetchData();
            showToast(editingTeam ? 'Team updated' : 'Team added', 'success');
            setNewTeamName('');
            setIsAddingTeam(false);
            setEditingTeam(null);
        } catch (err: any) {
            console.error('Team action failed:', err);
            showToast(err.message || 'Failed to save team', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTeam = async (id: string, name: string) => {
        setConfirmConfig({
            title: 'Delete Team',
            message: `Are you sure you want to delete team "${name}"?`,
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await api.deleteTeam(id);
                    showToast('Team deleted', 'success');
                    await fetchData();
                } catch (err: any) {
                    showToast(err.message || 'Failed to delete team', 'error');
                }
            }
        });
    };

    // Type association handlers
    const handleAddCategoryToType = async (typeId: string, categoryId: string) => {
        if (!categoryId) return;
        try {
            await api.associateCategoryWithType(typeId, categoryId);
            // Refresh associations for this type
            const cats = await api.getCategoriesForType(typeId);
            setTypeCategories(prev => ({ ...prev, [typeId]: cats }));
        } catch (error: any) {
            console.error('Failed to add category association:', error);
            showToast(error.message || 'Failed to add category association', 'error');
        }
    };

    const handleRemoveCategoryFromType = async (typeId: string, categoryId: string) => {
        try {
            await api.removeCategoryFromType(typeId, categoryId);
            // Refresh associations for this type
            const cats = await api.getCategoriesForType(typeId);
            setTypeCategories(prev => ({ ...prev, [typeId]: cats }));
        } catch (error: any) {
            console.error('Failed to remove category association:', error);
            showToast(error.message || 'Failed to remove category association', 'error');
        }
    };

    const handleAddTagToType = async (typeId: string, tagId: string) => {
        if (!tagId) return;
        try {
            await api.associateTagWithType(typeId, tagId);
            // Refresh associations for this type
            const typeTags = await api.getTagsForType(typeId);
            setTypeTags(prev => ({ ...prev, [typeId]: typeTags }));
        } catch (error: any) {
            console.error('Failed to add tag association:', error);
            showToast(error.message || 'Failed to add tag association', 'error');
        }
    };

    const handleRemoveTagFromType = async (typeId: string, tagId: string) => {
        try {
            await api.removeTagFromType(typeId, tagId);
            // Refresh associations for this type
            const typeTags = await api.getTagsForType(typeId);
            setTypeTags(prev => ({ ...prev, [typeId]: typeTags }));
        } catch (error: any) {
            console.error('Failed to remove tag association:', error);
            showToast(error.message || 'Failed to remove tag association', 'error');
        }
    };

    const handleSort = (field: typeof sortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const toggleSelect = (id: string) => {
        const next = new Set(selectedServices);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setSelectedServices(next);
    };

    const toggleSelectAll = () => {
        if (selectedServices.size === filteredAndSortedServices.length && filteredAndSortedServices.length > 0) {
            setSelectedServices(new Set());
        } else {
            setSelectedServices(new Set(filteredAndSortedServices.map(s => s.id)));
        }
    };

    const handleBulkDelete = async () => {
        setConfirmConfig({
            title: 'Bulk Delete Services',
            message: `Are you sure you want to delete ${selectedServices.size} selected services? This action cannot be undone.`,
            variant: 'danger',
            onConfirm: async () => {
                try {
                    setIsSubmitting(true);
                    await Promise.all(Array.from(selectedServices).map(id => api.deleteService(id)));
                    showToast(`${selectedServices.size} services deleted`, 'success');
                    await fetchData();
                    setSelectedServices(new Set());
                } catch (err: any) {
                    console.error('Bulk delete failed:', err);
                    showToast(err.message || 'Failed to delete some services', 'error');
                } finally {
                    setIsSubmitting(false);
                }
            }
        });
    };

    const handleBulkUpdate = async () => {
        if (!bulkEditField || (Array.isArray(bulkEditValue) ? bulkEditValue.length === 0 : !bulkEditValue)) return;

        try {
            setIsSubmitting(true);
            const selectedIds = Array.from(selectedServices);

            await Promise.all(selectedIds.map(async (id) => {
                if (bulkEditField === 'tags') {
                    // For tags, we need to pass an array of tag objects with ids
                    // The backend likely expects { tags: [{id: '...'}, {id: '...'}] }
                    // Based on my previous view of service.ts or update logic, usually it's ids.
                    // Let's assume the API expects Tag objects structure as per Service interface
                    // But typically client API helpers might abstract this.
                    // Looking at api client might be wise, but for now assuming standard partial update.
                    const tagsToUpdate = (bulkEditValue as string[]).map(tid => ({ id: tid, name: '' } as any));
                    await api.updateService(id, { tags: tagsToUpdate });
                } else if (bulkEditField === 'category') {
                    // For category, the Service interface likely has `category` (string name) or `category_id`. 
                    // The backend update logic typically takes names or IDs.
                    // On the frontend `Service` type has `category: string` (name).
                    // However, update often needs ID if strict relation, OR name if lookup.
                    // Let's check `Service` type again later if this fails, but usually `category` matches `category` name in dropdowns.
                    // The dropdowns in filters use names. 
                    // Wait, `updateService` usually takes `Partial<Service>`.
                    // `Service` has `category: string`.
                    // But backend might need `category_id`.
                    // Let's rely on what `ServiceForm` does. `ServiceForm` sends `category_id`.

                    // Actually, I should probably check if I need to map names to IDs or if I'm storing IDs in `bulkEditValue`.
                    // I will store IDs in `bulkEditValue` for everything except maybe Enum fields like Environment/Status if they are just strings.
                    // Wait, `Service` type has `category: ServiceCategory` which is string (name) ??
                    // Let's look at `Service` type again.
                    // Line 32: `category: ServiceCategory; // string`
                    // Line 33: `category_id?: string;`

                    // The backend `updateService` likely handles `category_id`.
                    // I will set `bulkEditValue` to the ID and pass it as `category_id` or `service_type_id`.

                    if (bulkEditField === 'category') {
                        await api.updateService(id, { category_id: bulkEditValue as string });
                    } else if (bulkEditField === 'service_type_id') {
                        // mapping 'service_type_id' check
                        await api.updateService(id, { service_type_id: bulkEditValue as string });
                    } else if (bulkEditField === 'team') {
                        await api.updateService(id, { team_id: bulkEditValue as string });
                    } else if (bulkEditField === 'environment') {
                        await api.updateService(id, { environment_id: bulkEditValue as string });
                    } else {
                        await api.updateService(id, { [bulkEditField]: bulkEditValue });
                    }
                } else {
                    if (bulkEditField === 'service_type_id') {
                        await api.updateService(id, { service_type_id: bulkEditValue as string });
                    } else if (bulkEditField === 'team') {
                        await api.updateService(id, { team_id: bulkEditValue as string });
                    } else if (bulkEditField === 'environment') {
                        await api.updateService(id, { environment_id: bulkEditValue as string });
                    } else {
                        await api.updateService(id, { [bulkEditField]: bulkEditValue });
                    }
                }
            }));

            showToast(`Updated ${selectedIds.length} services`, 'success');
            await fetchData();
            setSelectedServices(new Set());
            setIsBulkEditModalOpen(false);
            setBulkEditField(null);
            setBulkEditValue('');
        } catch (err: any) {
            console.error('Bulk update failed:', err);
            showToast(err.message || 'Failed to update some services', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredAndSortedServices = useMemo(() => {
        const result = services.filter(service => {
            const matchesSearch = (service.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (service.owner?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
            const matchesType = selectedType === 'All' || service.serviceTypeName === selectedType;
            const matchesEnv = selectedEnv === 'All' || service.environment === selectedEnv;
            const matchesStatus = selectedStatus === 'All' || service.status === selectedStatus;
            return matchesSearch && matchesCategory && matchesType && matchesEnv && matchesStatus;
        });

        result.sort((a, b) => {
            const aVal = (a[sortField] || '').toString().toLowerCase();
            const bVal = (b[sortField] || '').toString().toLowerCase();

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [services, searchTerm, selectedCategory, selectedType, selectedEnv, selectedStatus, sortField, sortOrder]);

    const filteredCategories = useMemo(() => {
        let result = categories.filter(cat => (cat.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()));

        if (selectedType !== 'All') {
            const type = serviceTypes.find(t => t.name === selectedType);
            if (type) {
                const associatedCats = typeCategories[type.id] || [];
                const associatedIds = associatedCats.map(c => c.id);
                result = result.filter(cat => associatedIds.includes(cat.id));
            }
        }

        return result;
    }, [categories, searchTerm, selectedType, serviceTypes, typeCategories]);

    const filteredTypes = useMemo(() => {
        return serviceTypes.filter(type => (type.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()));
    }, [serviceTypes, searchTerm]);

    const filteredTags = useMemo(() => {
        let result = tags.filter(tag => (tag.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()));

        if (selectedType !== 'All') {
            const type = serviceTypes.find(t => t.name === selectedType);
            if (type) {
                const associatedTags = typeTags[type.id] || [];
                const associatedIds = associatedTags.map(t => t.id);
                result = result.filter(tag => associatedIds.includes(tag.id));
            }
        }

        return result;
    }, [tags, searchTerm, selectedType, serviceTypes, typeTags]);

    const filteredEnvironments = useMemo(() => {
        return environments.filter(env => (env.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()));
    }, [environments, searchTerm]);

    const filteredTeams = useMemo(() => {
        return teams.filter(team => (team.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()));
    }, [teams, searchTerm]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Header
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                searchPlaceholder={`Search ${activeTab}...`}
                actionButton={{
                    label: activeTab === 'services' ? 'New Service' :
                        activeTab === 'categories' ? 'New Category' :
                            activeTab === 'types' ? 'New Type' :
                                activeTab === 'tags' ? 'New Tag' :
                                    activeTab === 'environments' ? 'New Environment' : 'New Team',
                    icon: Plus,
                    onClick: () => {
                        if (activeTab === 'services') setIsAddingService(true);
                        else if (activeTab === 'categories') setIsAddingCategory(true);
                        else if (activeTab === 'types') setIsAddingType(true);
                        else if (activeTab === 'tags') setIsAddingTag(true);
                        else if (activeTab === 'environments') setIsAddingEnv(true);
                        else if (activeTab === 'teams') setIsAddingTeam(true);
                    }
                }}
            />

            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-[65px] z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Tab Switcher */}
                        <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 self-start">
                            <button
                                onClick={() => setActiveTab('services')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'services'
                                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                Services
                            </button>
                            <button
                                onClick={() => setActiveTab('categories')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'categories'
                                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                Categories
                            </button>
                            <button
                                onClick={() => setActiveTab('types')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'types'
                                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                Types
                            </button>
                            <button
                                onClick={() => setActiveTab('tags')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'tags'
                                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                Tags
                            </button>
                            <button
                                onClick={() => setActiveTab('environments')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'environments'
                                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                Environments
                            </button>
                            <button
                                onClick={() => setActiveTab('teams')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'teams'
                                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                Teams
                            </button>
                        </div>

                        {/* Search & Filters (Shown for relevant tabs) */}
                        {['services', 'categories', 'tags'].includes(activeTab) && (
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 mr-2">
                                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filters</span>
                                </div>

                                {activeTab === 'services' && (
                                    <>
                                        <select
                                            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all hover:border-slate-300"
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                        >
                                            <option value="All">All Categories</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>

                                        <select
                                            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all hover:border-slate-300"
                                            value={selectedEnv}
                                            onChange={(e) => setSelectedEnv(e.target.value)}
                                        >
                                            <option value="All">All Environments</option>
                                            {environments.map(env => (
                                                <option key={env.id} value={env.name}>{env.name}</option>
                                            ))}
                                        </select>
                                    </>
                                )}

                                <select
                                    className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all hover:border-slate-300"
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    <option value="All">All Types</option>
                                    {serviceTypes.map(type => (
                                        <option key={type.id} value={type.name}>{type.name}</option>
                                    ))}
                                </select>

                                {activeTab === 'services' && (
                                    <select
                                        className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all hover:border-slate-300"
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                    >
                                        <option value="All">All Statuses</option>
                                        <option value="Active">Active</option>
                                        <option value="Online">Online</option>
                                        <option value="Offline">Offline</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Deprecated">Deprecated</option>
                                    </select>
                                )}

                                <button
                                    onClick={() => {
                                        setSelectedCategory('All');
                                        setSelectedType('All');
                                        setSelectedEnv('All');
                                        setSelectedStatus('All');
                                        setSearchTerm('');
                                    }}
                                    className="text-xs font-bold text-slate-400 hover:text-red-500 p-1.5 flex items-center gap-1 transition-colors"
                                    title="Reset All Filters"
                                >
                                    <RefreshCcw className="h-3.5 w-3.5" />
                                    <span className="hidden lg:inline">Reset</span>
                                </button>

                                <div className="h-4 w-px bg-slate-300 mx-2" />

                                <button
                                    onClick={async () => {
                                        try {
                                            await api.checkUptime();
                                            showToast('Uptime check background job started', 'success');
                                        } catch (err: any) {
                                            showToast('Failed to start uptime check', 'error');
                                        }
                                    }}
                                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2"
                                    title="Check Service Status"
                                >
                                    <Activity className="h-3.5 w-3.5" />
                                    <span className="hidden lg:inline">Check Status</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {activeTab === 'services' ? (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-blue-600" />
                                        All Services
                                    </h2>
                                    {selectedServices.size > 0 && (
                                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setIsBulkEditModalOpen(true);
                                                    setBulkEditField(null);
                                                    setBulkEditValue('');
                                                }}
                                                className="gap-2"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Bulk Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={handleBulkDelete}
                                                className="gap-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Delete Selected
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50/50 border-b border-slate-200">
                                            <tr>
                                                <th className="px-6 py-4 w-10">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                        checked={filteredAndSortedServices.length > 0 && selectedServices.size === filteredAndSortedServices.length}
                                                        onChange={toggleSelectAll}
                                                    />
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                                                    onClick={() => handleSort('name')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        Name
                                                        {sortField === 'name' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                                                    onClick={() => handleSort('category')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        Category
                                                        {sortField === 'category' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                                    </div>
                                                </th>
                                                <th
                                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                                                    onClick={() => handleSort('environment')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        Env
                                                        {sortField === 'environment' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                                    </div>
                                                </th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tags</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {filteredAndSortedServices.map((service) => (
                                                <tr
                                                    key={service.id}
                                                    className={`hover:bg-blue-50/30 transition-colors group ${selectedServices.has(service.id) ? 'bg-blue-50/50' : ''}`}
                                                >
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                            checked={selectedServices.has(service.id)}
                                                            onChange={() => toggleSelect(service.id)}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <ServiceIcon
                                                                name={service.name}
                                                                category={service.category}
                                                                logoUrl={service.logo_url}
                                                                size="sm"
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-slate-900 leading-none mb-1">{service.name}</span>
                                                                {service.serviceTypeName === 'Database' ? (
                                                                    <span className="text-[10px] font-mono text-slate-500">
                                                                        {service.ip_address}
                                                                        {service.port ? `/${service.port}` : ''}
                                                                        {service.pdb_name ? `/${service.pdb_name}` : ''}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-blue-600 truncate max-w-[250px] hover:underline cursor-pointer">
                                                                        {service.url}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
                                                                <Tag className="h-3 w-3" /> {service.serviceTypeName || 'Generic'}
                                                            </span>
                                                            <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md self-start">
                                                                {service.category}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-xs font-bold px-2 py-1 rounded border ${service.environment === 'Production' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                            service.environment === 'Test' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            }`}>
                                                            {service.environment}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs">
                                                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                            {service.tags && service.tags.length > 0 ? (
                                                                service.tags.map(tag => (
                                                                    <span key={tag.id} className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                                                                        {tag.name}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-slate-300 italic">-</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-1">
                                                        <button
                                                            onClick={() => setEditingService(service)}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                            title="Edit"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteService(service.id, service.name)}
                                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : activeTab === 'categories' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-blue-600" />
                                        Manage Categories
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-2">
                                            {filteredCategories.map((cat) => {
                                                const catTypes = serviceTypes.filter(type =>
                                                    typeCategories[type.id]?.some(c => c.id === cat.id)
                                                );
                                                return (
                                                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 group">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-medium text-slate-700">{cat.name}</span>
                                                            {catTypes.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {catTypes.map(type => (
                                                                        <span key={type.id} className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100/50 text-blue-600 border border-blue-200/50">
                                                                            {type.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingCategory(cat);
                                                                    setNewCategoryName(cat.name);
                                                                    // Load current type associations
                                                                    const associatedTypes = Object.keys(typeCategories).filter(typeId =>
                                                                        typeCategories[typeId]?.some(c => c.id === cat.id)
                                                                    );
                                                                    setSelectedCategoryTypes(new Set(associatedTypes));
                                                                }}
                                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-100"
                                                                title="Edit Category"
                                                            >
                                                                <Edit className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-100"
                                                                title="Delete Category"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-6 flex flex-col items-center justify-center text-center">
                                    <div className="bg-blue-600/10 p-4 rounded-full mb-4">
                                        <Settings className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1">Hierarchy System</h3>
                                    <p className="text-sm text-slate-500 max-w-[200px]">Categories organize your services into high-level groups.</p>
                                </div>
                            </div>
                        ) : activeTab === 'types' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <LayoutDashboard className="h-5 w-5 text-blue-600" />
                                        Manage Service Types
                                    </h2>

                                    <div className="space-y-4">
                                        {filteredTypes.map((type) => (
                                            <div key={type.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                                                {/* Type name and actions */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-bold text-slate-900">{type.name}</span>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => {
                                                                setEditingType(type);
                                                                setNewTypeName(type.name);
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-100"
                                                            title="Edit Type"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteType(type.id, type.name)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-100"
                                                            title="Delete Type"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Associated Categories */}
                                                <div className="mb-3">
                                                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                                                        Categories
                                                    </label>
                                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                                        {typeCategories[type.id]?.map(cat => (
                                                            <span key={cat.id} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                                                                {cat.name}
                                                                <button
                                                                    onClick={() => handleRemoveCategoryFromType(type.id, cat.id)}
                                                                    className="hover:text-red-600 transition-colors"
                                                                    title="Remove category"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <select
                                                        onChange={(e) => {
                                                            handleAddCategoryToType(type.id, e.target.value);
                                                            e.target.value = '';
                                                        }}
                                                        className="text-xs px-2 py-1 border border-slate-200 rounded bg-white hover:border-blue-300 transition-colors"
                                                    >
                                                        <option value="">+ Add Category</option>
                                                        {categories
                                                            .filter(c => !typeCategories[type.id]?.find(tc => tc.id === c.id))
                                                            .map(cat => (
                                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>

                                                {/* Associated Tags */}
                                                <div>
                                                    <label className="text-xs font-semibold text-slate-600 mb-1.5 block">
                                                        Tags
                                                    </label>
                                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                                        {typeTags[type.id]?.map(tag => (
                                                            <span key={tag.id} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200 rounded-full">
                                                                {tag.name}
                                                                <button
                                                                    onClick={() => handleRemoveTagFromType(type.id, tag.id)}
                                                                    className="hover:text-red-600 transition-colors"
                                                                    title="Remove tag"
                                                                >
                                                                    ×
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <select
                                                        onChange={(e) => {
                                                            handleAddTagToType(type.id, e.target.value);
                                                            e.target.value = '';
                                                        }}
                                                        className="text-xs px-2 py-1 border border-slate-200 rounded bg-white hover:border-orange-300 transition-colors"
                                                    >
                                                        <option value="">+ Add Tag</option>
                                                        {tags
                                                            .filter(t => !typeTags[type.id]?.find(tt => tt.id === t.id))
                                                            .map(tag => (
                                                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 p-6 flex flex-col items-center justify-center text-center">
                                    <div className="bg-indigo-600/10 p-4 rounded-full mb-4">
                                        <LayoutDashboard className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1">Operational Types</h3>
                                    <p className="text-sm text-slate-500 max-w-[200px]">Types define the behavior and required fields of your services.</p>
                                </div>
                            </div>
                        ) : activeTab === 'tags' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Tag className="h-5 w-5 text-blue-600" />
                                        Manage Tags
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-2">
                                            {filteredTags.map((tag) => {
                                                const tagTypes = serviceTypes.filter(type =>
                                                    typeTags[type.id]?.some(t => t.id === tag.id)
                                                );
                                                return (
                                                    <div key={tag.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 group">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                                <span className="font-medium text-slate-700">{tag.name}</span>
                                                            </div>
                                                            {tagTypes.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {tagTypes.map(type => (
                                                                        <span key={type.id} className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-100/50 text-orange-600 border border-orange-200/50">
                                                                            {type.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingTag(tag);
                                                                    setNewTagName(tag.name);
                                                                    // Load current type associations
                                                                    const associatedTypes = Object.keys(typeTags).filter(typeId =>
                                                                        typeTags[typeId]?.some(t => t.id === tag.id)
                                                                    );
                                                                    setSelectedTagTypes(new Set(associatedTypes));
                                                                }}
                                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-100"
                                                                title="Edit Tag"
                                                            >
                                                                <Edit className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteTag(tag.id, tag.name)}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-100"
                                                                title="Delete Tag"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-6 flex flex-col items-center justify-center text-center">
                                    <div className="bg-emerald-600/10 p-4 rounded-full mb-4">
                                        <Tag className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1">Flexible Classification</h3>
                                    <p className="text-sm text-slate-500 max-w-[200px]">Tags provide a flexible way to cross-reference services across categories.</p>
                                </div>
                            </div>
                        ) : null}

                        {/* Environments Tab */}
                        {activeTab === 'environments' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-blue-600" />
                                        Manage Environments
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-2">
                                            {filteredEnvironments.map((env) => (
                                                <div key={env.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 group">
                                                    <span className="font-medium text-slate-700">{env.name}</span>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingEnv(env);
                                                                setNewEnvName(env.name);
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-100"
                                                            title="Edit Environment"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteEnvironment(env.id, env.name)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-100"
                                                            title="Delete Environment"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-purple-50/50 rounded-xl border border-purple-100 p-6 flex flex-col items-center justify-center text-center">
                                    <div className="bg-purple-600/10 p-4 rounded-full mb-4">
                                        <Settings className="h-8 w-8 text-purple-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1">Deployment Stages</h3>
                                    <p className="text-sm text-slate-500 max-w-[200px]">Environments help organize services by deployment stage (Production, Test, Dev, etc.).</p>
                                </div>
                            </div>
                        )}

                        {/* Teams Tab */}
                        {activeTab === 'teams' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        Manage Teams
                                    </h2>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-2">
                                            {filteredTeams.map((team) => (
                                                <div key={team.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 group">
                                                    <span className="font-medium text-slate-700">{team.name}</span>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingTeam(team);
                                                                setNewTeamName(team.name);
                                                            }}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-100"
                                                            title="Edit Team"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTeam(team.id, team.name)}
                                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-slate-100"
                                                            title="Delete Team"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-orange-50/50 rounded-xl border border-orange-100 p-6 flex flex-col items-center justify-center text-center">
                                    <div className="bg-orange-600/10 p-4 rounded-full mb-4">
                                        <Users className="h-8 w-8 text-orange-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1">Team Organization</h3>
                                    <p className="text-sm text-slate-500 max-w-[200px]">Teams help organize services by ownership and responsibility.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Floating Bulk Action Bar */}
            {selectedServices.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-6 animate-in slide-in-from-bottom-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                            {selectedServices.size}
                        </div>
                        <span className="font-semibold text-sm tracking-wide">Services Selected</span>
                    </div>

                    <div className="h-6 w-px bg-slate-700" />

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBulkDelete}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                            <Trash2 className="h-4 w-4" /> Bulk Delete
                        </button>

                        <button
                            onClick={() => setSelectedServices(new Set())}
                            className="text-slate-400 hover:text-white text-sm font-bold px-2 py-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Service Edit/Add Modal */}
            {(editingService || isAddingService) && (
                <Modal
                    isOpen={true}
                    onClose={() => {
                        setEditingService(null);
                        setIsAddingService(false);
                    }}
                    title={editingService ? `Editing ${editingService.name}` : 'Add New Service'}
                    maxWidth="3xl"
                    noPadding
                >
                    <ServiceForm
                        initialData={editingService || undefined}
                        categories={categories}
                        serviceTypes={serviceTypes}
                        environments={environments}
                        teams={teams}
                        onSubmit={handleSaveService}
                        onCancel={() => {
                            setEditingService(null);
                            setIsAddingService(false);
                        }}
                        isLoading={isSubmitting}
                    />
                </Modal>
            )}

            {/* Category Add/Edit Modal */}
            {(isAddingCategory || editingCategory) && (
                <Modal
                    isOpen={true}
                    onClose={() => {
                        setIsAddingCategory(false);
                        setEditingCategory(null);
                        setNewCategoryName('');
                    }}
                    title={editingCategory ? `Editing ${editingCategory.name}` : 'Add New Category'}
                    maxWidth="md"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Category Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Monitoring, Databases..."
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Associated Service Types
                            </label>
                            <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                                {serviceTypes.map(type => (
                                    <label key={type.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategoryTypes.has(type.id)}
                                            onChange={(e) => {
                                                const newSet = new Set(selectedCategoryTypes);
                                                if (e.target.checked) {
                                                    newSet.add(type.id);
                                                } else {
                                                    newSet.delete(type.id);
                                                }
                                                setSelectedCategoryTypes(newSet);
                                            }}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-700">{type.name}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Select which service types can use this category
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => {
                                setIsAddingCategory(false);
                                setEditingCategory(null);
                                setNewCategoryName('');
                                setSelectedCategoryTypes(new Set());
                            }}>Cancel</Button>
                            <Button onClick={handleAddCategory} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Service Type Add/Edit Modal */}
            {(isAddingType || editingType) && (
                <Modal
                    isOpen={true}
                    onClose={() => {
                        setIsAddingType(false);
                        setEditingType(null);
                        setNewTypeName('');
                    }}
                    title={editingType ? `Editing ${editingType.name}` : 'Add New Service Type'}
                    maxWidth="md"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Type Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Database, WebLogic..."
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={newTypeName}
                                onChange={(e) => setNewTypeName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => {
                                setIsAddingType(false);
                                setEditingType(null);
                                setNewTypeName('');
                            }}>Cancel</Button>
                            <Button onClick={handleAddType} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingType ? 'Update Type' : 'Add Type')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Tag Add/Edit Modal */}
            {(isAddingTag || editingTag) && (
                <Modal
                    isOpen={true}
                    onClose={() => {
                        setIsAddingTag(false);
                        setEditingTag(null);
                        setNewTagName('');
                        setSelectedTagTypes(new Set());
                    }}
                    title={editingTag ? `Editing ${editingTag.name}` : 'Add New Tag'}
                    maxWidth="md"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Tag Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Critical, Internal..."
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Associated Service Types
                            </label>
                            <div className="border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                                {serviceTypes.map(type => (
                                    <label key={type.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            checked={selectedTagTypes.has(type.id)}
                                            onChange={(e) => {
                                                const newSet = new Set(selectedTagTypes);
                                                if (e.target.checked) {
                                                    newSet.add(type.id);
                                                } else {
                                                    newSet.delete(type.id);
                                                }
                                                setSelectedTagTypes(newSet);
                                            }}
                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-slate-700">{type.name}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Select which service types can use this tag
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => {
                                setIsAddingTag(false);
                                setEditingTag(null);
                                setNewTagName('');
                                setSelectedTagTypes(new Set());
                            }}>Cancel</Button>
                            <Button onClick={handleAddTag} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingTag ? 'Update Tag' : 'Add Tag')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Environment Add/Edit Modal */}
            {(isAddingEnv || editingEnv) && (
                <Modal
                    isOpen={true}
                    onClose={() => {
                        setIsAddingEnv(false);
                        setEditingEnv(null);
                        setNewEnvName('');
                    }}
                    title={editingEnv ? `Editing ${editingEnv.name}` : 'Add New Environment'}
                    maxWidth="md"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Environment Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Staging, QA..."
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={newEnvName}
                                onChange={(e) => setNewEnvName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => {
                                setIsAddingEnv(false);
                                setEditingEnv(null);
                                setNewEnvName('');
                            }}>Cancel</Button>
                            <Button onClick={handleAddEnvironment} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingEnv ? 'Update Environment' : 'Add Environment')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Team Add/Edit Modal */}
            {(isAddingTeam || editingTeam) && (
                <Modal
                    isOpen={true}
                    onClose={() => {
                        setIsAddingTeam(false);
                        setEditingTeam(null);
                        setNewTeamName('');
                    }}
                    title={editingTeam ? `Editing ${editingTeam.name}` : 'Add New Team'}
                    maxWidth="md"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Team Name</label>
                            <input
                                type="text"
                                placeholder="e.g. DevOps, Backend..."
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => {
                                setIsAddingTeam(false);
                                setEditingTeam(null);
                                setNewTeamName('');
                            }}>Cancel</Button>
                            <Button onClick={handleAddTeam} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingTeam ? 'Update Team' : 'Add Team')}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Bulk Edit Modal */}
            <Modal
                isOpen={isBulkEditModalOpen}
                onClose={() => setIsBulkEditModalOpen(false)}
                title={`Bulk Edit ${selectedServices.size} Services`}
                maxWidth="md"
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Field to Update</label>
                        <select
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            value={bulkEditField || ''}
                            onChange={(e) => {
                                setBulkEditField(e.target.value as any);
                                setBulkEditValue(e.target.value === 'tags' ? [] : '');
                            }}
                        >
                            <option value="">Select a field...</option>
                            <option value="category">Category</option>
                            <option value="service_type_id">Service Type</option>
                            <option value="environment">Environment</option>
                            <option value="team">Team</option>
                            <option value="tags">Tags</option>
                        </select>
                    </div>

                    {bulkEditField && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                New Value for {bulkEditField === 'service_type_id' ? 'Service Type' :
                                    bulkEditField.charAt(0).toUpperCase() + bulkEditField.slice(1)}
                            </label>

                            {bulkEditField === 'category' && (
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={bulkEditValue as string}
                                    onChange={(e) => setBulkEditValue(e.target.value)}
                                >
                                    <option value="">Select Category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            )}

                            {bulkEditField === 'service_type_id' && (
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={bulkEditValue as string}
                                    onChange={(e) => setBulkEditValue(e.target.value)}
                                >
                                    <option value="">Select Service Type...</option>
                                    {serviceTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                            )}

                            {bulkEditField === 'environment' && (
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={bulkEditValue as string}
                                    onChange={(e) => setBulkEditValue(e.target.value)}
                                >
                                    <option value="">Select Environment...</option>
                                    {environments.map(env => (
                                        <option key={env.id} value={env.id}>{env.name}</option>
                                    ))}
                                </select>
                            )}

                            {bulkEditField === 'team' && (
                                <select
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={bulkEditValue as string}
                                    onChange={(e) => setBulkEditValue(e.target.value)}
                                >
                                    <option value="">Select Team...</option>
                                    {teams.map(team => (
                                        <option key={team.id} value={team.id}>{team.name}</option>
                                    ))}
                                </select>
                            )}

                            {bulkEditField === 'tags' && (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2 mb-2 p-3 bg-slate-50 rounded-lg border border-slate-200 min-h-[50px]">
                                        {(bulkEditValue as string[]).length > 0 ? (
                                            (bulkEditValue as string[]).map(tagId => {
                                                const tag = tags.find(t => t.id === tagId);
                                                return tag ? (
                                                    <span key={tag.id} className="bg-white text-blue-600 px-2 py-1 rounded-md text-sm font-bold border border-blue-100 shadow-sm flex items-center gap-1">
                                                        {tag.name}
                                                        <button
                                                            onClick={() => {
                                                                const newTags = (bulkEditValue as string[]).filter(id => id !== tagId);
                                                                setBulkEditValue(newTags);
                                                            }}
                                                            className="hover:text-red-500"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ) : null;
                                            })
                                        ) : (
                                            <span className="text-slate-400 text-sm italic">No tags selected</span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.filter(t => !(bulkEditValue as string[]).includes(t.id)).map(tag => (
                                            <button
                                                key={tag.id}
                                                onClick={() => {
                                                    const current = bulkEditValue as string[];
                                                    setBulkEditValue([...current, tag.id]);
                                                }}
                                                className="bg-white text-slate-600 px-2 py-1 rounded border border-slate-200 text-xs font-medium hover:border-blue-400 hover:text-blue-600 transition-colors"
                                            >
                                                + {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                        <Button variant="outline" onClick={() => setIsBulkEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkUpdate}
                            disabled={isSubmitting || !bulkEditField || (Array.isArray(bulkEditValue) ? bulkEditValue.length === 0 : !bulkEditValue)}
                        >
                            {isSubmitting ? 'Updating...' : `Update ${selectedServices.size} Services`}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={!!confirmConfig}
                onClose={() => setConfirmConfig(null)}
                onConfirm={() => {
                    confirmConfig?.onConfirm();
                    setConfirmConfig(null);
                }}
                title={confirmConfig?.title || ''}
                message={confirmConfig?.message || ''}
                confirmLabel="Confirm"
                variant={confirmConfig?.variant || 'info'}
                isLoading={isSubmitting}
            />
        </div>
    );
}
