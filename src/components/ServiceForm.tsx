import React, { useState } from 'react';
import { Service, ServiceCategoryData, ServiceTypeData, ServiceStatus, ServiceEnvironment } from '../types/service';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Globe, Database, Key, Info, Save, X, Tag } from 'lucide-react';

interface ServiceFormProps {
    initialData?: Partial<Service>;
    categories: ServiceCategoryData[];
    serviceTypes?: ServiceTypeData[];
    onSubmit: (data: Partial<Service>) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function ServiceForm({ initialData, categories, serviceTypes = [], onSubmit, onCancel, isLoading }: ServiceFormProps) {
    const [formData, setFormData] = useState<Partial<Service>>({
        name: '',
        category_id: '',
        service_type_id: '',
        status: 'Active' as ServiceStatus,
        environment: 'Dev' as ServiceEnvironment,
        url: '',
        ip_address: '',
        port: undefined,
        owner: '',
        team: '',
        notes: '',
        isFeatured: false,
        documentation: '',
        dashboard: '',
        db_connection: '',
        db_username: '',
        service_username: '',
        service_password: '',
        tags: [],
        ...initialData
    });

    const [tagInput, setTagInput] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>(
        initialData?.tags?.map(t => typeof t === 'string' ? t : t.name) || []
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                name === 'port' ? (value ? parseInt(value) : undefined) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            tags: selectedTags as any // The backend handles string array or tag objects
        });
    };

    const addTag = () => {
        if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
            setSelectedTags([...selectedTags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setSelectedTags(selectedTags.filter(t => t !== tagToRemove));
    };

    const selectedType = serviceTypes.find(t => t.id === formData.service_type_id)?.name;
    const isDatabase = selectedType === 'Database';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-500" /> Basic Information
                    </h3>

                    <Input
                        label="Service Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Identity Provider"
                        required
                        className="w-full"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Category" name="category_id" value={formData.category_id} onChange={handleChange} required>
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </Select>

                        <Select label="Type" name="service_type_id" value={formData.service_type_id} onChange={handleChange} required>
                            <option value="">Select Type</option>
                            {serviceTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <Select label="Status" name="status" value={formData.status} onChange={handleChange}>
                            {isDatabase ? (
                                <>
                                    <option value="Active">Active</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Deprecated">Deprecated</option>
                                </>
                            ) : (
                                <>
                                    <option value="Online">Online</option>
                                    <option value="Offline">Offline</option>
                                    <option value="Maintenance">Maintenance</option>
                                </>
                            )}
                        </Select>
                    </div>
                </div>

                {/* Access Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Globe className="h-4 w-4 text-emerald-500" /> Access & Environment
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Environment" name="environment" value={formData.environment} onChange={handleChange}>
                            <option value="Production">Production</option>
                            <option value="Test">Test</option>
                            <option value="Dev">Dev</option>
                        </Select>

                        <Input
                            label="IP Address"
                            name="ip_address"
                            value={formData.ip_address}
                            onChange={handleChange}
                            placeholder="0.0.0.0"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <Input
                                label="Service URL"
                                name="url"
                                value={formData.url}
                                onChange={handleChange}
                                placeholder="https://..."
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Team"
                            name="team"
                            value={formData.team}
                            onChange={handleChange}
                            placeholder="Infrastructure"
                            required
                        />
                        <Input
                            label="Owner"
                            name="owner"
                            value={formData.owner}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                {/* Credentials */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Key className="h-4 w-4 text-amber-500" /> Credentials
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Username"
                            name="service_username"
                            value={formData.service_username}
                            onChange={handleChange}
                        />
                        <Input
                            label="Password"
                            name="service_password"
                            value={formData.service_password}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Database Info */}
                <div className={`space-y-4 transition-all ${isDatabase ? 'opacity-100' : 'opacity-40 grayscale pointer-events-none'}`}>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Database className="h-4 w-4 text-indigo-500" /> Database Info
                    </h3>
                    <Input
                        label="Connection String"
                        name="db_connection"
                        value={formData.db_connection}
                        onChange={handleChange}
                        placeholder="host:port/dbname"
                        disabled={!isDatabase}
                    />
                    <Input
                        label="DB Username"
                        name="db_username"
                        value={formData.db_username}
                        onChange={handleChange}
                        disabled={!isDatabase}
                    />
                </div>

                {/* WebLogic / Tags */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Tag className="h-4 w-4 text-orange-500" /> Tags & Labels
                    </h3>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                label="Add Tag"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                placeholder="e.g. docker, oracle"
                            />
                        </div>
                        <Button type="button" variant="secondary" onClick={addTag} className="self-end mb-[2px]">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedTags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 animate-in fade-in zoom-in duration-200">
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tag)}
                                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-blue-100 text-blue-400 hover:text-blue-600 transition-all"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                        {selectedTags.length === 0 && (
                            <span className="text-xs text-slate-400 italic">No tags added yet</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    <Save className="h-4 w-4 mr-2" /> {initialData?.id ? 'Update Service' : 'Create Service'}
                </Button>
            </div>
        </form>
    );
}
