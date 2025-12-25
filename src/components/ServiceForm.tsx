import React, { useState, useEffect } from 'react';
import { Service, ServiceCategoryData, ServiceTypeData, EnvironmentData, TeamData, Tag } from '../types/service';
import { api } from '../api/client';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { SearchableSelect } from './ui/SearchableSelect';
import { Globe, Database, Info, X, Tag as TagIcon, Eye, EyeOff, Key, ImageIcon } from 'lucide-react';

interface ServiceFormProps {
    initialData?: Partial<Service>;
    categories: ServiceCategoryData[];
    serviceTypes?: ServiceTypeData[];
    environments?: EnvironmentData[];
    teams?: TeamData[];
    onSubmit: (data: Partial<Service>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function ServiceForm({ initialData, categories, serviceTypes = [], environments = [], teams = [], onSubmit, onCancel, isLoading }: ServiceFormProps) {
    const [formData, setFormData] = useState<Partial<Service>>(initialData || {
        name: '',
        category_id: '',
        service_type_id: '',
        environment_id: '',
        team_id: '',
        ip_address: '',
        port: undefined,
        notes: '',
        isFeatured: false,
        documentation: '',
        dashboard: '',
        pdb_name: '',
        db_username: '',
        db_password: '',
        service_username: '',
        service_password: '',
        url: '',
        status: 'Active' as any,
        db_connection: '',
        logo_url: ''
    });

    const [selectedTags, setSelectedTags] = useState<string[]>(
        initialData?.tags?.map(t => typeof t === 'string' ? t : t.name) || []
    );
    const [showDBPassword, setShowDBPassword] = useState(false);
    const [showServicePassword, setShowServicePassword] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setSelectedTags(initialData.tags?.map(t => typeof t === 'string' ? t : t.name) || []);
        }
    }, [initialData]);

    const [availableCategories, setAvailableCategories] = useState<ServiceCategoryData[]>(categories);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (name === 'service_type_id') {
            setFormData(prev => ({
                ...prev,
                service_type_id: value,
                category_id: ''
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                name === 'port' ? (value ? parseInt(value) : undefined) : value
        }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const { url } = await api.uploadIcon(file);
            setFormData(prev => ({ ...prev, logo_url: url }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Icon upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            tags: selectedTags as any
        });
    };

    const addTag = (tagName: string) => {
        if (!selectedTags.includes(tagName)) {
            setSelectedTags([...selectedTags, tagName]);
        }
    };

    const removeTag = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter(t => t !== tagToRemove));
    };

    const selectedType = serviceTypes.find(t => t.id === formData.service_type_id)?.name;
    const isDatabase = selectedType === 'Database';
    const isWebLogic = selectedType === 'WebLogic';
    const showDatabaseFields = isDatabase || isWebLogic;

    useEffect(() => {
        if (formData.service_type_id) {
            api.getCategoriesForType(formData.service_type_id)
                .then(setAvailableCategories)
                .catch(() => setAvailableCategories(categories));

            api.getTagsForType(formData.service_type_id)
                .then(setAvailableTags)
                .catch(() => setAvailableTags([]));
        } else {
            setAvailableCategories(categories);
            setAvailableTags([]);
        }
    }, [formData.service_type_id, categories]);


    const renderTags = () => (
        <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2 pb-2 border-b-2 border-orange-500/20 mb-4">
                <TagIcon className="h-4 w-4 text-orange-500" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                    <button
                        key={tag.id}
                        type="button"
                        onClick={() => addTag(tag.name)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border transition-all ${selectedTags.includes(tag.name)
                            ? 'bg-blue-50 text-blue-700 border-blue-200 opacity-50'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-blue-50'
                            }`}
                    >
                        {tag.name}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
                {selectedTags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1"><X className="h-2 w-2" /></button>
                    </span>
                ))}
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2 pb-2 border-b-2 border-blue-500/20 mb-4">
                            <Info className="h-4 w-4 text-blue-500" /> Basic Information
                        </h3>

                        <Input
                            label="Service Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g. Identity Provider"
                            required
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Select label="Service Type" name="service_type_id" value={formData.service_type_id} onChange={handleChange} required>
                                <option value="">Select Type</option>
                                {serviceTypes.map(type => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </Select>

                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                                    Service Icon
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="relative group">
                                        <div className="h-12 w-12 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-colors group-hover:border-blue-400">
                                            {formData.logo_url ? (
                                                <img
                                                    src={(formData.logo_url.startsWith('http') || formData.logo_url.startsWith('data:')) ? formData.logo_url : `http://localhost:5000${formData.logo_url}`}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon className="h-5 w-5 text-slate-400" />
                                            )}
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            disabled={isUploading}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] text-slate-500 leading-tight">
                                            {formData.logo_url ? 'Click to change icon' : 'Upload PNG, JPG or SVG'}
                                        </p>
                                        <p className="text-[10px] text-slate-400">Max size 5MB</p>
                                    </div>
                                    {formData.logo_url && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, logo_url: '' }))}
                                            className="p-1 hover:bg-red-50 text-red-400 rounded transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <SearchableSelect
                                label="Category"
                                value={formData.category_id || ''}
                                onChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                                options={availableCategories}
                                required
                                disabled={!formData.service_type_id}
                                placeholder={formData.service_type_id ? 'Select Category' : 'Choose Type First'}
                            />
                        </div>


                        {/* Database Info */}
                        {showDatabaseFields && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2 pb-2 border-b-2 border-indigo-500/20 mb-4">
                                    <Database className="h-4 w-4 text-indigo-500" /> Database Info
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {isDatabase && (
                                        <Input
                                            label="PDB Name"
                                            name="pdb_name"
                                            value={formData.pdb_name || ''}
                                            onChange={handleChange}
                                            placeholder="e.g. ORCLPDB1"
                                            required
                                        />
                                    )}
                                    <Input
                                        label="DB Username"
                                        name="db_username"
                                        value={formData.db_username || ''}
                                        onChange={handleChange}
                                        placeholder="e.g. app_user"
                                    />
                                    <Input
                                        label="Connection String"
                                        name="db_connection"
                                        value={formData.db_connection || ''}
                                        onChange={handleChange}
                                        placeholder="e.g. //localhost:1521/ORCL"
                                    />
                                    <div className="relative">
                                        <Input
                                            label="DB Password"
                                            name="db_password"
                                            type={showDBPassword ? "text" : "password"}
                                            value={formData.db_password || ''}
                                            onChange={handleChange}
                                            placeholder="Database password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowDBPassword(!showDBPassword)}
                                            className="absolute right-3 top-[32px] text-slate-400 hover:text-slate-600"
                                        >
                                            {showDBPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Infrastructure */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2 pb-2 border-b-2 border-emerald-500/20 mb-4">
                            <Globe className="h-4 w-4 text-emerald-500" /> Infrastructure Details
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                            <Select label="Environment" name="environment_id" value={formData.environment_id || ''} onChange={handleChange} required>
                                <option value="">Select Environment</option>
                                {environments.map(env => (
                                    <option key={env.id} value={env.id}>{env.name}</option>
                                ))}
                            </Select>

                            <Input
                                label="IP Address"
                                name="ip_address"
                                value={formData.ip_address}
                                onChange={handleChange}
                                placeholder="0.0.0.0"
                            />
                        </div>

                        <Input
                            label="Port"
                            name="port"
                            type="number"
                            value={formData.port || ''}
                            onChange={handleChange}
                            placeholder="8080"
                        />

                        {!isDatabase && (
                            <>
                                <Input
                                    label="Service URL"
                                    name="url"
                                    value={formData.url || ''}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <SearchableSelect
                                        label="Team"
                                        value={formData.team_id || ''}
                                        onChange={(value) => setFormData(prev => ({ ...prev, team_id: value }))}
                                        options={teams}
                                        placeholder="Select Team (Optional)"
                                    />
                                </div>
                            </>
                        )}
                        {isDatabase && (
                            <div className="pt-4 border-t border-slate-100 mt-4">
                                {renderTags()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">

                    {/* Credentials - WebLogic only */}
                    {isWebLogic ? (
                        <div className="space-y-4">
                            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2 pb-2 border-b-2 border-amber-500/20 mb-4">
                                <Key className="h-4 w-4 text-amber-500" /> Credentials
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    label="Username"
                                    name="service_username"
                                    value={formData.service_username || ''}
                                    onChange={handleChange}
                                    placeholder="e.g. admin"
                                />
                                <div className="relative">
                                    <Input
                                        label="Password"
                                        name="service_password"
                                        value={formData.service_password || ''}
                                        onChange={handleChange}
                                        type={showServicePassword ? "text" : "password"}
                                        placeholder="Service password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowServicePassword(!showServicePassword)}
                                        className="absolute right-3 top-[32px] text-slate-400 hover:text-slate-600"
                                    >
                                        {showServicePassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div></div> // Spacer for left column if no credentials
                    )}

                    {/* Tags - Show here if NOT Database */}
                    {!isDatabase && renderTags()}
                </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3 z-10 mt-auto">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" isLoading={isLoading}>{initialData?.id ? 'Update Service' : 'Create Service'}</Button>
            </div>
        </form>
    );
}
