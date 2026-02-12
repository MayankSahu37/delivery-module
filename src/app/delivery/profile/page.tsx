'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DeliveryAgent } from '@/types';
import {
    User, Mail, Calendar, TrendingUp, Package, CheckCircle, Truck,
    XCircle, Phone, MapPin, Car, Edit3, Save, X, Camera, Hash, Loader2
} from 'lucide-react';

interface ProfileFormData {
    name: string;
    email: string;
    phone: string;
    age: string;
    address: string;
    vehicle_number: string;
}

export default function ProfilePage() {
    const [agent, setAgent] = useState<DeliveryAgent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<ProfileFormData>({
        name: '',
        email: '',
        phone: '',
        age: '',
        address: '',
        vehicle_number: '',
    });
    const router = useRouter();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/delivery/profile');
            if (res.status === 401) {
                router.push('/delivery/login');
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch profile');

            const data = await res.json();
            setAgent(data.agent);
            setFormData({
                name: data.agent.name || '',
                email: data.agent.email || '',
                phone: data.agent.phone || '',
                age: data.agent.age ? String(data.agent.age) : '',
                address: data.agent.address || '',
                vehicle_number: data.agent.vehicle_number || '',
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof ProfileFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate on client side too
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File size too large. Maximum 5MB allowed.');
            return;
        }

        setUploadingImage(true);
        setError('');

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const res = await fetch('/api/delivery/profile/upload', {
                method: 'POST',
                body: formDataUpload,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to upload image');
            }

            // Update agent state with new image URL
            setAgent(prev => prev ? { ...prev, profile_image_url: data.url } : prev);
            setSuccessMessage('Profile picture updated!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploadingImage(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            const payload: Record<string, any> = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                age: formData.age ? Number(formData.age) : null,
                address: formData.address || null,
                vehicle_number: formData.vehicle_number || null,
            };

            const res = await fetch('/api/delivery/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            setAgent(prev => prev ? { ...prev, ...data.agent } : data.agent);
            setIsEditing(false);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (agent) {
            setFormData({
                name: agent.name || '',
                email: agent.email || '',
                phone: agent.phone || '',
                age: agent.age ? String(agent.age) : '',
                address: agent.address || '',
                vehicle_number: agent.vehicle_number || '',
            });
        }
        setIsEditing(false);
        setError('');
    };

    if (loading) {
        return (
            <div className="container min-h-screen py-8 flex items-center justify-center">
                <div className="profile-loading">
                    <div className="profile-loading-avatar"></div>
                    <div className="profile-loading-lines">
                        <div className="profile-loading-line" style={{ width: '60%' }}></div>
                        <div className="profile-loading-line" style={{ width: '40%' }}></div>
                        <div className="profile-loading-line" style={{ width: '80%' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !agent) {
        return (
            <div className="container py-8">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {error || 'Failed to load profile'}
                </div>
            </div>
        );
    }

    if (!agent) return null;

    const profileCompletion = (() => {
        const fields = [agent.name, agent.email, agent.phone, agent.age, agent.address, agent.vehicle_number, agent.profile_image_url];
        const filled = fields.filter(f => f !== null && f !== undefined && f !== '').length;
        return Math.round((filled / fields.length) * 100);
    })();

    return (
        <div className="min-h-screen bg-muted/10">
            <div className="container py-8 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">My Profile</h1>
                        <p className="text-muted-foreground">Manage your account information and personal details</p>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="profile-edit-btn"
                            id="edit-profile-btn"
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit Profile</span>
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="profile-cancel-btn"
                                disabled={saving}
                                id="cancel-edit-btn"
                            >
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                            </button>
                            <button
                                onClick={handleSave}
                                className="profile-save-btn"
                                disabled={saving}
                                id="save-profile-btn"
                            >
                                <Save className="w-4 h-4" />
                                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Toast messages */}
                {successMessage && (
                    <div className="profile-toast profile-toast-success animate-fade-in">
                        <CheckCircle className="w-5 h-5" />
                        <span>{successMessage}</span>
                    </div>
                )}
                {error && isEditing && (
                    <div className="profile-toast profile-toast-error animate-fade-in">
                        <XCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Profile Completion Bar */}
                {profileCompletion < 100 && (
                    <div className="card mb-6 animate-fade-in">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-muted-foreground">Profile Completion</span>
                            <span className="text-sm font-bold" style={{ color: profileCompletion > 70 ? '#16a34a' : profileCompletion > 40 ? '#f59e0b' : '#ef4444' }}>
                                {profileCompletion}%
                            </span>
                        </div>
                        <div className="profile-progress-bar">
                            <div
                                className="profile-progress-fill"
                                style={{
                                    width: `${profileCompletion}%`,
                                    background: profileCompletion > 70
                                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                                        : profileCompletion > 40
                                            ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                            : 'linear-gradient(90deg, #ef4444, #f87171)',
                                }}
                            ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Complete your profile to get verified and start receiving more deliveries
                        </p>
                    </div>
                )}

                {/* Profile Card */}
                <div className="card mb-8 animate-fade-in">
                    <div className="profile-card-header">
                        {/* Avatar Section */}
                        <div className="profile-avatar-section">
                            <div
                                className={`profile-avatar-wrapper ${isEditing ? 'profile-avatar-clickable' : ''}`}
                                onClick={() => isEditing && fileInputRef.current?.click()}
                            >
                                {agent.profile_image_url ? (
                                    <img
                                        src={agent.profile_image_url}
                                        alt={agent.name}
                                        className="profile-avatar-image"
                                        id="profile-avatar"
                                    />
                                ) : (
                                    <div className="profile-avatar-placeholder">
                                        <User className="w-12 h-12 text-white" />
                                    </div>
                                )}
                                {uploadingImage && (
                                    <div className="profile-avatar-upload-overlay">
                                        <Loader2 className="w-6 h-6 text-white profile-spin" />
                                    </div>
                                )}
                                {isEditing && !uploadingImage && (
                                    <div className="profile-avatar-edit-badge">
                                        <Camera className="w-4 h-4" />
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleImageUpload}
                                    className="profile-file-input-hidden"
                                    id="input-profile-image"
                                />
                            </div>
                            <div className="profile-name-section">
                                <h2 className="text-2xl font-bold">{agent.name}</h2>
                                <p className="text-muted-foreground text-sm">{agent.email}</p>
                                <div className="mt-2">
                                    {agent.is_active ? (
                                        <span className="profile-status-badge profile-status-active">
                                            <div className="profile-status-dot"></div>
                                            Active
                                        </span>
                                    ) : (
                                        <span className="profile-status-badge profile-status-inactive">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="profile-joined-badge">
                            <Calendar className="w-4 h-4" />
                            <span>Joined {new Date(agent.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {/* Profile Details / Edit Form */}
                <div className="card mb-8 animate-fade-in">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Personal Information
                    </h3>

                    <div className="profile-form-grid">


                        {/* Name */}
                        <div className="profile-form-field">
                            <label className="profile-form-label">
                                <User className="w-4 h-4" />
                                Full Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="profile-form-input"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Enter your full name"
                                    id="input-name"
                                />
                            ) : (
                                <div className="profile-form-value">{agent.name}</div>
                            )}
                            {!isEditing && <span className="profile-form-hint">From Google Account</span>}
                        </div>

                        {/* Email */}
                        <div className="profile-form-field">
                            <label className="profile-form-label">
                                <Mail className="w-4 h-4" />
                                Email Address
                            </label>
                            {isEditing ? (
                                <input
                                    type="email"
                                    className="profile-form-input"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="Enter your email"
                                    id="input-email"
                                />
                            ) : (
                                <div className="profile-form-value">{agent.email}</div>
                            )}
                            {!isEditing && <span className="profile-form-hint">From Google Account</span>}
                        </div>

                        {/* Phone */}
                        <div className="profile-form-field">
                            <label className="profile-form-label">
                                <Phone className="w-4 h-4" />
                                Phone Number
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    className="profile-form-input"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="+91 9876543210"
                                    id="input-phone"
                                />
                            ) : (
                                <div className={`profile-form-value ${!agent.phone ? 'profile-form-empty' : ''}`}>
                                    {agent.phone || 'Not provided'}
                                </div>
                            )}
                        </div>

                        {/* Age */}
                        <div className="profile-form-field">
                            <label className="profile-form-label">
                                <Hash className="w-4 h-4" />
                                Age
                            </label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    className="profile-form-input"
                                    value={formData.age}
                                    onChange={(e) => handleInputChange('age', e.target.value)}
                                    placeholder="25"
                                    min="18"
                                    max="100"
                                    id="input-age"
                                />
                            ) : (
                                <div className={`profile-form-value ${!agent.age ? 'profile-form-empty' : ''}`}>
                                    {agent.age ? `${agent.age} years` : 'Not provided'}
                                </div>
                            )}
                        </div>

                        {/* Address */}
                        <div className="profile-form-field profile-form-field-full">
                            <label className="profile-form-label">
                                <MapPin className="w-4 h-4" />
                                Address
                            </label>
                            {isEditing ? (
                                <textarea
                                    className="profile-form-input profile-form-textarea"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    placeholder="Enter your full address"
                                    rows={3}
                                    id="input-address"
                                />
                            ) : (
                                <div className={`profile-form-value ${!agent.address ? 'profile-form-empty' : ''}`}>
                                    {agent.address || 'Not provided'}
                                </div>
                            )}
                        </div>

                        {/* Vehicle Number */}
                        <div className="profile-form-field profile-form-field-full">
                            <label className="profile-form-label">
                                <Car className="w-4 h-4" />
                                Vehicle Number
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="profile-form-input"
                                    value={formData.vehicle_number}
                                    onChange={(e) => handleInputChange('vehicle_number', e.target.value.toUpperCase())}
                                    placeholder="MH 12 AB 1234"
                                    id="input-vehicle"
                                />
                            ) : (
                                <div className={`profile-form-value ${!agent.vehicle_number ? 'profile-form-empty' : ''}`}>
                                    {agent.vehicle_number || 'Not provided'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                {agent.stats && (
                    <div>
                        <h3 className="text-2xl font-semibold mb-4">Delivery Statistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                            <div className="card bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-blue-500 rounded-lg">
                                        <TrendingUp className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium mb-1">Total Accepted</p>
                                        <p className="text-3xl font-bold text-blue-600">{agent.stats.totalAccepted}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-green-500 rounded-lg">
                                        <CheckCircle className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium mb-1">Total Delivered</p>
                                        <p className="text-3xl font-bold text-green-600">{agent.stats.totalDelivered}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-purple-500 rounded-lg">
                                        <Package className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium mb-1">Active Deliveries</p>
                                        <p className="text-3xl font-bold text-purple-600">{agent.stats.activeDeliveries}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-orange-500 rounded-lg">
                                        <XCircle className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground font-medium mb-1">Orders Ignored</p>
                                        <p className="text-3xl font-bold text-orange-600">{agent.stats.ignoredCount || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
