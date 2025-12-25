import { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { Service, ServiceCategoryData, ServiceTypeData, Tag as TagData, EnvironmentData, TeamData } from '../types/service';
import { Button } from '../components/ui/Button';
import { Header } from '../components/Header';
import { ServiceForm } from '../components/ServiceForm';
import { Modal } from '../components/ui/Modal';
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
    Users
} from 'lucide-react';

export function ManageServices() {
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

    // Service Type management state
    const [newTypeName, setNewTypeName] = useState('');
    const [isAddingType, setIsAddingType] = useState(false);
    const [editingType, setEditingType] = useState<ServiceTypeData | null>(null);

    // Tag management state
    const [newTagName, setNewTagName] = useState('');
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [editingTag, setEditingTag] = useState<TagData | null>(null);

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
        } catch (err) {
            console.error('Failed to fetch management data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveService = async (data: Partial<Service>) => {
        try {
            setIsSubmitting(true);
            if (editingService) {
                await api.updateService(editingService.id, data);
            } else {
                await api.createService(data);
            }
            await fetchData();
            setEditingService(null);
            setIsAddingService(false);
        } catch (err) {
            console.error('Save failed:', err);
            alert('Action failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteService = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await api.deleteService(id);
                await fetchData();
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            setIsSubmitting(true);
            if (editingCategory) {
                await api.updateCategory(editingCategory.id, { name: newCategoryName });
            } else {
                await api.createCategory({ name: newCategoryName });
            }
            await fetchData();
            setNewCategoryName('');
            setIsAddingCategory(false);
            setEditingCategory(null);
        } catch (err) {
            console.error('Category action failed:', err);
            alert('Failed to save category.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete category "${name}"? This will not delete the services within it.`)) {
            try {
                await api.deleteCategory(id);
                await fetchData();
            } catch (err) {
                console.error('Category delete failed:', err);
                alert('Failed to delete category.');
            }
        }
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
            setNewTypeName('');
            setIsAddingType(false);
            setEditingType(null);
        } catch (err) {
            console.error('Type action failed:', err);
            alert('Failed to save service type.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteType = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete service type "${name}"?`)) {
            try {
                await api.deleteServiceType(id);
                await fetchData();
            } catch (err) {
                console.error('Type delete failed:', err);
                alert('Failed to delete service type.');
            }
        }
    };

    const handleAddTag = async () => {
        if (!newTagName.trim()) return;
        try {
            setIsSubmitting(true);
            if (editingTag) {
                await api.updateTag(editingTag.id, { name: newTagName });
            } else {
                await api.createTag({ name: newTagName });
            }
            await fetchData();
            setNewTagName('');
            setIsAddingTag(false);
            setEditingTag(null);
        } catch (err) {
            console.error('Tag action failed:', err);
            alert('Failed to save tag.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTag = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete tag "${name}"?`)) {
            try {
                await api.deleteTag(id);
                await fetchData();
            } catch (err) {
                console.error('Tag delete failed:', err);
                alert('Failed to delete tag.');
            }
        }
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
            setNewEnvName('');
            setIsAddingEnv(false);
            setEditingEnv(null);
        } catch (err) {
            console.error('Environment action failed:', err);
            alert('Failed to save environment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteEnvironment = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete environment "${name}"?`)) {
            try {
                await api.deleteEnvironment(id);
                await fetchData();
            } catch (err) {
                console.error('Environment delete failed:', err);
                alert('Failed to delete environment.');
            }
        }
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
            setNewTeamName('');
            setIsAddingTeam(false);
            setEditingTeam(null);
        } catch (err) {
            console.error('Team action failed:', err);
            alert('Failed to save team.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTeam = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete team "${name}"?`)) {
            try {
                await api.deleteTeam(id);
                await fetchData();
            } catch (err) {
                console.error('Team delete failed:', err);
                alert('Failed to delete team.');
            }
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
        if (window.confirm(`Are you sure you want to delete ${selectedServices.size} services?`)) {
            try {
                setIsSubmitting(true);
                await Promise.all(Array.from(selectedServices).map(id => api.deleteService(id)));
                await fetchData();
                setSelectedServices(new Set());
            } catch (err) {
                console.error('Bulk delete failed:', err);
                alert('Failed to delete some services.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const filteredAndSortedServices = useMemo(() => {
        const result = services.filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.owner.toLowerCase().includes(searchTerm.toLowerCase());
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
        return categories.filter(cat => cat.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [categories, searchTerm]);

    const filteredTypes = useMemo(() => {
        return serviceTypes.filter(type => type.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [serviceTypes, searchTerm]);

    const filteredTags = useMemo(() => {
        return tags.filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [tags, searchTerm]);

    const filteredEnvironments = useMemo(() => {
        return environments.filter(env => env.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [environments, searchTerm]);

    const filteredTeams = useMemo(() => {
        return teams.filter(team => team.name.toLowerCase().includes(searchTerm.toLowerCase()));
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

                        {/* Search & Filters (Only for Services) */}
                        {activeTab === 'services' && (
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2 mr-2">
                                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filters</span>
                                </div>

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
                                    <option value="Production">Production</option>
                                    <option value="Test">Test</option>
                                    <option value="Dev">Dev</option>
                                </select>

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
                                                <th
                                                    className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 transition-colors"
                                                    onClick={() => handleSort('status')}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        Status
                                                        {sortField === 'status' && (sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                                    </div>
                                                </th>
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
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-slate-900 leading-none mb-1">{service.name}</span>
                                                            <span className="text-xs text-slate-400 font-mono truncate max-w-[200px]" title={service.url}>{service.url}</span>
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
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-sm ${(service.status === 'Active' || service.status === 'Online') ? 'bg-green-500 text-white border-green-600' :
                                                            service.status === 'Maintenance' ? 'bg-yellow-400 text-slate-900 border-yellow-500' :
                                                                service.status === 'Offline' ? 'bg-red-500 text-white border-red-600' :
                                                                    'bg-slate-400 text-white border-slate-500'
                                                            }`}>
                                                            <div className={`h-1.5 w-1.5 rounded-full ${(service.status === 'Active' || service.status === 'Online') ? 'bg-white animate-pulse' : 'bg-slate-200'}`} />
                                                            {service.status}
                                                        </span>
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
                                            {filteredCategories.map((cat) => (
                                                <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 group">
                                                    <span className="font-medium text-slate-700">{cat.name}</span>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingCategory(cat);
                                                                setNewCategoryName(cat.name);
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
                                            ))}
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
                                        <div className="grid grid-cols-1 gap-2">
                                            {filteredTypes.map((type) => (
                                                <div key={type.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 group">
                                                    <span className="font-medium text-slate-700">{type.name}</span>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                            ))}
                                        </div>
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
                                            {filteredTags.map((tag) => (
                                                <div key={tag.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 group">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                        <span className="font-medium text-slate-700">{tag.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                setEditingTag(tag);
                                                                setNewTagName(tag.name);
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
                                            ))}
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
                    maxWidth="2xl"
                >
                    <ServiceForm
                        initialData={editingService || undefined}
                        categories={categories}
                        serviceTypes={serviceTypes}
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
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => {
                                setIsAddingCategory(false);
                                setEditingCategory(null);
                                setNewCategoryName('');
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
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => {
                                setIsAddingTag(false);
                                setEditingTag(null);
                                setNewTagName('');
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
        </div>
    );
}
