'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OrderCard from '../components/OrderCard';
import { Order } from '@/types';
import { Package } from 'lucide-react';

export default function OrdersPage() {
    const [availableOrders, setAvailableOrders] = useState<(Order & { total_items: number })[]>([]);
    const [assignedOrders, setAssignedOrders] = useState<(Order & { total_items: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // Fetch both available and assigned (accepted) orders
            const [availableRes, assignedRes] = await Promise.all([
                fetch('/api/delivery/orders'),
                fetch('/api/delivery/accepted')
            ]);

            if (availableRes.status === 401 || assignedRes.status === 401) {
                router.push('/delivery/login');
                return;
            }

            if (!availableRes.ok) throw new Error('Failed to fetch available orders');

            const availableData = await availableRes.json();
            const assignedData = assignedRes.ok ? await assignedRes.json() : { orders: [] };

            setAvailableOrders(availableData.orders || []);
            setAssignedOrders(assignedData.orders || []);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container min-h-screen py-8 flex items-center justify-center">
                <div className="text-muted-foreground animate-pulse">Loading orders...</div>
            </div>
        );
    }

    const hasOrders = availableOrders.length > 0 || assignedOrders.length > 0;

    return (
        <div className="min-h-screen bg-muted/10">
            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">All Orders</h1>
                    <p className="text-muted-foreground">
                        View all your assigned deliveries and available orders
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                {!hasOrders ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                            <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">No Orders Found</h2>
                        <p className="text-muted-foreground mb-6">
                            There are currently no orders available or assigned to you.
                        </p>
                        <button
                            onClick={() => { setLoading(true); fetchOrders(); }}
                            className="btn btn-outline"
                        >
                            Refresh List
                        </button>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Assigned Orders Section */}
                        {assignedOrders.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <h2 className="text-2xl font-semibold">Assigned to You</h2>
                                    <span className="badge badge-primary">{assignedOrders.length}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                                    {assignedOrders.map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            showCompleteButton={true}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Available Orders Section */}
                        {availableOrders.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <h2 className="text-2xl font-semibold">Available for Pickup</h2>
                                    <span className="badge badge-secondary">{availableOrders.length}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                                    {availableOrders.map((order) => (
                                        <OrderCard
                                            key={order.id}
                                            order={order}
                                            showCompleteButton={false}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
