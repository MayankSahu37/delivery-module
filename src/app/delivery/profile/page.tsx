'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DeliveryAgent } from '@/types';
import { User, Mail, Calendar, TrendingUp, Package, CheckCircle, Truck, XCircle } from 'lucide-react';

export default function ProfilePage() {
    const [agent, setAgent] = useState<DeliveryAgent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container min-h-screen py-8 flex items-center justify-center">
                <div className="text-muted-foreground animate-pulse">Loading profile...</div>
            </div>
        );
    }

    if (error || !agent) {
        return (
            <div className="container py-8">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {error || 'Failed to load profile'}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/10">
            <div className="container py-8 max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">My Profile</h1>
                    <p className="text-muted-foreground">Your account information and statistics</p>
                </div>

                {/* Profile Card */}
                <div className="card mb-8 animate-fade-in">
                    <div className="flex items-start gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">{agent.name}</h2>
                            <div className="space-y-2 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <span>{agent.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Joined {new Date(agent.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                {agent.is_active ? (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                                        Inactive
                                    </span>
                                )}
                            </div>
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
