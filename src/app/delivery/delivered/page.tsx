'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types';
import { Truck, Clock, CheckCircle2 } from 'lucide-react';

interface DeliveredOrder extends Order {
    total_items: number;
    assigned_at: string;
    delivered_at: string;
}

export default function DeliveredOrdersPage() {
    const [orders, setOrders] = useState<DeliveredOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchDeliveredOrders();
    }, []);

    const fetchDeliveredOrders = async () => {
        try {
            const res = await fetch('/api/delivery/delivered');
            if (res.status === 401) {
                router.push('/delivery/login');
                return;
            }
            if (!res.ok) throw new Error('Failed to fetch delivered orders');

            const data = await res.json();
            setOrders(data.orders);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="container min-h-screen py-8 flex items-center justify-center">
                <div className="text-muted-foreground animate-pulse">Loading delivered orders...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/10">
            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Delivered Orders</h1>
                    <p className="text-muted-foreground">
                        Your completed delivery history
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                            <Truck className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">No Delivered Orders</h2>
                        <p className="text-muted-foreground mb-6">
                            You haven't completed any deliveries yet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in">
                        {orders.map((order) => (
                            <div key={order.id} className="card">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <div>
                                                <span className="text-sm font-mono text-muted-foreground">
                                                    #{order.id.slice(0, 8)}
                                                </span>
                                                <h3 className="font-semibold text-lg">
                                                    {order.total_items} Items
                                                </h3>
                                            </div>
                                            <span className="badge badge-delivered">DELIVERED</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                                            <div>
                                                <span className="text-muted-foreground">Total Amount:</span>
                                                <span className="ml-2 font-semibold text-primary">
                                                    ${order.total_price.toFixed(2)}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Delivery Address:</span>
                                                <span className="ml-2 font-medium truncate">
                                                    {order.delivery_address}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                <span>Delivered: {new Date(order.delivered_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
